import React from 'react';
import { Popover } from 'antd';
import AvatarIcon from '@/ui/assets/jwallet/avatar.svg';
import { useAppContext } from '@/context';
import { ActionTypes } from '@/context/actions';
import CreateAccountModal from './CreateAccountModal';
import Content from './Content';
import './index.less';

const AccountDropdown = () => {
  const { appState, dispatch } = useAppContext();
  const { isOpenModalCreateAccount, isOpenAccountDropdown } = appState;

  const changeVisible = (visible: boolean) => {
    dispatch({
      type: ActionTypes.UpdateIsOpenDropdownAccount,
      payload: visible,
    });
  };

  return (
    <>
      <Popover
        placement="bottom"
        title={null}
        content={Content}
        trigger="click"
        id="account-dropdown"
        open={isOpenAccountDropdown}
        onOpenChange={(visible) => changeVisible(visible)}
      >
        <button onClick={() => changeVisible(!isOpenAccountDropdown)}>
          <div className="relative">
            <img src={AvatarIcon} alt="" />
            <div className="w-[15px] h-[15px] bg-[#37D388] border-4 border-[#9594E4] absolute bottom-0 right-0 rounded-full"></div>
          </div>
        </button>
      </Popover>
      <CreateAccountModal open={isOpenModalCreateAccount} />
    </>
  );
};

export default AccountDropdown;
