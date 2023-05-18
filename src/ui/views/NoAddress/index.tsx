import React from 'react';
import PrimaryButton from '@/ui/component/Buttons/PrimaryButton';
import { ReactComponent as PlusIcon } from '@/ui/assets/jwallet/plus.svg';
import PrimaryLayout from '@/ui/component/Layouts/PrimaryBackground';
import Title from '@/ui/component/Title';
import { useHistory } from 'react-router-dom';
import Routes from '@/constant/routes';

const NoAddress = () => {
  const history = useHistory();

  return (
    <PrimaryLayout>
      <div className="mt-14 mb-5">
        <Title text="New to Jwallet?" />
      </div>
      <div
        className="px-5 py-[30px] rounded-2xl mb-[70px] mx-[30px]"
        style={{
          background:
            'linear-gradient(154.64deg, rgba(255, 255, 255, 0.35) 6.18%, rgba(255, 255, 255, 0.09) 93.39%)',
          boxShadow: '0px 4px 24px -1px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="w-full mb-5 flex justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-white flex justify-center items-center">
            <PlusIcon />
          </div>
        </div>
        <p className="text-[16px] font-GilroyExtraBold mb-3 text-center">
          Yes, I’m new! Let’s set up
        </p>
        <p className="text-14 mb-[30px] opacity-60 text-center">
          Will create a wallet and recovery phrase
        </p>
        <div className="px-7">
          <PrimaryButton
            text="CREATE WALLET"
            color="white"
            onClick={() => {
              history.push(Routes.CreateMnemonics);
            }}
          />
        </div>
      </div>
      <div className="text-center">
        <p className="text-[16px] font-GilroyExtraBold mb-3">
          Already have a wallet?
        </p>
        <p className="text-14 opacity-60 cursor-pointer hover:opacity-100">
          <u
            onClick={() => {
              history.replace('/connect');
            }}
          >
            Import or connect your wallet
          </u>
        </p>
      </div>
    </PrimaryLayout>
  );
};

export default NoAddress;
