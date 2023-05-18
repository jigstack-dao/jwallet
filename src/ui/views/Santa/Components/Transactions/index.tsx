import './style.less';
import { ReactComponent as ArrowDownIcon } from '@/ui/assets/jwallet/arrow-down.svg';
import React, { useEffect, useMemo, useState } from 'react';
import TransactionCard from '../TransactionCard';
import { apiConnection } from '@/utils/api';
import useNetwork from '@/hooks/wallet/useNetwork';
import useCurrentAccount from '@/hooks/wallet/useCurrentAccount';
import useLoadingScreen from '@/hooks/wallet/useLoadingScreen';
import moment from 'moment';
import TransactionDetail from '../TransactionDetail';
import {
  getTransactionStateSanta,
  TransactionItem,
  TxStateSanta,
} from '@/constant/santa';
import SearchText from '../SearchText';
import SantaGiftNotFound from '@/ui/assets/jwallet/santa-gift-not-found.png';

const Transactions: React.FC<{ token: string }> = ({ token }) => {
  const [open, setOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const { currentNetwork } = useNetwork();
  const currentAccount = useCurrentAccount();
  const { updateLoadingScreen } = useLoadingScreen();
  const [openDetail, setOpenDetail] = useState(false);
  const [transactionDetail, setTransactionDetail] = useState<
    undefined | TransactionItem
  >(undefined);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        if (currentNetwork.rpcURL == '') return;
        try {
          updateLoadingScreen(true);
          const baseURL = process.env.REACT_APP_SANTA_API || '';
          const headers = {
            Authorization: `Bearer ${token}`,
          };
          const API = apiConnection(baseURL, headers);
          const _transaction = await API.get('/gifts/transactions');
          setTransactions(_transaction.data.reverse());
        } catch (error) {
          setTransactions([]);
        } finally {
          updateLoadingScreen(false);
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, [token, currentNetwork]);

  const searchField = (f1: string, f2: string) => {
    try {
      return f1.toLowerCase().includes(f2.toLowerCase());
    } catch (error) {
      return false;
    }
  };

  const transactionsFiltered = useMemo(() => {
    const filteredData = [...transactions].filter((x: any) => {
      switch (filter) {
        case 'Claimed':
          return x.stateCode == TxStateSanta.Claimed;
        case 'Pending':
          return x.stateCode != TxStateSanta.Claimed;
        default:
          return x;
      }
    });
    return filteredData
      .filter((x: any) => {
        if (searchTerm == '') return x;
        return (
          searchField(x.comment, searchTerm) ||
          searchField(x.title, searchTerm) ||
          searchField(x.recipient, searchTerm)
        );
      })
      .sort((a: any, b: any) => b.id - a.id);
  }, [filter, transactions, searchTerm]);

  return (
    <div id="transactions-santa">
      <div className="mb-4">
        <SearchText
          value={searchTerm}
          onChange={(value) => setSearchTerm(value)}
        />
      </div>
      <div id="filter-transactions">
        <div className="main" onClick={() => setOpen(!open)}>
          <div className="item-active">{filter}</div>
          <div className="arrow-down">
            <ArrowDownIcon />
          </div>
        </div>
        {open && (
          <div className="items">
            {['All', 'Claimed', 'Pending'].map((x) => (
              <div
                key={x}
                className="child"
                onClick={() => {
                  setOpen(false);
                  setFilter(x);
                }}
              >
                {x}
              </div>
            ))}
          </div>
        )}
      </div>
      {transactionsFiltered.map((x: any) => {
        const data = {
          imageURL: x.image ? x.image.imageUrl : SantaGiftNotFound,
          status: getTransactionStateSanta(x.stateCode),
          to: x.recipient,
          scanLink: `${currentNetwork.scanLink}/tx/${x.txhash}`,
          createdDate: moment(x.updatedAt).format('lll'),
          amount:
            x.senderWalletAddress == currentAccount.address
              ? `${x.amount} ${x.token.symbol}`
              : `- ${x.amount} ${x.token.symbol}`,
          imageToken: x.token.logoURI,
          nameToken: x.token.name,
          title: x.title,
          comment: x.comment,
          symbolToken: x.token.symbol,
        };
        return (
          <TransactionCard
            key={x.id}
            data={data}
            onClick={() => {
              setTransactionDetail(data);
              setOpenDetail(true);
            }}
          />
        );
      })}
      {openDetail && transactionDetail && (
        <TransactionDetail
          data={transactionDetail}
          onClose={() => {
            setOpenDetail(false);
            setTransactionDetail(undefined);
          }}
        />
      )}
    </div>
  );
};

export default Transactions;
