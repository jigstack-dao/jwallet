import { ReactComponent as SwapTxIcon } from '@/ui/assets/jwallet/transaction/swap.svg';
import { ReactComponent as SendTxIcon } from '@/ui/assets/jwallet/transaction/send.svg';
import { ReactComponent as BuyTxIcon } from '@/ui/assets/jwallet/transaction/buy.svg';
import Scan from '@/ui/assets/jwallet/link.svg';
import Info from '@/ui/assets/jwallet/info.svg';
import './style.less';
import React, { ReactNode, useEffect, useState } from 'react';
import useCurrentAccount from '@/hooks/wallet/useCurrentAccount';
import { useWallet } from '@/ui/utils';
import { isAddress } from 'web3-utils';
import {
  TransactionPendingItem,
  TransactionsCompletedItem,
  TransactionType,
} from '@/background/service/transactionHistory';
import { uuid4 } from '@sentry/utils';
import { useAppContext } from '@/context';
import {
  prefixAmountTransaction,
  renderBalanceToken,
  shortenAddress,
} from '@/utils/format';
import moment from 'moment';
import { formatUnits } from 'ethers/lib/utils';
import useNetwork from '@/hooks/wallet/useNetwork';
import TrasactionDetailModal from '../TransactionDetailModal';
import { BigNumber, BigNumberish } from 'ethers';
import { ReactComponent as SantaTransactionIcon } from '@/ui/assets/jwallet/santa-transaction.svg';
import { ReactComponent as MiniSwapIcon } from '@/ui/assets/jwallet/ant-design_swap-outlined.svg';
import clsx from 'clsx';
import eventBus from '@/eventBus';
import { EVENTS } from '@/constant';
import { ActionTypes } from '@/context/actions';

export interface TxDetail {
  to: string;
  createdAt: string;
  status: string;
  amount: string;
  gasFee: string;
  txFee: string;
  totalAmount: string;
  hash: string;
  isCompleted?: boolean;
  pendingTx?: TransactionPendingItem;
}

const TX_DETAIL_DEFAULT = {
  to: '',
  createdAt: '',
  status: '',
  amount: '',
  gasFee: '',
  txFee: '',
  totalAmount: '',
  hash: '',
};

const ActivityTab = () => {
  const currentAccount = useCurrentAccount();
  const { currentNetwork } = useNetwork();
  const wallet = useWallet();
  const [txPending, setTxPending] = useState<TransactionPendingItem[]>([]);
  const [txCompleted, setTxCompleted] = useState<TransactionsCompletedItem[]>(
    []
  );
  const { appState } = useAppContext();
  const [openTxDetail, setOpenTxDetail] = useState(false);
  const [txDetail, setTxDetail] = useState<TxDetail>(TX_DETAIL_DEFAULT);

  const getScanLink = (tx: string) => {
    return `${currentNetwork.scanLink}/tx/${tx}`;
  };
  const { dispatch } = useAppContext();

  useEffect(() => {
    eventBus.addEventListener(EVENTS.TX_HISTORY.SUCCESS, (payload) => {
      dispatch({
        type: ActionTypes.UpdateActivitySectionRefresh,
        payload: uuid4(),
      });
    });

    return () => {
      eventBus.removeAllEventListeners(EVENTS.TX_HISTORY.SUCCESS);
    };
  }, []);

  useEffect(() => {
    void (async () => {
      if (!isAddress(currentAccount.address)) return;
      try {
        const _txPending = await wallet.getTransactionPending(
          currentAccount.address
        );
        setTxPending(
          _txPending.filter((tx) => tx.chainId === currentNetwork.chainId)
        );
        const _txCompleted = await wallet.getTransactionsCompleted(
          currentAccount.address
        );
        setTxCompleted(
          _txCompleted.filter((tx) => tx.chainId === currentNetwork.chainId)
        );
      } catch (error) {
        console.log(error);
      }
    })();
  }, [
    currentAccount.address,
    appState.activitySection.refresh,
    currentNetwork.chainId,
  ]);

  useEffect(() => {
    if (!openTxDetail || txDetail.hash == '') return;
    onOpenTxDetail(txDetail.hash);
  }, [txPending, txCompleted]);

  const onOpenTxDetail = (hash: string) => {
    const txDetailPending = txPending.find(
      (x) => x.hash?.toLowerCase() == hash?.toLowerCase()
    );
    if (txDetailPending) {
      const { to, value, createdAt } = txDetailPending;
      const { decimals, symbol } = txDetailPending.token;
      const amount = `${prefixAmountTransaction(
        to,
        currentAccount.address
      )}${renderBalanceToken(value, decimals, symbol)}`;
      setTxDetail({
        to,
        createdAt: moment(createdAt * 1000).format('LLL'),
        status: 'Pending',
        amount,
        gasFee: '0 ' + symbol,
        txFee: '0 ' + symbol,
        totalAmount: amount,
        hash: txDetailPending.hash,
        pendingTx: txDetailPending,
      });

      setOpenTxDetail(true);
      return;
    }

    const txDetailCompleted = txCompleted.find(
      (x) => x.transactionHash?.toLowerCase() == hash?.toLowerCase()
    );
    if (txDetailCompleted) {
      const txFee = BigNumber.from(txDetailCompleted.effectiveGasPrice).mul(
        BigNumber.from(txDetailCompleted.gasUsed)
      );
      const { to, value, createdAt, transactionHash, gasUsed, status } =
        txDetailCompleted;
      const { decimals, symbol } = txDetailCompleted.token;
      setTxDetail({
        to,
        createdAt: moment(new Date(createdAt * 1000)).format('LLL'),
        status: status == 1 ? 'Successful' : 'Rejected',
        amount: `${prefixAmountTransaction(
          to,
          currentAccount.address
        )}${renderBalanceToken(value, decimals, symbol)}`,
        gasFee: BigNumber.from(gasUsed).toString(),
        txFee: renderBalanceToken(txFee, decimals, symbol),
        totalAmount: renderBalanceToken(txFee.add(value), decimals, symbol),
        hash: transactionHash,
        isCompleted: true,
      });
      setOpenTxDetail(true);
    }
  };

  const closeTxDetail = () => {
    setOpenTxDetail(false);
    setTxDetail(TX_DETAIL_DEFAULT);
  };

  const getIcon = (transactionType: TransactionType, bg: string) => {
    return (
      <div className={`icon-status icon-status__${bg}`}>
        {transactionType === TransactionType.Swap ? (
          <SwapTxIcon />
        ) : transactionType === TransactionType.Buy ? (
          <BuyTxIcon />
        ) : (
          <SendTxIcon />
        )}
      </div>
    );
  };

  const renderStatusLabel = (
    status: string,
    color: string,
    transactionType: TransactionType
  ) => {
    return (
      <div className="flex items-center">
        {transactionType === TransactionType.Santa && (
          <div className="mr-[6px]">
            <SantaTransactionIcon
              className={clsx(
                'santa-icon',
                status === 'Rejected' && 'santa-icon__orange'
              )}
            />
          </div>
        )}
        {transactionType != TransactionType.Santa && (
          <div
            className={`rounded-full w-[6px] h-[6px] ${color} mr-[6px]`}
          ></div>
        )}
        <div>{status}</div>
      </div>
    );
  };

  const renderAmountText = (
    prefix: string,
    value: BigNumberish,
    decimals: number,
    symbol: string
  ) => {
    return `${prefix} ${Number(formatUnits(value, decimals)).toFixed(
      2
    )} ${symbol}`;
  };

  return (
    <div>
      {txPending.map((x) => {
        return (
          <div onClick={() => onOpenTxDetail(x.hash)} key={x.hash}>
            <TxHistoryCard
              status={renderStatusLabel(
                'Pending',
                'bg-white',
                x.transactionType
              )}
              txHash={x.hash}
              iconTx={getIcon(x.transactionType, 'white')}
              to={<span>To: {shortenAddress(x.to)}</span>}
              createAt={x.createdAt}
              value={x.value}
              token={x.token}
              amountBN={x.amount}
              amount={renderAmountText(
                x.to !== currentAccount.address ? '-' : '',
                x.amount,
                x.token.decimals,
                x.token.symbol
              )}
              scanLink={getScanLink(x.hash)}
              transactionType={x.transactionType}
              tokenTo={x.tokenTo}
              amountTo={x.amountTo}
            />
          </div>
        );
      })}
      {txCompleted.map((x) => {
        const isSuccess = x.status == 1;
        const isRejected = x.status == -1;
        if (isRejected) {
          return (
            <TxHistoryCard
              txStatus={-1}
              key={x.createdAt || ''}
              status={renderStatusLabel(
                'Canceled / Replaced',
                'bg-[#ffa877]',
                x.transactionType
              )}
              iconTx={<></>}
              to={<span>To: {shortenAddress(x.to)}</span>}
              createAt={x.createdAt}
              amount={
                <div
                  className={clsx(
                    isSuccess ? 'text-[#37D388]' : 'text-[#ffa877]'
                  )}
                >
                  {renderAmountText(
                    x.to !== currentAccount.address ? '-' : '',
                    x.amount,
                    x.token.decimals,
                    // 'usdc'
                    x.token.symbol
                  )}
                </div>
              }
              color={'#ffa877'}
              transactionType={x.transactionType}
            />
          );
        }
        if (x.transactionType != TransactionType.Swap) {
          return (
            <div
              onClick={() => onOpenTxDetail(x.transactionHash)}
              key={x.transactionHash}
            >
              <TxHistoryCard
                status={renderStatusLabel(
                  isSuccess ? 'Successful' : 'Rejected',
                  isSuccess ? 'bg-white' : 'bg-[#ffa877]',
                  x.transactionType
                )}
                iconTx={getIcon(
                  x.transactionType,
                  isSuccess ? 'white' : 'orange'
                )}
                to={<span>To: {shortenAddress(x.to)}</span>}
                createAt={x.createdAt}
                amount={
                  <div
                    className={clsx(
                      isSuccess ? 'text-[#37D388]' : 'text-[#ffa877]'
                    )}
                  >
                    {renderAmountText(
                      x.to !== currentAccount.address ? '-' : '',
                      x.amount,
                      x.token.decimals,
                      // 'usdc'
                      x.token.symbol
                    )}
                  </div>
                }
                scanLink={getScanLink(x.transactionHash)}
                color={isSuccess ? '#FFFFFF' : '#ffa877'}
                transactionType={x.transactionType}
              />
            </div>
          );
        } else {
          return (
            <div
              onClick={() => onOpenTxDetail(x.transactionHash)}
              key={x.transactionHash}
            >
              <TxHistoryCard
                status={renderStatusLabel(
                  isSuccess ? 'Successful' : 'Rejected',
                  isSuccess ? 'bg-white' : 'bg-[#ffa877]',
                  x.transactionType
                )}
                iconTx={getIcon(
                  x.transactionType,
                  isSuccess ? 'white' : 'orange'
                )}
                to={
                  <span className="flex text-11">
                    <span>{x.token.symbol}</span>
                    <span>
                      <MiniSwapIcon />
                    </span>
                    <span>{x.tokenTo?.symbol}</span>
                    <span>{shortenAddress(currentAccount.address)}</span>
                  </span>
                }
                createAt={x.createdAt}
                amount={
                  <div
                    className={clsx(
                      isSuccess ? 'text-[#37D388]' : 'text-[#ffa877]'
                    )}
                  >
                    {renderAmountText(
                      '',
                      x.amountTo || 0,
                      x.tokenTo?.decimals || 0,
                      // 'usdc'
                      x.tokenTo?.symbol || ''
                    )}
                  </div>
                }
                scanLink={getScanLink(x.transactionHash)}
                color={isSuccess ? '#FFFFFF' : '#ffa877'}
                transactionType={x.transactionType}
              />
            </div>
          );
        }
      })}
      {openTxDetail && (
        <TrasactionDetailModal tx={txDetail} onClose={closeTxDetail} />
      )}
    </div>
  );
};

const TxHistoryCard: React.FC<{
  txStatus?: number;
  status: React.ReactNode;
  to: React.ReactNode;
  createAt: number;
  amountBN?: BigNumber;
  amountTo?: BigNumber;
  amount: React.ReactNode;
  txHash?: string;
  scanLink?: string;
  iconTx: ReactNode;
  color?: string;
  value?: any;
  token?: {
    symbol: string;
    decimals: number;
    address: string;
    isNative: boolean;
  };
  tokenTo?: {
    symbol: string;
    decimals: number;
    address: string;
    isNative: boolean;
  };
  transactionType: TransactionType;
}> = ({
  txStatus,
  status,
  to,
  createAt,
  amountBN,
  amountTo,
  amount,
  txHash,
  scanLink,
  iconTx,
  color = '#FFFFFF',
  value,
  token,
  tokenTo,
  transactionType,
}) => {
  return (
    <>
      <div>
        <div
          className="transaction-history-card"
          style={{
            border: `1px solid ${color}`,
          }}
        >
          <div className="flex items-center">
            {iconTx}
            <div className="summary">
              <div className="summary-top">
                <div style={{ color }}>{status}</div>
                {amount}
              </div>
              <div className="summary-bottom">
                <div className="summary-bottom-col-1">
                  {to}
                  {scanLink && (
                    <div
                      onClick={() => {
                        window.open(scanLink, '_blank');
                      }}
                      style={{ width: 14 }}
                    >
                      <img src={Scan} alt="" width={14} />
                    </div>
                  )}
                </div>
                <div className="summary-bottom-col-2">
                  {moment(createAt * 1000).format('lll')}
                </div>
              </div>
            </div>
            {txStatus != -1 && (
              <div>
                <img src={Info} alt="" />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ActivityTab;
