import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from 'antd';
import { TxDetail } from '../ActivityTab';
import './style.less';
import { ReactComponent as CloseModalIcon } from '@/ui/assets/jwallet/close-modal.svg';
import { ReactComponent as AddressReceiverIcon } from '@/ui/assets/jwallet/address-receiver.svg';
import useNetwork from '@/hooks/wallet/useNetwork';
import StrayButtons from '@/ui/component/Buttons/StrayButtons';
import { useWallet } from '@/ui/utils';
import { BigNumber, ethers } from 'ethers';

const TrasactionDetailModal: React.FC<{
  tx: TxDetail;
  onClose: () => void;
}> = ({ tx, onClose }) => {
  const [gasPrice, setGasPrice] = useState<BigNumber>(
    BigNumber.from('0x174876E800')
  );
  const [canSpeedUp, setCanSpeedUp] = useState(false);

  const { currentNetwork } = useNetwork();
  const wallet = useWallet();
  const {
    currentNetwork: { rpcURL, chainId },
  } = useNetwork();
  const provider = useMemo(
    () => new ethers.providers.JsonRpcProvider(rpcURL),
    [rpcURL]
  );

  const getScanLink = (tx: string) => {
    return `${currentNetwork.scanLink}/tx/${tx}`;
  };

  useEffect(() => {
    (async () => {
      try {
        const [_gasPrice, _minPendingNonce] = await Promise.all([
          provider.getGasPrice(),
          tx.pendingTx
            ? wallet.getMinPendingNonce(tx.pendingTx.from, chainId)
            : Infinity,
        ]);
        setGasPrice(_gasPrice);
        setCanSpeedUp(
          !!tx.pendingTx?.nonce && +tx.pendingTx.nonce === +_minPendingNonce
        );
      } catch (error) {
        console.log({ error });
      }
    })();
  }, [provider]);

  const onCancel = async () => {
    if (tx.pendingTx?.nonce && tx.pendingTx?.chainId && tx.pendingTx?.from) {
      const txGasPrice = BigNumber.from(
        tx.pendingTx?.gasPrice || tx.pendingTx?.maxFeePerGas || 0
      );
      const overwrittenGasPrice = gasPrice.lt(txGasPrice._hex)
        ? txGasPrice
        : gasPrice;
      await wallet.cacheAdditionalPayload({
        oldTxHash: tx.pendingTx.hash,
      });
      wallet.sendRequest({
        method: 'eth_sendTransaction',
        params: [
          {
            from: tx.pendingTx.from,
            to: tx.pendingTx.from,
            chainId: tx.pendingTx.chainId,
            data: '0x',
            gas: 21000,
            gasPrice: overwrittenGasPrice.mul(3).div(2)._hex || '0x174876E800', // default 100GWei
            nonce: tx.pendingTx.nonce,
            isCancel: true,
          },
        ],
      });
    }
  };

  const onSpeedUp = () => {
    if (tx.pendingTx?.nonce && tx.pendingTx?.chainId && tx.pendingTx?.from) {
      const txGasPrice = BigNumber.from(
        tx.pendingTx?.gasPrice || tx.pendingTx?.maxFeePerGas || 0
      );
      const overwrittenGasPrice = gasPrice.lt(txGasPrice._hex)
        ? txGasPrice
        : gasPrice;
      wallet.sendRequest({
        method: 'eth_sendTransaction',
        params: [
          {
            from: tx.pendingTx.from,
            to: tx.pendingTx.to,
            chainId: tx.pendingTx.chainId,
            value: BigNumber.from(tx.pendingTx.value || 0)._hex,
            data: tx.pendingTx.data || '0x',
            gasPrice: overwrittenGasPrice.mul(3).div(2)._hex || '0x174876E800', // default 100GWei
            nonce: tx.pendingTx.nonce,
            isSpeedUp: true,
          },
        ],
      });
    }
  };

  return (
    <Modal
      title={null}
      open={true}
      footer={null}
      closable={false}
      width={368}
      centered
    >
      <div id="tx-detail-modal" className="text-white">
        <div
          className="w-full flex justify-end cursor-pointer"
          onClick={onClose}
        >
          <CloseModalIcon />
        </div>
        <div className="font-GilroyExtraBold text-18 text-white text-center w-full -mt-[5px] mb-[28px]">
          Transaction Info
        </div>
        <div className="flex items-center">
          <span className="mr-1">
            <AddressReceiverIcon />
          </span>
          <span className="text-14">Address receiver: </span>
        </div>
        <div className="mb-5 text-[#E1DFF0] text-12">{tx.to}</div>
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>Date:</div>
            <div>{tx.createdAt}</div>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div>Status:</div>
            <div>{tx.status}</div>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div>Amount of transaction:</div>
            <div>{tx.amount}</div>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div>Gas fee:</div>
            <div>{tx.gasFee}</div>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div>Transaction fee:</div>
            <div>{tx.txFee}</div>
          </div>
          <div className="flex justify-between items-center mb-4 text-16">
            <div className="">Total amount:</div>
            <div>{tx.totalAmount}</div>
          </div>
          <div className="flex">
            <div className="mr-[6px]">Hex:</div>
            <div className="text-[#E1DFF0] break-all">
              <a
                href={getScanLink(tx.hash)}
                target="_blank"
                rel="noreferrer"
                className="link-tx"
              >
                {tx.hash}
              </a>
            </div>
          </div>
          {!tx.isCompleted && (
            <div className="mt-4">
              <StrayButtons
                backTitle="CANCEL"
                nextTitle="SPEED UP"
                onBack={onCancel}
                onNext={onSpeedUp}
                disabledNext={!canSpeedUp}
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TrasactionDetailModal;
