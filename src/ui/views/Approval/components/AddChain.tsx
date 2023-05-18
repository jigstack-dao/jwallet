import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useTranslation, Trans } from 'react-i18next';
import { intToHex } from 'ethereumjs-util';
import { useWallet, useApproval } from 'ui/utils';
import PrimaryButton from '@/ui/component/Buttons/PrimaryButton';
import useNetwork from '@/hooks/wallet/useNetwork';
import { NetworkChain } from '@/background/service/permission';
import { CHAINSLOGO } from '@/constant/chains';
import { useAppContext } from '@/context';
import { ActionTypes, RefreshUseHooks } from '@/context/actions';
import { getScanLinkFromChainlist } from '@/utils/misc';

interface AddChainProps {
  data: Array<{
    chainId: string | number; // A 0x-prefixed hexadecimal string
    chainName: string;
    nativeCurrency: {
      name: string;
      symbol: string; // 2-6 characters long
      decimals: 18;
    };
    rpcUrls: string[];
    blockExplorerUrls?: string[];
    iconUrls?: string[]; // Currently ignored.
  }>;
  session: {
    origin: string;
    icon: string;
    name: string;
  };
}

const AddChain = ({ params }: { params: AddChainProps }) => {
  const wallet = useWallet();
  const { dispatch } = useAppContext();
  const [, resolveApproval, rejectApproval] = useApproval();
  const { networks, changeNetwork } = useNetwork();
  const { t } = useTranslation();
  const { data } = params;
  let [{ chainId }] = data;
  if (typeof chainId === 'number') {
    chainId = intToHex(chainId).toLowerCase();
  } else {
    chainId = chainId.toLowerCase();
  }
  const [networkChange, setNetworkChange] = useState<
    NetworkChain | undefined
  >();
  const [networkAdd, setNetworkAdd] = useState<any>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<any>('');
  const [confirmBtnText, setConfirmBtnText] = useState('');

  useEffect(() => {
    const checkNetwork = networks?.find((chain) => chain?.chainId === +chainId);
    if (checkNetwork) {
      setTitle(t('Switch a Chain'));
      setConfirmBtnText(t('Change'));
      setNetworkChange(checkNetwork);
      setContent(
        <Trans
          i18nKey="switchChainDesc"
          values={{ name: checkNetwork?.name }}
        />
      );
    } else {
      setTitle(t('Add Network'));
      setConfirmBtnText(t('Add'));
      const nw = params.data[0];
      const network = {
        name: nw.chainName,
        rpc: nw.rpcUrls,
        nativeCurrency: nw.nativeCurrency,
        explorers: nw.blockExplorerUrls,
        chainId: +nw.chainId,
      };
      setNetworkAdd(network);
      setContent(<></>);
    }
  }, [networks]);
  const addNetwork = async () => {
    await wallet.upsertNetwork({
      chainId: networkAdd.chainId,
      name: networkAdd.name,
      symbol: networkAdd?.nativeCurrency?.symbol,
      decimals: networkAdd?.nativeCurrency?.decimals,
      scanLink:
        networkAdd?.explorers?.[0] &&
        getScanLinkFromChainlist(networkAdd.explorers[0]),
      rpcURL: networkAdd?.rpc[0],
    });
    dispatch({
      type: ActionTypes.UpdateRefreshUseHooks,
      payload: [RefreshUseHooks.Wallet_Network],
    });
  };
  const handleChangeNetwork = async () => {
    changeNetwork(+chainId);
    resolveApproval();
  };
  return (
    <>
      <div className="approval-chain h-full flex flex-col">
        {networkChange ? (
          <>
            <h1 className="text-center mb-10 text-white text-18">{title}</h1>
            <div className="text-center">
              <img
                className="w-[44px] h-[44px] mx-auto mb-10"
                src={
                  CHAINSLOGO[networkChange.chainId]?.logo || CHAINSLOGO[1].logo
                }
              />
              <div className="mb-4 text-20 text-gray-title text-white">
                {networkChange?.name}
              </div>
              <div className="mb-14 text-14 text-gray-content text-white">
                {t('Chain ID')}:{networkChange?.chainId}
              </div>
            </div>
            <div className="text-center text-13 text-gray-content font-medium text-white">
              {content}
            </div>
          </>
        ) : (
          <>
            <h1 className="text-center mb-10 text-white text-18">{title}</h1>
            <div className="text-center">
              <img
                className="w-[44px] h-[44px] mx-auto mb-10"
                src={
                  CHAINSLOGO[networkAdd?.chainId || 1]?.logo ||
                  CHAINSLOGO[1].logo
                }
              />
              <div className="mb-4 text-20 text-gray-title text-white">
                {networkAdd?.name}
              </div>
              <div className="mb-14 text-14 text-gray-content text-white">
                {t('Chain ID')}:{networkAdd?.chainId}
              </div>
            </div>
            <div className="text-center text-13 text-gray-content font-medium text-white">
              {content}
            </div>
          </>
        )}
        <footer className="connect-footer mt-auto">
          <div
            className={clsx([
              'action-buttons flex mt-4 gap-2',
              networkChange ? 'justify-between' : 'justify-center',
            ])}
          >
            <>
              <PrimaryButton
                text={t('Cancel')}
                onClick={() => rejectApproval()}
              />
              <PrimaryButton
                text={confirmBtnText}
                onClick={async () =>
                  networkChange
                    ? await handleChangeNetwork()
                    : await addNetwork()
                }
              />
            </>
          </div>
        </footer>
      </div>
    </>
  );
};

export default AddChain;
