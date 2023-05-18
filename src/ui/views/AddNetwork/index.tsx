import React, { memo } from 'react';
import { useHistory } from 'react-router-dom';
import './style.less';
import Routes from '@/constant/routes';
import PrimaryButton from '@/ui/component/Buttons/PrimaryButton';

import { ReactComponent as ChainlistLogo } from 'ui/assets/jwallet/chainlist.svg';
import { ReactComponent as ArrowLeft } from '@/ui/assets/jwallet/arrow-left.svg';
import { ReactComponent as AttentionIcon } from '@/ui/assets/jwallet/attention.svg';

const ChainlistInner = memo(function ChainlistInner() {
  return (
    <div className="w-28 m-auto">
      <ChainlistLogo className="w-full" />
    </div>
  );
});

const AddNetwork = () => {
  const history = useHistory();

  const onBack = () => {
    history.goBack();
  };

  const AddCustom = () => {
    history.push({ pathname: Routes.AddCustomNetwork });
  };

  const AddChainlist = () => {
    history.push({ pathname: Routes.AddChainlistNetwork });
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="w-full flex items-center mb-[30px] relative justify-between">
        <div
          onClick={onBack}
          className="hover-overlay rounded-md hover:cursor-pointer"
        >
          <ArrowLeft />
        </div>
        <div className="font-GilroyExtraBold text-18 absolute left-0 right-0 top-0 bottom-0 m-auto w-fit h-fit align-middle">
          Add Network
        </div>
      </div>
      <div className="h-40 flex flex-col justify-around items-center">
        <div className="w-60">
          <PrimaryButton onClick={AddChainlist} text={<ChainlistInner />} />
        </div>
        <div className="w-60">
          <PrimaryButton
            onClick={AddCustom}
            text={<span className="text-20 font-Arimo">Custom Network</span>}
          />
        </div>
      </div>
      <div className="flex mb-8">
        <div className="mr-[10px]">
          <AttentionIcon />
        </div>
        <div className="text-[#FFA877]">
          Warning: A malicious network provider can lie about the state of the
          blockchain and record your network activity. Only add custom networks
          you trust.{' '}
          <a
            href="https://jigstack.gitbook.io/jproducts/v/jwallet/jwallet-browser-extension/network/add-a-custom-network"
            target="_blank"
            rel="noreferrer"
            className="underline text-white hover:opacity-60"
          >
            See our guide
          </a>
        </div>
      </div>
    </div>
  );
};

export default AddNetwork;
