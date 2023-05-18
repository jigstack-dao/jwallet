import React, { FC, useEffect, useState } from 'react';
import { Modal, Spin } from 'antd';
import { ReactComponent as CloseModalIcon } from '@/ui/assets/jwallet/close-modal.svg';
import { LoadingOutlined } from '@ant-design/icons';
import { OLD_DEFAULT_BRIDGE } from '@rabby-wallet/eth-walletconnect-keyring';
import { useWallet } from '@/ui/utils';
import {
  CHAINS,
  CHAINS_ENUM,
  EVENTS,
  WALLETCONNECT_STATUS_MAP,
} from '@/constant';
import { Trans, useTranslation } from 'react-i18next';
import eventBus from '@/eventBus';
import ScanCopyQRCode from '../../ScanCopyQRCode';
import useCurrentAccount from '@/hooks/wallet/useCurrentAccount';
import useNetwork from '@/hooks/wallet/useNetwork';
import { getNetworkInfo } from '@/constant/networks';
import StrayButtons from '../../Buttons/StrayButtons';
import PrimaryButton from '../../Buttons/PrimaryButton';
import './style.less';

interface IProps {
  open?: boolean;
  isClosable?: boolean;
  onClose?: () => any;
  onContinue?: (res: string) => any;
}

interface ScanProps {
  uri: string;
  bridgeURL: string;
  defaultBridge: string;
  onRefresh: () => any;
  onBridgeChange: (val: string) => any;
}

type Valueof<T> = T[keyof T];

interface ProcessProps {
  result: string | undefined;
  status: Valueof<typeof WALLETCONNECT_STATUS_MAP>;
  error: { code?: number; message?: string } | null;
  onRetry?: () => any;
  onCancel?: () => any;
  onContinue?: (res: string) => any;
}

const icon = (
  <LoadingOutlined
    style={{ fontSize: 48, color: 'white', opacity: '.5' }}
    spin
  />
);

const Scan: FC<ScanProps> = (props) => {
  const { bridgeURL, defaultBridge, onBridgeChange, onRefresh, uri } = props;
  const [showURL, setShowURL] = useState(false);
  const { address } = useCurrentAccount();
  const { currentNetwork } = useNetwork();

  const networkName =
    getNetworkInfo(+currentNetwork.chainId)?.name || currentNetwork.name;

  return (
    <div className="w-full rounded-xl mx-auto my-0">
      <ScanCopyQRCode
        showURL={showURL}
        changeShowURL={setShowURL}
        qrcodeURL={uri || ''}
        refreshFun={onRefresh}
        onBridgeChange={onBridgeChange}
        bridgeURL={bridgeURL}
        defaultBridge={defaultBridge}
        canChangeBridge={false}
      />
      <div>1. Open Signature connect wallet</div>
      <div>
        2. Make sure you're using an address {address} on {networkName}
      </div>
      <div>3. Scan QR code</div>
    </div>
  );
};

const Process: FC<ProcessProps> = (props) => {
  const { error, onCancel, onRetry, onContinue, result, status } = props;
  const { t } = useTranslation();
  const { address } = useCurrentAccount();
  const { currentNetwork } = useNetwork();

  const networkName =
    getNetworkInfo(+currentNetwork.chainId)?.name || currentNetwork.name;

  let title = '';
  let image = '';
  let description = <></>;

  switch (status) {
    case WALLETCONNECT_STATUS_MAP.CONNECTED:
      image = './images/connection-success.png';
      title = t('Connected successfully');
      description = (
        <p className="text-gray-content text-14 text-center text-white">
          {t('Sending transaction to your phone')}
        </p>
      );
      break;
    case WALLETCONNECT_STATUS_MAP.WAITING:
      image = './images/connection-waiting.png';
      title = t('Please sign on your phone');
      description = (
        <p className="text-gray-content text-14 text-center text-white">
          {t('Waiting for signature')}
        </p>
      );
      break;
    case WALLETCONNECT_STATUS_MAP.FAILED:
      image = './images/connection-failed.png';
      title = t('Connection failed');
      description = (
        <div className="error-alert">
          {error?.code &&
            (error.code === 1000 ? t('Wrong chain') : t('Wrong address'))}
          {error?.code &&
            (error.code === 1000 ? (
              <p>
                <Trans
                  i18nKey="ChooseCorrectChain"
                  values={{
                    chain: networkName,
                  }}
                />
              </p>
            ) : (
              <p>
                <Trans
                  i18nKey="ChooseCorrectAddress"
                  values={{
                    address: `${address?.slice(0, 6)}...${address?.slice(-4)}`,
                  }}
                >
                  Choose <strong>{address}</strong> on your phone
                </Trans>
              </p>
            ))}
          {!error || (!error.code && !error) ? (
            <p>{t('No longer connected to the phone')}</p>
          ) : (
            <p>{error.message}</p>
          )}
        </div>
      );
      break;
    case WALLETCONNECT_STATUS_MAP.SUBMITTED:
      image = './images/tx-submitted.png';
      title = t('Request submitted');
      description = (
        <p className="text-gray-content text-14 text-center text-white">
          {t('Your request has been submitted')}
        </p>
      );
      break;
    case WALLETCONNECT_STATUS_MAP.REJECTED:
      image = './images/tx-rejected.png';
      title = t('Transaction rejected');
      description = (
        <p className="error-alert">
          {t('You have refused to sign the transaction')}
        </p>
      );
      break;
  }

  return (
    <div className="w-full rounded-xl mx-auto my-0">
      <div className="text-center font-bold text-20">{title}</div>
      <img src={image} alt="" className="mx-auto" />
      <div className="py-4 text-center">{description}</div>
      {result && status === WALLETCONNECT_STATUS_MAP.SUBMITTED && (
        <div className="flex justify-center items-center py-4">
          <div className="w-7 h-7 mr-2">
            <img className="w-full h-full" src={CHAINS[CHAINS_ENUM.ETH].logo} />
          </div>
          {`${result.slice(0, 6)}...${result.slice(-4)}`}
        </div>
      )}
      {(status === WALLETCONNECT_STATUS_MAP.FAILED ||
        status === WALLETCONNECT_STATUS_MAP.WAITING ||
        status === WALLETCONNECT_STATUS_MAP.REJECTED) && (
        <div className="mt-auto">
          <StrayButtons
            onBack={onCancel}
            onNext={onRetry}
            nextTitle={t('Retry')}
            backTitle={t('Cancel')}
          />
        </div>
      )}
      {status === WALLETCONNECT_STATUS_MAP.SUBMITTED && (
        <div className="watchaddress-process__ok">
          <PrimaryButton
            text={t('OK')}
            onClick={() => {
              onContinue?.(result || '');
            }}
          />
        </div>
      )}
    </div>
  );
};

export const WalletConnectModal: FC<IProps> = (props) => {
  const { open, onClose, isClosable = true, onContinue } = props;
  const wallet = useWallet();
  const [qrcodeContent, setQrcodeContent] = useState();
  const [bridgeURL, setBridge] = useState<string>(OLD_DEFAULT_BRIDGE);
  const [connectStatus, setConnectStatus] = useState(
    WALLETCONNECT_STATUS_MAP.WAITING
  );
  const [connectError, setConnectError] = useState<null | {
    code?: number;
    message?: string;
  }>(null);
  const [result, setResult] = useState();

  const initWalletConnect = async () => {
    const account = await wallet.syncGetCurrentAccount()!;
    const status = await wallet.getWalletConnectStatus(
      account.address,
      account.brandName
    );
    setConnectStatus(
      status === null ? WALLETCONNECT_STATUS_MAP.PENDING : status
    );
    eventBus.addEventListener(EVENTS.WALLETCONNECT.INITED, ({ uri }) => {
      setQrcodeContent(uri);
    });
    if (
      status !== WALLETCONNECT_STATUS_MAP.CONNECTED &&
      status !== WALLETCONNECT_STATUS_MAP.SUBMITTED
    ) {
      eventBus.emit(EVENTS.broadcastToBackground, {
        method: EVENTS.WALLETCONNECT.INIT,
        data: account,
      });
    }
  };

  const init = async () => {
    // eventBus.addEventListener(EVENTS.SIGN_FINISHED, async (data) => {
    //   if (data.success) {
    //     // resolveApproval(data.data, !isSignText);
    //     console.log({ data });
    //   } else {
    //     // rejectApproval(data.errorMsg);
    //     console.log({ data }, 'with error');
    //   }
    // });
    initWalletConnect();
    eventBus.removeAllEventListeners(EVENTS.WALLETCONNECT.STATUS_CHANGED);
    eventBus.addEventListener(
      EVENTS.WALLETCONNECT.STATUS_CHANGED,
      ({ status, payload }) => {
        setConnectStatus(status);
        switch (status) {
          case WALLETCONNECT_STATUS_MAP.CONNECTED:
            break;
          case WALLETCONNECT_STATUS_MAP.FAILED:
          case WALLETCONNECT_STATUS_MAP.REJECTED:
            if (payload.code) {
              setConnectError({ code: payload.code });
            } else {
              setConnectError(payload.params?.[0] || payload);
            }
            break;
          case WALLETCONNECT_STATUS_MAP.SUBMITTED:
            setResult(payload);
            break;
        }
      }
    );
  };

  const handleRefresh = async () => {
    initWalletConnect();
  };

  const handleRetry = async () => {
    const account = await wallet.syncGetCurrentAccount()!;
    await wallet.killWalletConnectConnector(account.address, account.brandName);
    await initWalletConnect();
    setConnectStatus(WALLETCONNECT_STATUS_MAP.PENDING);
    setConnectError(null);
  };

  const handleBridgeChange = async (val: string) => {
    setBridge(val);
    const account = await wallet.syncGetCurrentAccount()!;
    eventBus.removeAllEventListeners(EVENTS.WALLETCONNECT.INITED);
    initWalletConnect();
    wallet.setWalletConnectBridge(account.address, account.brandName, val);
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <Modal
      title={null}
      open={open}
      footer={null}
      closable={false}
      width={368}
      centered
    >
      <div className="px-4 pt-5 pb-[30px] text-white relative">
        {isClosable && (
          <div
            className="right-3 mt-1 p-1 cursor-pointer absolute hover-overlay rounded-md"
            onClick={onClose}
          >
            <CloseModalIcon />
          </div>
        )}
        <div className="font-GilroyExtraBold text-18 text-center w-full mb-[28px]">
          Wallet Connect
        </div>
        <div className="flex w-full h-full justify-center items-center">
          {connectStatus === WALLETCONNECT_STATUS_MAP.PENDING ? (
            qrcodeContent ? (
              <Scan
                uri={qrcodeContent}
                bridgeURL={bridgeURL}
                onBridgeChange={handleBridgeChange}
                onRefresh={handleRefresh}
                defaultBridge={OLD_DEFAULT_BRIDGE}
              />
            ) : (
              <Spin indicator={icon} />
            )
          ) : (
            <Process
              result={result}
              status={connectStatus}
              error={connectError}
              onRetry={handleRetry}
              onCancel={onClose}
              onContinue={onContinue}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};
