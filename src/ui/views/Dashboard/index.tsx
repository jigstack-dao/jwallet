import CardMain from '@/ui/views/Dashboard/components/CardMain';
import { ReactComponent as PlusIcon } from '@/ui/assets/jwallet/plusWhite.svg';
import TokenCard from './components/TokenCard';
import TokenTab from './components/TokenTab';
import React, { useEffect, useMemo, useState } from 'react';
import { features } from './contants';
import useCurrentAccount from '@/hooks/wallet/useCurrentAccount';
import useBalanceAccount from '@/hooks/contracts/useBalanceAccount';
import useNetwork from '@/hooks/wallet/useNetwork';
import { renderAmount, renderShortAmount } from '@/utils/render-values';
import { useHistory, useLocation } from 'react-router-dom';
import Routes from '@/constant/routes';
import { TokenSaved } from '@/background/service/permission';
import { useWallet } from '@/ui/utils';
import { getChainLogoById } from '@/constant/chains';
import ActivityTab from './components/ActivityTab';
import jwalletAPI from '@/background/service/jwalletAPI';
import { ethers } from 'ethers';
import useFiatNativeCurrency from '@/hooks/wallet/useFiatNativeCurrency';
import { useGeneralSetting } from '@/hooks/wallet/useWalletSetting';
import './style.less';
import { TokenDetailModal } from './components/TokenDetailModal';
import { getNetworkInfo } from '@/constant/networks';
import DashboardHead from './components/DashboardHead';
import { AddressZero } from '@/constant';
const Dashboard = () => {
  const currentAccount = useCurrentAccount();
  const { currentNetwork } = useNetwork();
  const balance = useBalanceAccount(currentAccount.address);
  const { state } = useLocation<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState(state?.tab || 'Tokens');
  const history = useHistory();
  const [tokenSaved, setTokenSaved] = useState<TokenSaved[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenSaved>();
  const wallet = useWallet();
  const generalSetting = useGeneralSetting();
  const fiatCurrency = useFiatNativeCurrency(balance);
  const clickCard = (url: string | undefined) => {
    if (url) {
      history.push(url);
    }
  };

  const networkInfo = useMemo(
    () => getNetworkInfo(currentNetwork.chainId),
    [currentNetwork.chainId]
  );

  useEffect(() => {
    void (async () => {
      try {
        if (currentAccount.address == '') return;
        const nonce = await jwalletAPI.getNonce(currentAccount.address);
        const signer = new ethers.Wallet(
          await wallet.getPrivateKeyInternal(currentAccount.address)
        );
        const signature = await signer.signMessage(
          ethers.utils.toUtf8Bytes(
            `${process.env.REACT_APP_JWALLET_MESSAGE_SIGNATURE} ${nonce}`
          )
        );
        await jwalletAPI.getSignature(currentAccount.address, signature);
      } catch (e) {
        //
      }
    })();
    return () => {};
  }, [currentAccount.address]);

  useEffect(() => {
    void (async () => {
      const _tokenSaved = await wallet.getTokensByChainId(
        currentNetwork.chainId
      );
      setTokenSaved(_tokenSaved);
    })();
    return () => {};
  }, [currentNetwork, currentAccount]);

  const nativeTokenLogo = getChainLogoById(currentNetwork.chainId);
  return (
    <div>
      <DashboardHead />
      <div className="text-center font-GilroyExtraBold text-[34px] leading-[2.625rem]">
        {generalSetting.primary == 'Crypto'
          ? renderShortAmount(balance, currentNetwork.symbol)
          : fiatCurrency}
      </div>
      <div className="text-center text-12 mb-[23px]">
        {generalSetting.primary == 'Crypto'
          ? fiatCurrency
          : renderShortAmount(balance, currentNetwork.symbol)}
      </div>
      <div className="grid grid-cols-2 gap-4 mb-[38px]">
        {features.map((x, key) => (
          // <div className="last:col-span-2" key={key}>
          <div key={key}>
            <CardMain
              icon={x.icon}
              text={x.text}
              rightEl={x.rightEl ? x.rightEl : null}
              disabled={!x.active}
              onClick={() => clickCard(x.url)}
            />
          </div>
        ))}
      </div>
      <div className="mb-5">
        <TokenTab activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      {activeTab == 'Tokens' && (
        <div>
          <div
            className="flex justify-between items-center text-16 border-[1px] border-white rounded-xl p-4 mb-2 hover:cursor-pointer"
            onClick={() =>
              setSelectedToken({
                address: AddressZero,
                chainId: currentNetwork.chainId,
                createdAt: Date.now() / 1000,
                decimal: networkInfo?.nativeCurrency?.decimals || 18,
                id: currentNetwork.chainId,
                img: nativeTokenLogo || '',
                name: networkInfo?.nativeCurrency?.name || currentNetwork.name,
                standard: 'Native Token',
                symbol:
                  networkInfo?.nativeCurrency?.symbol || currentNetwork.symbol,
              })
            }
          >
            <div className="w-8 h-8 rounded-full">
              {nativeTokenLogo && <img src={nativeTokenLogo} alt="" />}
            </div>
            <span className="flex-1 ml-[10px]">
              {networkInfo?.nativeCurrency?.name || currentNetwork.name}
            </span>
            <span className="font-GilroyExtraBold mr-[5px]">
              {renderAmount(balance, currentNetwork.decimals, 6)}
            </span>
            <span>
              {networkInfo?.nativeCurrency?.symbol || currentNetwork.symbol}
            </span>
          </div>
          {tokenSaved.map((x) => (
            <TokenCard
              data={x}
              rpcURL={currentNetwork.rpcURL}
              addressAccount={currentAccount.address}
              hideCurrency={generalSetting.hideCurrency}
              key={x.address}
              onClick={() => setSelectedToken(x)}
            />
          ))}
          {selectedToken && (
            <TokenDetailModal
              onClose={() => setSelectedToken(undefined)}
              token={selectedToken}
            />
          )}
          <div
            className="flex justify-center items-center font-[600] text-[14px] text-[#fff] mt-[10px] cursor-pointer hover-overlay m-auto w-fit p-2 rounded-lg"
            onClick={() => history.push(Routes.SearchToken)}
          >
            <PlusIcon className="fill-white mr-[10px]" /> Add token
          </div>
        </div>
      )}
      {activeTab !== 'Tokens' && <ActivityTab />}
    </div>
  );
};

export default Dashboard;
