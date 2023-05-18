import React from 'react';
import StrayButtons from '@/ui/component/Buttons/StrayButtons';
import InputText from '@/ui/component/Inputs/InputText';
import { useHistory, useLocation } from 'react-router-dom';
import { useAddCustomNetwork } from '../../../hooks/forms/useAddCustomNetwork';
import { useWallet } from '@/ui/utils';
import usePageStateCache from '@/hooks/wallet/usePageStateCache';
import { useAppContext } from '@/context';
import { ActionTypes, RefreshUseHooks } from '@/context/actions';
import Routes from '@/constant/routes';
import { getNetworkInfo } from '@/constant/networks';

import './style.less';
// import { ReactComponent as AttentionIcon } from '@/ui/assets/jwallet/attention.svg';
import { ReactComponent as ChainlistLogo } from 'ui/assets/jwallet/chainlist.svg';
import { ReactComponent as ArrowLeft } from '@/ui/assets/jwallet/arrow-left.svg';

const AddCustomNetwork = () => {
  const history = useHistory();
  const location = useLocation();
  const { form, onChangeForm, errors, validForm, old } = useAddCustomNetwork();
  const wallet = useWallet();
  const { clearCachePage } = usePageStateCache();
  const { dispatch } = useAppContext();

  const onSubmit = async () => {
    await wallet.upsertNetwork(
      {
        chainId: Number(form.chainId),
        name: form.networkName,
        symbol: form.symbol,
        decimals: getNetworkInfo(+form.chainId)?.nativeCurrency.decimals || 18,
        scanLink: form.explorerURL,
        rpcURL: form.rpcURL,
      },
      old
    );
    dispatch({
      type: ActionTypes.UpdateRefreshUseHooks,
      payload: [RefreshUseHooks.Wallet_Network],
    });
    history.replace({
      pathname: Routes.Dashboard,
    });
  };

  const onBack = () => {
    clearCachePage();
    history.goBack();
  };

  return (
    <div>
      <div className="w-full flex items-center mb-[30px] relative justify-between">
        <div
          onClick={onBack}
          className="hover-overlay rounded-md hover:cursor-pointer"
        >
          <ArrowLeft />
        </div>
        <div className="font-GilroyExtraBold text-18 absolute left-0 right-0 top-0 bottom-0 m-auto w-fit h-fit align-middle">
          {old ? 'Modify network' : 'Add Network'}
        </div>
        {old > 0 && (
          <div
            className="w-24 p-2 hover-overlay rounded-md hover:cursor-pointer"
            onClick={() => {
              history.push({
                pathname: Routes.AddChainlistNetwork,
                search: location.search,
              });
            }}
          >
            <ChainlistLogo className="w-full h-full" />
          </div>
        )}
      </div>
      <div className="mb-4">
        <InputText
          placeHolder="Network name"
          name="networkName"
          value={form.networkName}
          errorMsg={errors.networkName}
          onChange={onChangeForm}
        />
      </div>
      <div className="mb-4">
        <InputText
          name="rpcURL"
          placeHolder="RPC URL"
          value={form.rpcURL}
          errorMsg={errors.rpcURL}
          onChange={onChangeForm}
        />
      </div>
      <div className="mb-4">
        <InputText
          placeHolder="Chain ID"
          name="chainId"
          value={form.chainId}
          errorMsg={errors.chainId}
          onChange={onChangeForm}
        />
      </div>
      <div className="mb-4">
        <InputText
          placeHolder="Currency symbol"
          name="symbol"
          value={form.symbol}
          errorMsg={errors.symbol}
          onChange={onChangeForm}
        />
      </div>
      <div className="mb-4">
        <InputText
          placeHolder="Block explorer URL (optional)"
          name="explorerURL"
          value={form.explorerURL}
          errorMsg={errors.explorerURL}
          onChange={onChangeForm}
        />
      </div>
      {/* <div className="flex mb-[50px]">
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
      </div> */}
      <div>
        <StrayButtons
          nextTitle="SAVE"
          disabledNext={!validForm}
          onNext={onSubmit}
          onBack={onBack}
        />
      </div>
    </div>
  );
};

export default AddCustomNetwork;
