import React from 'react';
import { ReactComponent as PlusIcon } from '@/ui/assets/jwallet/plusWhite.svg';
import { ReactComponent as DownloadIcon } from '@/ui/assets/jwallet/download.svg';
import { ReactComponent as SettingsIcon } from '@/ui/assets/jwallet/settings.svg';
import { ReactComponent as BubbleChatIcon } from '@/ui/assets/jwallet/bubble-chat.svg';
import { useAppContext } from '@/context';
import { ActionTypes } from '@/context/actions';
import AccountCard from './AccountCard';
import FeatureCard from './FeatureCard';
import { useHistory } from 'react-router-dom';
import Routes from '@/constant/routes';
import useAccounts from '@/hooks/wallet/useAccounts';
import useCurrentAccount from '@/hooks/wallet/useCurrentAccount';
import useNetwork from '@/hooks/wallet/useNetwork';

const Content = () => {
  const { dispatch } = useAppContext();
  const accounts = useAccounts();
  const currentAccount = useCurrentAccount();
  const history = useHistory();
  const { currentNetwork } = useNetwork();

  const openCreateAccount = () => {
    dispatch({
      type: ActionTypes.UpdateIsOpenDropdownAccount,
      payload: false,
    });
    dispatch({
      type: ActionTypes.UpdateIsOpenModalCreateAccount,
      payload: true,
    });
  };

  return (
    <div
      className="w-[254px] max-h-[423px] rounded-2xl drop-shadow-[0_24px_100px_rgba(0, 0, 0, 0.1)] text-white"
      style={{
        background:
          'linear-gradient(180deg, #866ddc 0%, #7a50d7 100%), #ffffff',
      }}
    >
      <div className="py-3">
        <ul className="thin-scrollbar max-h-44 overflow-auto">
          {accounts.map((x, key) => (
            <AccountCard
              data={x}
              key={key}
              isCurrent={currentAccount.address == x.address}
              symbolToken={currentNetwork.symbol}
              decimalsToken={currentNetwork.decimals}
            />
          ))}
        </ul>
      </div>
      <hr className="border-t border-[#rgba(255, 255, 255, 0.3)] mx-4" />
      <div className="py-3">
        <FeatureCard
          icon={<PlusIcon />}
          name="Create Account"
          onClick={openCreateAccount}
        />
        <FeatureCard
          icon={<DownloadIcon />}
          name="Import Account"
          onClick={() => {
            history.replace(Routes.ImportAccount);
            dispatch({
              type: ActionTypes.UpdateIsOpenDropdownAccount,
              payload: false,
            });
          }}
        />
      </div>
      <hr className="border-t border-[#rgba(255, 255, 255, 0.3)] mx-4" />
      <div className="py-3">
        <FeatureCard
          icon={<BubbleChatIcon />}
          name="Support"
          href={process.env.REACT_APP_SUPPORT_LINK}
        />
        <FeatureCard
          icon={<SettingsIcon />}
          name="Settings"
          onClick={() => {
            dispatch({
              type: ActionTypes.UpdateIsOpenDropdownAccount,
              payload: false,
            });
            history.push(Routes.SettingBoard);
          }}
        />
      </div>
    </div>
  );
};

export default Content;
