import { BIG_NUMBER_ZERO } from '@/constant';
import { ERC20ABI } from '@/constant/abi';
import useCurrentAccount from '@/hooks/wallet/useCurrentAccount';
import useNetwork from '@/hooks/wallet/useNetwork';
import PrimaryButton from '@/ui/component/Buttons/PrimaryButton';
import { renderAmount } from '@/utils/render-values';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApproval, useWallet } from 'ui/utils';
import { isAddress } from 'web3-utils';

interface AddAssetProps {
  data: {
    type: string;
    options: {
      address: string;
      symbol: string;
      decimals: number;
      image: string;
    };
  };
  session: {
    origin: string;
    icon: string;
    name: string;
  };
}

const AddAsset = ({ params }: { params: AddAssetProps }) => {
  params;
  const [, resolveApproval, rejectApproval] = useApproval();
  const currentAccount = useCurrentAccount();
  const { currentNetwork } = useNetwork();
  const wallet = useWallet();
  const { t } = useTranslation();
  const [balanceOf, setBalanceOf] = useState(BIG_NUMBER_ZERO);
  const [dataToken, setDataToken] = useState({
    id: 0,
    img: '',
    name: '',
    standard: '',
    address: params.data.options.address || '',
    symbol: params.data.options.symbol || '',
    decimal: +params.data?.options?.decimals || 0,
    chainId: 1,
    createdAt: new Date().getTime(),
  });

  const onSubmit = async () => {
    await wallet.importTokens([dataToken]);
    resolveApproval();
  };
  useEffect(() => {
    void (async () => {
      if (!isAddress(currentAccount?.address) || currentNetwork.rpcURL == '')
        return;
      try {
        const provider = new ethers.providers.JsonRpcProvider(
          currentNetwork.rpcURL
        );
        const contract = new ethers.Contract(
          params.data.options.address,
          ERC20ABI,
          provider
        );
        const _balanceOf = await contract.balanceOf(currentAccount?.address);
        setBalanceOf(_balanceOf);
      } catch {
        setBalanceOf(BIG_NUMBER_ZERO);
      }
    })();
  }, [currentNetwork, currentAccount, params]);
  useEffect(() => {
    void (async () => {
      if (!currentNetwork) return;
      try {
        const token = {
          id: Date.now(),
          address: params.data.options.address,
          name: params.data.options.symbol,
          symbol: params.data.options.symbol,
          decimal: Number(params.data.options.decimals),
          img: params.data.options.image,
          standard: params.data.type,
          chainId: currentNetwork?.chainId || 1,
          createdAt: Date.now(),
        };
        console.log({ token, currentNetwork });
        setDataToken(token);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [currentNetwork]);
  return (
    <>
      <div className="approval-add-asset mx-[20px]">
        <div className="flex gap-4 p-2 rounded-full border-[1px] border-white/[0.08] items-center text-white w-fit m-auto mb-4">
          <img src={params.session?.icon} className="w-[25px] h-[25px]" />
          {params.session?.origin}
        </div>
        <div className="text-18 font-bold text-white text-center mb-8">
          {t('Allow this site to add an asset?')}
        </div>
        <div className="text-gray-title text-[14px] leading-[24px] w-[320px] mb-10 mx-auto font-medium text-center text-white">
          {t('This will allow this asset to be used within JWallet.')}
        </div>
        <div className="rounded-xl bg-[#e4eaf3]/25 p-5">
          <div className="flex justify-between mb-4 items-center">
            <div className="text-white text-14">{t('Token')}</div>
            <div className="text-white text-14">{t('Balance')}</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-white flex items-center gap-4">
              <img src={dataToken?.img} className="w-[30px] h-[30px]" />{' '}
              {dataToken?.name}
            </div>
            <div className="text-white">
              {renderAmount(balanceOf, dataToken?.decimal || 18, 6)}{' '}
              {dataToken?.symbol}
            </div>
          </div>
        </div>
      </div>
      <footer className="connect-footer mt-auto">
        <div className="action-buttons flex mt-4 gap-2 justify-between">
          <>
            <PrimaryButton
              text={t('Cancel')}
              onClick={() => rejectApproval()}
            />
            <PrimaryButton text={t('Approve')} onClick={onSubmit} />
          </>
        </div>
      </footer>
    </>
  );
};

export default AddAsset;
