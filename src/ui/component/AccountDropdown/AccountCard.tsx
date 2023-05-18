import React from 'react';
import { useAppContext } from '@/context';
import { ActionTypes, RefreshUseHooks } from '@/context/actions';
import useBalanceAccount from '@/hooks/contracts/useBalanceAccount';
import { HooksWallet } from '@/hooks/types';
import AvatarIcon from '@/ui/assets/jwallet/avatar.svg';
import { useWallet } from '@/ui/utils';
import { renderShortAmount } from '@/utils/render-values';
import clsx from 'clsx';

interface IProps {
  data: HooksWallet.Accounts;
  isCurrent: boolean;
  symbolToken: string;
  decimalsToken: number;
}

const AccountCard: React.FC<IProps> = ({
  data,
  isCurrent,
  symbolToken,
  decimalsToken,
}) => {
  decimalsToken;
  const wallet = useWallet();
  const { dispatch } = useAppContext();
  const balance = useBalanceAccount(data.address);

  const changeAccount = async () => {
    if (!isCurrent) {
      await wallet.changeAccount(data);
      dispatch({
        type: ActionTypes.UpdateRefreshUseHooks,
        payload: [RefreshUseHooks.Wallet_CurrentAccount],
      });
      dispatch({
        type: ActionTypes.UpdateIsOpenDropdownAccount,
        payload: false,
      });
    }
  };

  return (
    <div
      className="w-full px-4 h-[46px] py-1 flex items-center flex-nowrap cursor-pointer hover-overlay"
      onClick={changeAccount}
    >
      <span className="mr-3">
        <img src={AvatarIcon} alt="" width={22} height={22} />
      </span>
      <div className="self-center">
        <div className="flex items-center">
          <span
            className={clsx(
              'text-14 mr-[6px]',
              isCurrent ? 'font-GilroyExtraBold' : 'text-[#e1dff0]'
            )}
          >
            {data.alianName}
          </span>
          {isCurrent && (
            <div className="bg-white rounded-full w-[6px] h-[6px]"></div>
          )}
        </div>
        <span className="text-[#e1dff0] text-12 ml-auto">
          {renderShortAmount(balance, symbolToken)}
        </span>
      </div>
    </div>
  );
};

export default AccountCard;
