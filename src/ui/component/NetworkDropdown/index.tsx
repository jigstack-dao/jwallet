import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Popover } from 'antd';
import clsx from 'clsx';
import useNetwork from '@/hooks/wallet/useNetwork';
import Routes from '@/constant/routes';

import './index.less';
import { ReactComponent as PlusIcon } from '@/ui/assets/jwallet/plusWhite.svg';
import { ReactComponent as EditIcon } from '@/ui/assets/jwallet/rpcs/edit.svg';
import ArrowDownIcon from '@/ui/assets/jwallet/arrow-down.svg';

const NetworkDropdown = () => {
  const [open, setOpen] = useState(false);
  const { currentNetwork, networks, changeNetwork } = useNetwork();
  const history = useHistory();

  const handleChange = async (chainId: number) => {
    changeNetwork(chainId);
    setOpen(false);
  };

  const editNetwork = (chainId: number) => {
    if (history.location.pathname === Routes.AddCustomNetwork) {
      history.replace({
        pathname: Routes.AddCustomNetwork,
        search: `?old=${chainId}`,
      });
    } else if (history.location.pathname === Routes.AddChainlistNetwork) {
      // to fix the bug on clicking back button
      history.goBack();
      history.replace({
        pathname: Routes.AddCustomNetwork,
        search: `?old=${chainId}`,
      });
    } else {
      history.push({
        pathname: Routes.AddCustomNetwork,
        search: `?old=${chainId}`,
      });
    }

    setOpen(false);
  };
  const content = () => {
    return (
      <div
        className="content"
        style={{
          background:
            'linear-gradient(180deg, #866ddc 0%, #7a50d7 100%), #ffffff',
        }}
      >
        <div className="overflow-hidden">
          <div className="list thin-scrollbar">
            <div className="item selected flex justify-between items-center">
              <div className="flex items-center flex-1 cursor-pointer">
                <div className="bg-white rounded-full w-[6px] h-[6px]"></div>
                <div className="text-white">{currentNetwork.name}</div>
              </div>
              <div
                className="hover-overlay__lighter p-0.5 rounded-md"
                onClick={() => editNetwork(currentNetwork.chainId)}
              >
                <EditIcon className="cursor-pointer" />
              </div>
            </div>
            {networks
              .filter((x) => x.chainId != currentNetwork.chainId)
              .map((x, key) => (
                <div
                  key={key}
                  className="item flex justify-between items-center"
                >
                  <div
                    className="flex items-center flex-1 cursor-pointer"
                    onClick={() => handleChange(x.chainId)}
                  >
                    <div className="bg-[#e1dff0] rounded-full w-[6px] h-[6px]"></div>
                    <div className="text-[#e1dff0]">{x.name}</div>
                  </div>
                  <div
                    className="hover-overlay__lighter p-0.5 rounded-md"
                    onClick={() => editNetwork(x.chainId)}
                  >
                    <EditIcon className="cursor-pointer" />
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div className="line"></div>
        <div
          className="add-network"
          onClick={() => history.push(Routes.AddNetwork)}
        >
          <span>
            <PlusIcon />
          </span>
          <span>Add Network</span>
        </div>
      </div>
    );
  };

  return (
    <Popover
      placement="bottom"
      title={null}
      content={content}
      trigger="click"
      id="network-dropdown"
      open={open}
      style={{
        left: '70px !important',
      }}
      onOpenChange={(visible) => setOpen(visible)}
    >
      <div
        className="flex justify-center items-center space-x-2 px-4 py-2 border-[1px] border-white rounded-xl w-[178px]"
        style={{ background: 'transparent', cusor: 'pointer' }}
        onClick={() => setOpen(!open)}
      >
        <div className="selected-network-name">{currentNetwork.name}</div>
        <div>
          <img
            src={ArrowDownIcon}
            alt=""
            className={clsx(open ? 'rotate-180' : 'rotate-0')}
          />
        </div>
      </div>
    </Popover>
  );
};

export default NetworkDropdown;
