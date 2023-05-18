import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import ReactGA from 'react-ga';
import {
  DEFAULT_BRIDGE,
  OLD_DEFAULT_BRIDGE,
} from '@rabby-wallet/eth-walletconnect-keyring';
import { Account } from 'background/service/preference';
import {
  CHAINS,
  CHAINS_ENUM,
  WALLETCONNECT_STATUS_MAP,
  EVENTS,
  SPECIFIC_TEXT_BRAND,
} from 'consts';
import { ScanCopyQRCode } from 'ui/component';
import { useApproval, useWallet, openInTab } from 'ui/utils';
import eventBus from '@/eventBus';
import { SvgIconOpenExternal } from 'ui/assets';
import StrayButtons from '@/ui/component/Buttons/StrayButtons';
import PrimaryHeader from '@/ui/component/Headers/PrimaryHeader';
import PrimaryButton from '@/ui/component/Buttons/PrimaryButton';

interface ApprovalParams {
  address: string;
  chainId?: number;
  isGnosis?: boolean;
  data?: string[];
  account?: Account;
}

type Valueof<T> = T[keyof T];

const Scan = ({
  uri,
  chain,
  onRefresh,
  bridgeURL,
  onBridgeChange,
  defaultBridge,
  account,
}: {
  uri: string;
  chain: CHAINS_ENUM;
  bridgeURL: string;
  defaultBridge: string;
  account: Account;
  onRefresh: () => void;
  onBridgeChange: (val: string) => void;
}) => {
  const [address, setAddress] = useState<string | null>(null);
  const [showURL, setShowURL] = useState(false);
  const [brandName, setBrandName] = useState<string | null>(null);
  const chainName = CHAINS[chain].name;
  const { t } = useTranslation();
  const handleRefresh = () => {
    onRefresh();
  };
  const init = async () => {
    setAddress(account.address);
    setBrandName(account.brandName);
  };
  const showSpecialText = brandName && SPECIFIC_TEXT_BRAND[brandName];
  const displayName = 'Signature connect wallet';
  useEffect(() => {
    init();
  }, []);
  return (
    <div className="watchaddress-scan wallet-connect">
      <PrimaryHeader />
      <div className="text-center text-[22px] text-white watchaddress-scan__header">
        {t('Connect with QR-code or URL')}
      </div>
      <ScanCopyQRCode
        showURL={showURL}
        changeShowURL={setShowURL}
        qrcodeURL={uri || ''}
        refreshFun={handleRefresh}
        onBridgeChange={onBridgeChange}
        bridgeURL={bridgeURL}
        defaultBridge={defaultBridge}
        canChangeBridge={false}
      />
      <div className="watchaddress-scan__guide">
        <p>
          1.{' '}
          <Trans i18nKey="WatchGuideStep1" values={{ name: displayName }}>
            Open <strong>{displayName}</strong>
          </Trans>
        </p>
        <p>
          2.{' '}
          {!showSpecialText && (
            <Trans
              i18nKey={'WatchGuideStep2'}
              values={{
                address: `${address?.slice(0, 6)}...${address?.slice(-4)}`,
                chainName,
              }}
            >
              Make sure you are using address <strong>{address}</strong> on
              <strong>{chainName}</strong>
            </Trans>
          )}
          {showSpecialText && (
            <Trans
              i18nKey={brandName && SPECIFIC_TEXT_BRAND[brandName]!.i18nKey}
            />
          )}
        </p>
        {!showSpecialText && <p>3. {t('WatchGuideStep3')}</p>}
      </div>
      <p className="watchaddress-scan__tip">Connect via WalletConnect</p>
    </div>
  );
};

const Process = ({
  chain,
  result,
  status,
  account,
  error,
  onRetry,
  onCancel,
}: {
  chain: CHAINS_ENUM;
  result: string;
  status: Valueof<typeof WALLETCONNECT_STATUS_MAP>;
  account: Account;
  error: { code?: number; message?: string } | null;
  onRetry: () => void;
  onCancel: () => void;
}) => {
  const [address, setAddress] = useState<null | string>(null);
  const { t } = useTranslation();
  const history = useHistory();
  const handleRetry = () => {
    onRetry();
  };
  const handleCancel = () => {
    onCancel();
  };
  const handleOK = () => {
    history.push('/');
  };
  const handleClickResult = () => {
    const url = CHAIN.scanLink.replace(/_s_/, result);
    openInTab(url);
  };
  const CHAIN = CHAINS[chain];
  let image = '';
  let title = '';
  let titleColor = '';
  let description = <></>;

  switch (status) {
    case WALLETCONNECT_STATUS_MAP.CONNECTED:
      image = './images/connection-success.png';
      title = t('Connected successfully');
      titleColor = '#fff';
      description = (
        <p className="text-gray-content text-14 text-center text-white">
          {t('Sending transaction to your phone')}
        </p>
      );
      break;
    case WALLETCONNECT_STATUS_MAP.WAITING:
      image = './images/connection-waiting.png';
      title = t('Please sign on your phone');
      titleColor = '#fff';
      description = (
        <p className="text-gray-content text-14 text-center text-white">
          {t('Waiting for signature')}
        </p>
      );
      break;
    case WALLETCONNECT_STATUS_MAP.FAILED:
      image = './images/connection-failed.png';
      title = t('Connection failed');
      titleColor = '#fff';
      description = (
        <p className="error-alert">
          {error?.code &&
            (error.code === 1000 ? t('Wrong chain') : t('Wrong address'))}
          {error?.code &&
            (error.code === 1000 ? (
              <p>
                <Trans
                  i18nKey="ChooseCorrectChain"
                  values={{
                    chain: CHAINS[chain].name,
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
        </p>
      );
      break;
    case WALLETCONNECT_STATUS_MAP.SUBMITTED:
      image = './images/tx-submitted.png';
      title = t('watch Transaction submitted');
      titleColor = '#fff';
      description = (
        <p className="text-gray-content text-14 text-center text-white">
          {t('Your transaction has been submitted')}
        </p>
      );
      break;
    case WALLETCONNECT_STATUS_MAP.REJECTED:
      image = './images/tx-rejected.png';
      title = t('Transaction rejected');
      titleColor = '#fff';
      description = (
        <p className="error-alert">
          {t('You have refused to sign the transaction')}
        </p>
      );
      break;
  }

  const init = async () => {
    setAddress(account.address);
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="watchaddress-process">
      <img src={image} className="watchaddress-process__status" />
      <h2 className="watchaddress-process__title" style={{ color: titleColor }}>
        {title}
      </h2>
      {description}
      {result && status === WALLETCONNECT_STATUS_MAP.SUBMITTED && (
        <div className="watchaddress-process__result">
          <img className="icon icon-chain" src={CHAIN.logo} />
          <a
            href="javascript:;"
            className="tx-hash"
            onClick={handleClickResult}
          >
            {`${result.slice(0, 6)}...${result.slice(-4)}`}
            <SvgIconOpenExternal className="icon icon-external" />
          </a>
        </div>
      )}
      {(status === WALLETCONNECT_STATUS_MAP.FAILED ||
        status === WALLETCONNECT_STATUS_MAP.WAITING ||
        status === WALLETCONNECT_STATUS_MAP.REJECTED) && (
        <div className="mt-auto">
          <StrayButtons
            onBack={handleCancel}
            onNext={handleRetry}
            nextTitle={t('Retry')}
            backTitle={t('Cancel')}
          />
        </div>
      )}
      {status === WALLETCONNECT_STATUS_MAP.SUBMITTED && (
        <div className="watchaddress-process__ok">
          <PrimaryButton text={t('OK')} onClick={handleOK} />
        </div>
      )}
    </div>
  );
};

const WatchAddressWaiting = ({ params }: { params: ApprovalParams }) => {
  const wallet = useWallet();
  const [connectStatus, setConnectStatus] = useState(
    WALLETCONNECT_STATUS_MAP.WAITING
  );
  const [connectError, setConnectError] = useState<null | {
    code?: number;
    message?: string;
  }>(null);
  const [qrcodeContent, setQrcodeContent] = useState('');
  const [result, setResult] = useState('');
  const [getApproval, resolveApproval, rejectApproval] = useApproval();
  const chain = Object.values(CHAINS).find(
    (item) => item.id === (params.chainId || 1)
  )!.enum;
  const [isSignText, setIsSignText] = useState(false);
  const [brandName, setBrandName] = useState<string | null>(null);
  const [bridgeURL, setBridge] = useState<string>(DEFAULT_BRIDGE);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);

  const initWalletConnect = async () => {
    brandName;
    const account = params.isGnosis
      ? params.account
      : await wallet.syncGetCurrentAccount()!;
    const status = await wallet.getWalletConnectStatus(
      account.address,
      account.brandName
    );
    setConnectStatus(
      status === null ? WALLETCONNECT_STATUS_MAP.PENDING : status
    );
    setBrandName(account!.brandName);
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

  const handleCancel = () => {
    rejectApproval('user cancel');
  };

  const handleRetry = async () => {
    const account = await wallet.syncGetCurrentAccount()!;
    await wallet.killWalletConnectConnector(account.address, account.brandName);
    await initWalletConnect();
    setConnectStatus(WALLETCONNECT_STATUS_MAP.PENDING);
    setConnectError(null);
  };

  const handleRefreshQrCode = () => {
    initWalletConnect();
  };

  const init = async () => {
    const approval = await getApproval();
    const account = params.isGnosis
      ? params.account!
      : await wallet.syncGetCurrentAccount()!;
    const bridge = await wallet.getWalletConnectBridge(
      account.address,
      account.brandName
    );
    setCurrentAccount(account);
    setBridge(bridge || OLD_DEFAULT_BRIDGE);
    setIsSignText(params.isGnosis ? true : approval?.approvalType !== 'SignTx');
    ReactGA.event({
      category: 'Transaction',
      action: 'Submit',
      label: account.brandName,
    });
    eventBus.addEventListener(EVENTS.SIGN_FINISHED, async (data) => {
      if (data.success) {
        if (params.isGnosis) {
          const sigs = await wallet.getGnosisTransactionSignatures();
          if (sigs.length > 0) {
            await wallet.gnosisAddConfirmation(account.address, data.data);
          } else {
            await wallet.gnosisAddSignature(account.address, data.data);
            await wallet.postGnosisTransaction();
          }
        }
        resolveApproval(data.data, !isSignText);
      } else {
        rejectApproval(data.errorMsg);
      }
    });

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
    initWalletConnect();
  };

  const handleBridgeChange = async (val: string) => {
    const account = params.isGnosis
      ? params.account
      : await wallet.syncGetCurrentAccount()!;
    setBridge(val);
    eventBus.removeAllEventListeners(EVENTS.WALLETCONNECT.INITED);
    initWalletConnect();
    wallet.setWalletConnectBridge(account.address, account.brandName, val);
  };

  useEffect(() => {
    init();
  }, []);
  return (
    <div className="watchaddress">
      <div className="watchaddress-operation">
        {connectStatus === WALLETCONNECT_STATUS_MAP.PENDING &&
        qrcodeContent &&
        currentAccount ? (
          <Scan
            uri={qrcodeContent}
            chain={chain}
            bridgeURL={bridgeURL}
            onBridgeChange={handleBridgeChange}
            onRefresh={handleRefreshQrCode}
            defaultBridge={DEFAULT_BRIDGE}
            account={currentAccount}
          />
        ) : (
          currentAccount && (
            <Process
              chain={chain}
              result={result}
              status={connectStatus}
              error={connectError}
              onRetry={handleRetry}
              onCancel={handleCancel}
              account={currentAccount}
            />
          )
        )}
      </div>
    </div>
  );
};

export default WatchAddressWaiting;
