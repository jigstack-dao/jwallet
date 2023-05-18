import React, {
  createContext,
  useReducer,
  Dispatch,
  useContext,
  FC,
  PropsWithChildren,
  useEffect,
} from 'react';
import { ActionTypes, AppActions, RefreshUseHooks } from './actions';
import { InitialAppState, initialState, rootReducer } from './reducer';

const AppContext = createContext<{
  appState: InitialAppState;
  dispatch: Dispatch<AppActions>;
}>({
  appState: initialState,
  dispatch: () => null,
});

const AppProvider: FC<PropsWithChildren> = (props) => {
  const { children } = props;
  const [appState, dispatch] = useReducer(rootReducer, initialState);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (appState.currentNetwork.rpcURL && appState.currentAccount.address) {
      interval = setInterval(() => {
        dispatch({
          type: ActionTypes.UpdateRefreshUseHooks,
          payload: [RefreshUseHooks.Account_Balance],
        });
      }, 60000);
    }

    // currentProvider.on('block', (block) => {
    //   console.log('new block:', block);
    // });

    return () => {
      // currentProvider.off('block');
      clearInterval(interval);
    };
  }, [!!(appState.currentNetwork.rpcURL && appState.currentAccount.address)]);

  return (
    <AppContext.Provider value={{ appState, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => useContext(AppContext);

export { AppProvider, useAppContext };
