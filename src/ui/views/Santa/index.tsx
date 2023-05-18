import './style.less';
import { useHistory } from 'react-router-dom';
import Routes from '@/constant/routes';
import {
  AddressZero,
  KEYRING_TYPE,
  PRIVATE_KEY_TYPE,
  TAB_SANTA_KEYS,
} from '@/constant';
import Tab from './Components/Tab';
import Transactions from './Components/Transactions';
import { useAppContext } from '@/context';
import { ActionTypes } from '@/context/actions';
import { apiConnection } from '@/utils/api';
import React, { useEffect, useMemo, useState } from 'react';
import useCurrentAccount from '@/hooks/wallet/useCurrentAccount';
import { useWallet } from '@/ui/utils';
import { ethers } from 'ethers';
import SendGiftForm from './Components/SendGiftForm';
import EmailVerifyForm from './Components/EmailVerifyForm';
import MyGift from './Components/MyGift';
import useNetwork from '@/hooks/wallet/useNetwork';
import { getEscrowAddress } from '@/constant/santa';
import { ReactComponent as ArrowLeft } from '@/ui/assets/jwallet/arrow-left.svg';
import { ReactComponent as NotFoundTokenIcon } from '@/ui/assets/jwallet/not-found-token.svg';
import { WalletConnectModal } from '@/ui/component/Modal/WalletConnect';
import { LoadingModal } from '@/ui/component/Modal/Loading';
import { toCheckSumAddress } from '@/ui/utils/address';
import { bufferToHex } from 'ethereumjs-util';

const Santa = () => {
  const history = useHistory();
  const { appState, dispatch } = useAppContext();
  const currentAccount = useCurrentAccount();
  const [emailVerified, setEmailVerified] = useState(false);
  const [tokenAuth, setTokenAuth] = useState('');
  const wallet = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [openWatchModal, setOpenWatchModal] = useState(false);
  const { currentNetwork } = useNetwork();
  const onBack = () => {
    history.push(Routes.Dashboard);
  };

  const API = useMemo(() => {
    return apiConnection(process.env.REACT_APP_SANTA_API || '', {});
  }, [process.env.REACT_APP_SANTA_API]);

  const closeModal = () => {
    wallet.clearPageStateCache();
    history.replace('/dashboard');
  };

  const getNonceAddress = async (address: string) => {
    const { data } = await API.get(`/wallets?address=${address}`);
    return data.code === 404 && data.message === 'Wallet not found!'
      ? undefined
      : data[0].nonce;
  };

  const createNonceAddress = async (address: string) => {
    const response = await API.post('/wallets', {
      address,
    });
    return response.status === 200 && response.data.address
      ? response.data.nonce
      : undefined;
  };

  const getTokenAddress = async (nonce: string, address: string) => {
    const signer = new ethers.Wallet(
      await wallet.getPrivateKeyInternal(currentAccount.address)
    );
    const signature = await signer.signMessage(
      ethers.utils.toUtf8Bytes(`I am signing my one-time nonce: ${nonce}`)
    );

    if (signature) {
      const response = await API.post('/wallets/sessions', {
        signature,
        address,
      });
      return {
        token: response.data.token,
        expired: response.data.expiration,
      };
    }
    return undefined;
  };

  const isSupported = useMemo(
    () => getEscrowAddress(currentNetwork.chainId) !== AddressZero,
    [currentNetwork.chainId]
  );

  const onReceiveSignature = async (signature: string) => {
    setIsLoading(true);
    setOpenWatchModal(false);

    const address = toCheckSumAddress(currentAccount.address);
    try {
      const response = await API.post('/wallets/sessions', {
        signature,
        address,
      });
      const _tokenAuth = {
        token: response.data.token,
        expired: response.data.expiration,
      };
      setTokenAuth(_tokenAuth.token);
      const user = await API.get('/users', {
        headers: {
          Authorization: `Bearer ${_tokenAuth.token}`,
        },
      });

      setEmailVerified(user.data.code != 401);

      setIsLoading(false);
    } catch (error) {
      console.log({ error });
    }
  };

  useEffect(() => {
    void (async () => {
      if (!currentAccount.address) {
        return;
      }
      setIsLoading(true);
      try {
        const address = toCheckSumAddress(currentAccount.address);
        if (!address.length) {
          return;
        }
        let nonce = await getNonceAddress(address);
        if (!nonce) {
          nonce = await createNonceAddress(address);
        }
        if (PRIVATE_KEY_TYPE.includes(currentAccount.type)) {
          const _tokenAuth = await getTokenAddress(nonce, address);
          if (_tokenAuth) {
            setTokenAuth(_tokenAuth.token);
            const user = await API.get('/users', {
              headers: {
                Authorization: `Bearer ${_tokenAuth.token}`,
              },
            });

            setEmailVerified(user.data.code != 401);
          }
        } else {
          setOpenWatchModal(true);
          if (currentAccount.type === KEYRING_TYPE.WalletConnectKeyring) {
            wallet.sendRequestToWalletConnect(currentAccount.address, {
              method: 'personal_sign',
              params: [
                bufferToHex(
                  Buffer.from(
                    `I am signing my one-time nonce: ${nonce}`,
                    'utf-8'
                  )
                ),
                currentAccount.address,
              ],
            });
          }
        }
        setIsLoading(false);
      } catch {}
    })();
  }, [currentAccount.address]);

  const renderTabContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="w-full h-full">
          <LoadingModal onClose={closeModal} open={isLoading} />
        </div>
      );
    }

    if (openWatchModal) {
      switch (currentAccount.type) {
        case KEYRING_TYPE.WalletConnectKeyring: {
          return (
            <WalletConnectModal
              onClose={closeModal}
              open={openWatchModal}
              onContinue={onReceiveSignature}
            />
          );
        }
        default: {
          return (
            <WalletConnectModal
              onClose={closeModal}
              open={openWatchModal}
              onContinue={onReceiveSignature}
            />
          );
        }
      }
    }

    if (appState.santa.tab == TAB_SANTA_KEYS.SendGift)
      return emailVerified ? (
        <SendGiftForm token={tokenAuth} />
      ) : (
        <EmailVerifyForm token={tokenAuth} />
      );

    if (appState.santa.tab == TAB_SANTA_KEYS.Transactions)
      return <Transactions token={tokenAuth} />;

    if (appState.santa.tab == TAB_SANTA_KEYS.MyGifts)
      return <MyGift token={tokenAuth} />;
  }, [appState.santa.tab, isLoading, tokenAuth, currentAccount.type]);

  return (
    <div id="santa-container">
      <div className="title">
        <div onClick={onBack} className="back hover-overlay rounded-lg">
          <ArrowLeft />
        </div>
        <div className="text">Santa</div>
      </div>
      <div className="content">
        {isSupported ? (
          <>
            <Tab
              active={appState.santa.tab}
              tabs={[
                TAB_SANTA_KEYS.SendGift,
                TAB_SANTA_KEYS.MyGifts,
                TAB_SANTA_KEYS.Transactions,
              ]}
              onChange={(t) => {
                dispatch({ type: ActionTypes.UpdateSantaTab, payload: t });
              }}
            />
            {renderTabContent}
          </>
        ) : (
          <div id="unsupported">
            <div className="icon">
              <NotFoundTokenIcon />
            </div>
            <div className="title">
              Santa is only available for Ethereum and Polygon, switch chain to
              use it
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Santa;
