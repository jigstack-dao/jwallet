import './style.less';
import React from 'react';
import useCurrentAccount from '@/hooks/wallet/useCurrentAccount';
import { openInTab } from '@/ui/utils';
import { BUY_ETH_KEYS, BUY_ETH_OPTIONS } from '@/constant/menuWithIcon';
import { getBuyURL } from '@/utils/buy-eth-url';
import { ReactComponent as ArrowLeft } from '@/ui/assets/jwallet/arrow-left.svg';
import Routes from '@/constant/routes';
import { useHistory } from 'react-router-dom';
import clsx from 'clsx';

const BuyToken = () => {
  const currentAccount = useCurrentAccount();
  const history = useHistory();

  const onBuy = async (service: BUY_ETH_KEYS) => {
    openInTab(await getBuyURL(service, currentAccount.address));
  };

  const onBack = () => {
    history.push(Routes.Dashboard);
  };

  return (
    <div id="buy-token-container">
      <div className="title">
        <div onClick={onBack} className="back hover-overlay rounded-lg">
          <ArrowLeft />
        </div>
        <div className="text">Deposit ETH</div>
      </div>
      <div className="options">
        {BUY_ETH_OPTIONS.map((opt, key) => (
          <div
            className={clsx(
              'option-card',
              opt.key != BUY_ETH_KEYS.Wyre && 'disabled hidden'
            )}
            key={key}
            onClick={() => onBuy(opt.key)}
          >
            <div className="option-card-title">{opt.title}</div>
            <div className="option-card-content">{opt.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyToken;
