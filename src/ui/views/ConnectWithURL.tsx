import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import StrayButtons from '../component/Buttons/StrayButtons';
import InputText from '../component/Inputs/InputText';
import PrimaryLayout from '../component/Layouts/PrimaryBackground';
import Title from '../component/Title';
import { useWallet, useWalletRequest } from '../utils';

const ConnectWithURL = () => {
  const [uri, setUri] = useState('');
  const wallet = useWallet();
  const history = useHistory();

  const [run, loading] = useWalletRequest(wallet.importWatchAddress, {
    onSuccess(accounts) {
      history.replace({
        pathname: '/screen-success',
        state: {
          title: 'Successfully imported',
          importedLength: 1,
        },
      });
    },
    onError(err) {
      console.log(err);
    },
  });

  const onConnect = () => {
    run(uri);
    return;
    loading;
  };

  const handleChange = (value: string) => {
    setUri(value);
  };

  return (
    <PrimaryLayout>
      <div className="text-center mb-[14px] mt-[25px]">
        <Title text="Connect with URL" />
      </div>
      <div className="mt-[14px] text-center w-full text-14 opacity-60">
        Please, place link to connect you account
      </div>
      <div className="mt-5 h-[350px]">
        <InputText
          placeHolder="Add link"
          value={uri}
          onChange={(e) => handleChange(e.target.value)}
        />
      </div>
      <StrayButtons
        nextTitle="CONNECT"
        disabledNext={uri.length == 0}
        onNext={onConnect}
        onBack={() => history.goBack()}
      />
    </PrimaryLayout>
  );
};

export default ConnectWithURL;
