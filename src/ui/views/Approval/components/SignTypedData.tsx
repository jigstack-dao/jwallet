import React, { useEffect, useState } from 'react';
import { Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import { WaitingSignComponent } from './SignText';
import { KEYRING_CLASS, KEYRING_TYPE } from 'consts';
import { useApproval, useWallet } from 'ui/utils';
import {
  SecurityCheckResponse,
  SecurityCheckDecision,
} from 'background/service/openapi';
import SecurityCheckBar from './SecurityCheckBar';
import SecurityCheckDetail from './SecurityCheckDetail';
import AccountCard from './AccountCard';
import { hasConnectedLedgerDevice } from '@/utils';
import LedgerWebHIDAlert from './LedgerWebHIDAlert';
import IconQuestionMark from 'ui/assets/question-mark-gray.svg';
import { Account } from '@/background/service/preference';
import StrayButtons from '@/ui/component/Buttons/StrayButtons';
interface SignTypedDataProps {
  method: string;
  data: any[];
  session: {
    origin: string;
    icon: string;
    name: string;
  };
  account?: Account;
}

const SignTypedData = ({ params }: { params: SignTypedDataProps }) => {
  const [, resolveApproval, rejectApproval] = useApproval();
  const { t } = useTranslation();
  const wallet = useWallet();
  const [isWatch, setIsWatch] = useState(false);
  const [isLedger, setIsLedger] = useState(false);
  const [useLedgerLive, setUseLedgerLive] = useState(false);
  const [hasConnectedLedgerHID, setHasConnectedLedgerHID] = useState(false);
  const [submitText, setSubmitText] = useState('Proceed');
  const [checkText, setCheckText] = useState('Sign');
  const { data, session, method } = params;
  let parsedMessage = '';
  let _message = '';
  try {
    // signTypeDataV1 [Message, from]
    if (/^eth_signTypedData(_v1)?$/.test(method)) {
      _message = data[0].reduce((m, n) => {
        m[n.name] = n.value;
        return m;
      }, {});
    } else {
      // [from, Message]
      _message = JSON.parse(data[1])?.message;
    }

    parsedMessage = JSON.stringify(_message, null, 4);
  } catch (err) {
    console.log('parse message error', parsedMessage);
  }

  const [showSecurityCheckDetail, setShowSecurityCheckDetail] = useState(false);
  const [securityCheckStatus, setSecurityCheckStatus] =
    useState<SecurityCheckDecision>('pending');
  const [securityCheckAlert, setSecurityCheckAlert] = useState(
    t<string>('Checking')
  );
  const [securityCheckDetail, setSecurityCheckDetail] =
    useState<SecurityCheckResponse | null>(null);
  const [explain, setExplain] = useState('');

  const checkWatchMode = async () => {
    const currentAccount = await wallet.getCurrentAccount();
    if (currentAccount.type === KEYRING_TYPE.WatchAddressKeyring) {
      setIsWatch(true);
    }
    if (currentAccount.type === KEYRING_TYPE.GnosisKeyring) {
      setIsWatch(true);
    }
  };

  const handleSecurityCheck = async () => {
    setSecurityCheckStatus('loading');
    const currentAccount = await wallet.getCurrentAccount();
    let check, serverExplain;
    const dataStr = JSON.stringify(data);

    try {
      check = await wallet.openapi.checkText(
        currentAccount!.address,
        session.origin,
        dataStr
      );
      serverExplain = await wallet.openapi.explainText(
        session.origin,
        currentAccount!.address,
        dataStr
      );
    } catch (error) {
      check = {
        decision: 'pass',
        alert: '',
        warning_list: [],
        danger_list: [],
        forbidden_list: [],
      };
      serverExplain = {
        comment: 'unknown text',
        status: 'unknown',
      };
    }
    setExplain(serverExplain.comment);
    setSecurityCheckStatus(check.decision);
    setSecurityCheckAlert(check.alert);
    setSecurityCheckDetail(check);
  };

  const handleCancel = () => {
    rejectApproval('User rejected the request.');
  };

  const handleAllow = async (doubleCheck = false) => {
    if (
      !doubleCheck &&
      securityCheckStatus !== 'pass' &&
      securityCheckStatus !== 'pending'
    ) {
      setShowSecurityCheckDetail(true);

      return;
    }
    const currentAccount = await wallet.getCurrentAccount();
    if (currentAccount?.type === KEYRING_CLASS.HARDWARE.LEDGER) {
      try {
        const transport = await TransportWebHID.create();
        await transport.close();
      } catch (e) {
        // ignore transport create error when ledger is not connected, it works but idk why
        console.log(e);
      }
    }
    if (currentAccount?.type && WaitingSignComponent[currentAccount?.type]) {
      resolveApproval({
        uiRequestComponent: WaitingSignComponent[currentAccount?.type],
        type: currentAccount.type,
        address: currentAccount.address,
        extra: {
          brandName: currentAccount.brandName,
        },
      });

      return;
    }

    resolveApproval({});
  };

  const init = async () => {
    const currentAccount = await wallet.getCurrentAccount();
    setIsLedger(currentAccount?.type === KEYRING_CLASS.HARDWARE.LEDGER);
    setUseLedgerLive(await wallet.isUseLedgerLive());
    setHasConnectedLedgerHID(await hasConnectedLedgerDevice());
  };

  useEffect(() => {
    init();
    checkWatchMode();
  }, []);

  useEffect(() => {
    (async () => {
      const currentAccount = await wallet.getCurrentAccount();
      if (
        [
          KEYRING_CLASS.MNEMONIC,
          KEYRING_CLASS.PRIVATE_KEY,
          KEYRING_CLASS.WATCH,
        ].includes(currentAccount.type)
      ) {
        setSubmitText('Sign');
        setCheckText('Sign');
      } else {
        setSubmitText('Proceed');
        setCheckText('Proceed');
      }
      if (['danger', 'forbidden'].includes(securityCheckStatus)) {
        setSubmitText('Continue');
      }
    })();
  }, [securityCheckStatus]);

  return (
    <>
      <div className="approval-text flex flex-col justify-between">
        <div>
          <p className="section-title">{t('Sign Typed Message')}</p>
          <AccountCard account={params.account} />
          <div className="text-detail-wrapper gray-section-block">
            <div className="text-detail text-gray-subTitle">
              {parsedMessage}
            </div>
          </div>
          {isLedger && !useLedgerLive && !hasConnectedLedgerHID && (
            <LedgerWebHIDAlert connected={hasConnectedLedgerHID} />
          )}
          {explain && (
            <p className="text-explain">
              {explain}
              <Tooltip
                placement="topRight"
                overlayClassName="text-explain-tooltip"
                title={t(
                  'This summary information is provide by DeBank OpenAPI'
                )}
              >
                <img
                  src={IconQuestionMark}
                  className="icon icon-question-mark"
                />
              </Tooltip>
            </p>
          )}
          <SecurityCheckBar
            status={securityCheckStatus}
            alert={securityCheckAlert}
            onClick={() => setShowSecurityCheckDetail(true)}
            onCheck={handleSecurityCheck}
          />
        </div>
        <StrayButtons
          backTitle={t('Cancel')}
          nextTitle={isWatch ? t('Sign') : t(submitText)}
          onBack={handleCancel}
          onNext={handleAllow}
          disabledNext={
            isWatch
              ? true
              : isLedger && !useLedgerLive && !hasConnectedLedgerHID
          }
        />
      </div>
      {securityCheckDetail && !isWatch && (
        <SecurityCheckDetail
          open={showSecurityCheckDetail}
          onCancel={() => setShowSecurityCheckDetail(false)}
          data={securityCheckDetail}
          onOk={() => handleAllow(true)}
          okText={t(checkText)}
          cancelText={t('Cancel')}
        />
      )}
    </>
  );
};

export default SignTypedData;
