import React, { useEffect, useMemo, useState } from 'react';
import SearchText from '../SearchText';
import { ReactComponent as SortDownIcon } from '@/ui/assets/jwallet/sort-down.svg';
import './style.less';
import clsx from 'clsx';
import { apiConnection } from '@/utils/api';
import useLoadingScreen from '@/hooks/wallet/useLoadingScreen';
import io from 'socket.io-client';
import useCurrentAccount from '@/hooks/wallet/useCurrentAccount';
import SantaGiftNotFound from '@/ui/assets/jwallet/santa-gift-not-found.png';

const MyGift: React.FC<{ token: string }> = ({ token }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState<'ASC' | 'DESC'>('ASC');
  const [gifts, setGifts] = useState([]);
  const { updateLoadingScreen } = useLoadingScreen();
  const currentAccount = useCurrentAccount();

  const API = useMemo(() => {
    const baseURL = process.env.REACT_APP_SANTA_API || '';
    const headers = {
      Authorization: token !== '' ? `Bearer ${token}` : 'Bearer',
    };
    return apiConnection(baseURL, headers);
  }, [token]);

  useEffect(() => {
    void (async () => {
      const socket = io(`${process.env.REACT_APP_SANTA_API}`, {
        extraHeaders: { Authorization: `Bearer ${token}` },
      });
      if (!socket) return;
      try {
        socket.once('connect', () => {
          socket.emit('subscribe', currentAccount.address);
          socket.on('received-notification', async (data: string) => {
            const response = JSON.parse(data);
            if (gifts.find((x: any) => x.id == response.id)) return;
            API.put('/gifts');
          });
        });
      } catch (error) {
        console.log(error);
      }
      return () => {
        socket.off('connect');
        socket.off('received-notification');
        socket.close();
      };
    })();
  }, [token]);

  useEffect(() => {
    void (async () => {
      try {
        updateLoadingScreen(true);
        const { data } = await API.get('/gifts');
        if (data.code == 401 && data.message == 'Email not authorized!') return;
        setGifts(data);
        await API.put('/gifts');
      } catch {
        setGifts([]);
      } finally {
        updateLoadingScreen(false);
      }
    })();
  }, [token]);

  const searchField = (f1: string, f2: string) => {
    try {
      return f1.toLowerCase().includes(f2.toLowerCase());
    } catch (error) {
      return false;
    }
  };

  const giftsFiltered = useMemo(() => {
    const sortedData = [...gifts].sort((a: any, b: any) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return sort == 'ASC' ? dateA - dateB : dateB - dateA;
    });
    return sortedData.filter((x: any) => {
      if (searchTerm == '') return x;
      return (
        searchField(x.comment, searchTerm) || searchField(x.title, searchTerm)
      );
    });
  }, [gifts, searchTerm]);

  return (
    <div id="santa-my-gift">
      <div className="header">
        <SearchText
          value={searchTerm}
          onChange={(value) => setSearchTerm(value)}
        />
        <div
          className="sort"
          onClick={() => setSort((prev) => (prev == 'ASC' ? 'DESC' : 'ASC'))}
        >
          <span className={clsx(sort == 'ASC' ? 'rotate-0' : 'rotate-180')}>
            <SortDownIcon />
          </span>
        </div>
      </div>
      <div className="gift-list">
        {giftsFiltered.map((x: any) => {
          const giftUrl = x.image ? x.image.imageUrl : SantaGiftNotFound;
          return (
            <div className="gift-item" key={x.id}>
              <img alt="" src={giftUrl} />
              <div className="gift-item-info">
                <div className="gift-item-title truncate">{x.title}</div>
                <div className="gift-item-comment truncate">{x.comment}</div>
                <div className="gift-item-token">
                  <img src={x.token.logoURI} alt="" />
                  <div className="amount">
                    {x.amount} {x.token.symbol}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyGift;
