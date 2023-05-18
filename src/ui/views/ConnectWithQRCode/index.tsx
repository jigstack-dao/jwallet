import PrimaryLayout from '../../component/Layouts/PrimaryBackground';
import Title from '../../component/Title';
import QRCode from 'qrcode.react';
import React, { useEffect, useState } from 'react';
import { OLD_DEFAULT_BRIDGE } from '@rabby-wallet/eth-walletconnect-keyring';
import { useWallet, useWalletRequest } from '../../utils';
import { useHistory } from 'react-router-dom';
import PrimaryButton from '@/ui/component/Buttons/PrimaryButton';
import { ReactComponent as CopyIcon } from '@/ui/assets/jwallet/copy.svg';
import { ReactComponent as ReloadIcon } from '@/ui/assets/jwallet/reload.svg';
import { ReactComponent as LargeReloadIcon } from '@/ui/assets/jwallet/large-reload.svg';
import { useCopyToClipboard } from 'react-use';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import './index.less';
import clsx from 'clsx';
import { EVENTS, WALLETCONNECT_STATUS_MAP } from '@/constant';
import eventBus from '@/eventBus';
import { toChecksumAddress } from 'web3-utils';
import Routes from '@/constant/routes';

enum IQRConnect {
  QR = 'QR',
  URL = 'URL',
}

const ConnectWithQRCode = () => {
  const [walletconnectUri, setWalletconnectUri] = useState('');
  const [bridgeURL, setBridgeURL] = useState(OLD_DEFAULT_BRIDGE);
  const [brand, setBrand] = useState({ brand: 'Wallet Connect', image: '' });
  const [ready, setReady] = useState(false);
  const [show, setShow] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<IQRConnect>(IQRConnect.QR);
  const wallet = useWallet();
  const history = useHistory();
  const [, copyToClipboard] = useCopyToClipboard();
  const { t } = useTranslation();

  const handleReload = () => handleImportByWalletconnect();

  const handleCopyWs = (text) => {
    copyToClipboard(text);
    message.success({
      content: t('Copied url success'),
      duration: 2,
      className: 'refresh-toast rectangle-toast',
    });
  };

  const [run] = useWalletRequest(wallet.importWalletConnect, {
    onSuccess(accounts) {
      history.replace({
        pathname: '/popup/import/success',
        state: {
          accounts,
          brand: brand.brand,
          image: brand.image,
          editing: true,
          title: t('Imported Successfully'),
          importedAccount: true,
        },
      });
    },
    onError(err) {
      message.error(t(err?.message));
      handleImportByWalletconnect();
    },
  });

  const init = async () => {
    const cache = await wallet.getPageStateCache();
    if (cache && cache.path === history.location.pathname) {
      const { states } = cache;
      if (states.uri) setWalletconnectUri(states.uri);
      if (states.brand) {
        setBrand(states.brand);
      }
      if (states.data) {
        run(
          toChecksumAddress(states.data.payload),
          states.brand.brand,
          states.bridgeURL,
          states.stashId
        );
      }
      if (states.bridgeURL && states.bridgeURL !== bridgeURL) {
        setBridgeURL(states.bridgeURL);
      }
    } else {
      handleImportByWalletconnect();
    }
    setReady(true);
  };
  useEffect(() => {
    init();
    return () => {
      wallet.clearPageStateCache();
    };
  }, []);
  const handleImportByWalletconnect = async () => {
    const data = await wallet.initWalletConnect(brand.brand, bridgeURL);
    const { uri, stashId } = data;

    setWalletconnectUri(uri);
    await wallet.setPageStateCache({
      path: Routes.ImportQRCode,
      params: {},
      states: {
        uri,
        stashId,
        brand,
        bridgeURL,
      },
    });
    eventBus.removeAllEventListeners(EVENTS.WALLETCONNECT.STATUS_CHANGED);
    eventBus.addEventListener(
      EVENTS.WALLETCONNECT.STATUS_CHANGED,
      ({ status, payload }) => {
        switch (status) {
          case WALLETCONNECT_STATUS_MAP.CONNECTED:
            run(toChecksumAddress(payload), brand.brand, bridgeURL, stashId);
            break;
          case WALLETCONNECT_STATUS_MAP.FAILED:
          case WALLETCONNECT_STATUS_MAP.REJECTED:
            handleImportByWalletconnect();
            break;
          case WALLETCONNECT_STATUS_MAP.SUBMITTED:
            break;
        }
      }
    );
  };
  useEffect(() => {
    if (ready) {
      handleImportByWalletconnect();
    }

    return eventBus.removeAllEventListeners(
      EVENTS.WALLETCONNECT.STATUS_CHANGED
    );
  }, [bridgeURL]);
  return (
    <PrimaryLayout>
      <div className="text-center mb-[14px] mt-[25px]">
        <Title text={t('Connect with QR-code or URL')} />
      </div>
      <div className="mt-[14px] w-full flex justify-center gap-[16px]">
        <div
          className={clsx(
            'rounded-[8px] border-[1px] border-[#FFF] text-[14px] font-medium py-[6px] px-[32px] cursor-pointer hover:bg-white hover:text-[#5957D5]',
            activeTab === IQRConnect.QR
              ? 'bg-white text-[#5957D5]'
              : 'bg-transparent text-[#FFF]'
          )}
          onClick={() => setActiveTab(IQRConnect.QR)}
        >
          {IQRConnect.QR}
        </div>
        <div
          className={clsx(
            'rounded-[8px] border-[1px] border-[#FFF] text-[14px] font-medium py-[6px] px-[32px] cursor-pointer hover:bg-white hover:text-[#5957D5]',
            activeTab === IQRConnect.URL
              ? 'bg-white text-[#5957D5]'
              : 'bg-transparent text-[#FFF]'
          )}
          onClick={() => setActiveTab(IQRConnect.URL)}
        >
          {IQRConnect.URL}
        </div>
      </div>
      {activeTab === IQRConnect.QR ? (
        <div className="w-full justify-center mt-[20px]">
          <div
            className="w-[300px] h-[300px] rounded-xl p-[14px] mx-auto my-0"
            style={{ background: 'rgba(228, 234, 243, 0.25)' }}
          >
            {walletconnectUri && (
              <div
                id="qr-code-container"
                className="relative"
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
              >
                {show && (
                  <div className="absolute w-[88px] h-[88px] rounded-[10px] bg-[#000]/[0.8] top-[33%] left-[33%] flex justify-center items-center cursor-pointer z-50">
                    <LargeReloadIcon onClick={handleReload} />
                  </div>
                )}
                <QRCode
                  className={show ? 'opacity-70' : ''}
                  value={walletconnectUri}
                  size={272}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full justify-center mt-[20px]">
          <div
            className="w-[300px] h-[300px] rounded-xl p-[14px] mx-auto my-0 relative"
            style={{ background: 'rgba(228, 234, 243, 0.25)' }}
          >
            <div className="text-white font-medium font-[14px] w-full h-full whitespace-normal break-words">
              {walletconnectUri}
            </div>
            <div className="absolute flex right-1 bottom-1">
              <span className="cursor-pointer mx-1">
                <ReloadIcon onClick={handleReload} />
              </span>
              <span className="cursor-pointer mx-1">
                <CopyIcon onClick={() => handleCopyWs(walletconnectUri)} />
              </span>
            </div>
          </div>
        </div>
      )}
      <div className="mt-[26px]">
        <PrimaryButton
          text="CANCEL"
          color="transparent"
          onClick={() => history.replace('/')}
        />
      </div>
    </PrimaryLayout>
  );
};

export default ConnectWithQRCode;
