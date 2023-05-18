import React, { lazy, Suspense, useEffect } from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import { WalletProvider } from 'ui/utils';
import { PrivateRoute } from 'ui/component';
import Dashboard from './Dashboard';
import Unlock from './Unlock';
import SortHat from './SortHat';
import 'antd/dist/antd.css';
import './style.less';
import { AppProvider } from '@/context';
import Routes from '@/constant/routes';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import useLoadingScreen from '@/hooks/wallet/useLoadingScreen';
import LoggedLayout from '../containers/LoggedLayout';
import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
const AsyncMainRoute = lazy(() => import('./MainRoute'));

const Main = () => {
  const { loadingScreen } = useLoadingScreen();
  return (
    <>
      {loadingScreen && (
        <div className="loading-screen-container">
          <Spin
            indicator={
              <LoadingOutlined
                style={{ fontSize: 48, color: 'white', opacity: '.5' }}
                spin
              />
            }
          />
        </div>
      )}
      <Router>
        <Route exact path="/">
          <SortHat />
        </Route>

        <Route exact path={Routes.Unlock}>
          <Unlock />
        </Route>

        <PrivateRoute exact path={Routes.Dashboard}>
          <LoggedLayout>
            <Dashboard />
          </LoggedLayout>
        </PrivateRoute>
        <Suspense fallback={null}>
          <AsyncMainRoute />
        </Suspense>
      </Router>
    </>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 86400000, // 1 days
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window?.localStorage,
});

const App = ({ wallet }: { wallet: any }) => {
  useEffect(() => {
    void (async () => {
      const intervalId = setInterval(async () => {
        await wallet.setClosingTime();
      }, 3000);
      return () => clearInterval(intervalId);
    })();
  }, []);

  return (
    <WalletProvider wallet={wallet}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
        }}
      >
        <AppProvider>
          <Main />
        </AppProvider>
      </PersistQueryClientProvider>
    </WalletProvider>
  );
};

export default App;
