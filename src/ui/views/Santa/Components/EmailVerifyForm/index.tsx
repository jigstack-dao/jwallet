import InputText from '@/ui/component/Inputs/InputText';
import { ReactComponent as InfoIcon } from '@/ui/assets/jwallet/info.svg';
import './style.less';
import React, { useEffect, useMemo, useState } from 'react';
import PrimaryButton from '@/ui/component/Buttons/PrimaryButton';
import { apiConnection } from '@/utils/api';
import { ReactComponent as CheckSuccessIcon } from '@/ui/assets/jwallet/check-success.svg';
import SendGiftForm from '../SendGiftForm';
import useLoadingScreen from '@/hooks/wallet/useLoadingScreen';
import jwalletAPI from '@/background/service/jwalletAPI';
import useCurrentAccount from '@/hooks/wallet/useCurrentAccount';
import { useWallet } from '@/ui/utils';
import { useHistory } from 'react-router-dom';
import useVerify from './reducers/useVerify';
import {
  changeEmail,
  enterCode,
  retrieve,
  setErr,
  verifyCode,
  verifyEmail,
} from './reducers/actions';
import VerifyState from './reducers/interfaces';

const EmailVerifyForm: React.FC<{ token: string }> = ({ token }) => {
  const [passVerified, setPassVerified] = useState(false);
  const [state, dispatch] = useVerify();
  const currentAccount = useCurrentAccount();
  const wallet = useWallet();
  const history = useHistory();
  const [retrieved, setRetrieved] = useState(false);
  const { updateLoadingScreen } = useLoadingScreen();

  const handleChangeEmail = (value: string) => {
    dispatch(changeEmail(value));
  };

  const onVerifyEmail = async () => {
    if (!token) return;
    updateLoadingScreen(true);
    const { data } = await API.post('/users/authorizations', {
      email: state.email,
    });
    if (data.code == 400 && data.message == 'Email already in use!') {
      dispatch(setErr('Email already in use!'));
    } else {
      dispatch(verifyEmail(true));
    }
    updateLoadingScreen(false);
  };

  const onVerifyCode = async () => {
    try {
      updateLoadingScreen(true);
      const { data } = await API.post('/users', {
        uuidToken: state.code,
      });
      if (!data.code || (data.code >= 200 && data.code < 300)) {
        dispatch(verifyCode(true));
        jwalletAPI.updateVerifySantaEmail(currentAccount.address, state.email);
        wallet.clearPageStateCache();
      } else {
        dispatch(setErr('Invalid code verify!'));
      }
    } catch {
      dispatch(setErr('Invalid code verify!'));
    } finally {
      updateLoadingScreen(false);
    }
  };

  useEffect(() => {
    const handleLoadCache = async () => {
      const cache = await wallet.getPageStateCache()!;
      if (cache && cache.path === history.location.pathname) {
        dispatch(retrieve(cache.states as VerifyState));
        wallet.clearPageStateCache();
      }
    };

    void (async () => {
      if (await wallet.hasPageStateCache()) {
        await handleLoadCache();
      }
      setRetrieved(true);
    })();
  }, []);

  useEffect(() => {
    return () => {
      if (retrieved) {
        wallet.clearPageStateCache();
      }
    };
  }, [retrieved]);

  useEffect(() => {
    (async () => {
      if (retrieved) {
        await wallet.setPageStateCache({
          path: history.location.pathname,
          params: {},
          states: state,
        });
      }
    })();
  }, [retrieved, wallet, history, state]);

  const API = useMemo(() => {
    const baseURL = process.env.REACT_APP_SANTA_API || '';
    const headers = {
      Authorization: token !== '' ? `Bearer ${token}` : 'Bearer',
    };
    return apiConnection(baseURL, headers);
  }, [token]);

  const renderInput = () => {
    if (!state.emailVerified) {
      return (
        <InputText
          placeHolder="Enter your email address"
          value={state.email}
          onChange={(e) => handleChangeEmail(e.target.value)}
          errorMsg={state.errorMsg}
        />
      );
    }

    return (
      <InputText
        placeHolder="Enter verification code"
        value={state.code}
        onChange={(e) => {
          dispatch(enterCode(e.target.value));
          dispatch(setErr(''));
        }}
        errorMsg={state.errorMsg}
      />
    );
  };

  const renderText = () => {
    return !state.emailVerified
      ? 'To use this function you have to verify your email first'
      : 'Verification code has been sent to your email';
  };

  const renderButton = () => {
    if (!state.emailVerified) {
      return (
        <PrimaryButton
          text="VERIFY EMAIL"
          disabled={!state.email || !!state.errorMsg}
          onClick={onVerifyEmail}
        />
      );
    }
    return (
      <PrimaryButton
        text="VERIFY CODE"
        disabled={!state.code || !!state.errorMsg}
        onClick={onVerifyCode}
      />
    );
  };

  const renderCodeVerified = () => {
    return (
      <>
        <div className="code-verified">
          <div className="icon">
            <CheckSuccessIcon />
          </div>
          <span className="text">Email address is verified!</span>
        </div>
        <PrimaryButton text="OK" onClick={() => setPassVerified(true)} />
      </>
    );
  };

  if (passVerified) {
    return <SendGiftForm token={token} />;
  }

  if (state.codeVerified) {
    return renderCodeVerified();
  }

  return (
    <div>
      <div className="mb-4">{renderInput()}</div>
      <div className="detect-new-email">
        <div>
          <InfoIcon />
        </div>
        <div className="text">{renderText()}</div>
      </div>
      {renderButton()}
    </div>
  );
};

export default EmailVerifyForm;
