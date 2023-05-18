import React, { memo, useEffect, useState } from 'react';
import { Route, Redirect, useHistory } from 'react-router-dom';
import { useWallet } from 'ui/utils';
import Routes from '@/constant/routes';
import { useAppContext } from '@/context';
import { ActionTypes } from '@/context/actions';
import useUsingWallet from '@/hooks/wallet/useUsingWallet';
import { ONE_MILISECONDS, ONE_MINUTE_IN_SECONDS } from '@/constant';

const Wrap = function Wrap({ children }) {
  const wallet = useWallet();
  const [isBooted, setIsBooted] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const to = !isBooted ? Routes.Welcome : !isUnlocked ? Routes.Unlock : null;
  const { appState, dispatch } = useAppContext();
  const history = useHistory();
  const hasUsing = useUsingWallet();

  const init = async () => {
    const setting = await wallet.getAdvancedSetting();
    dispatch({
      type: ActionTypes.UpdateAutoLockTimeLimit,
      payload: setting.lockTimer,
    });
    setIsBooted(await wallet.isBooted());
    setIsUnlocked(await wallet.isUnlocked());
    setIsReady(true);
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    const minutes =
      appState.autoLockTimeLimit * ONE_MINUTE_IN_SECONDS * ONE_MILISECONDS;
    const intervalLock = setInterval(() => {
      wallet.lockWallet();
      history.push('/unlock');
    }, minutes);
    return () => {
      clearInterval(intervalLock);
    };
  }, [appState.autoLockTimeLimit, hasUsing]);

  if (!isReady) return <></>;
  return !to ? children : <Redirect to={to} />;
};

const MemoWrap = memo(Wrap);

const PrivateRoute = ({ children, ...rest }) => {
  return <Route {...rest} render={() => <MemoWrap>{children}</MemoWrap>} />;
};

export default PrivateRoute;
