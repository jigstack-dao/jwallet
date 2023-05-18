import React from 'react';
import { Switch, Route } from 'react-router-dom';
import ReactGA, { ga } from 'react-ga';
import { PrivateRoute } from 'ui/component';

import Welcome from './Welcome';
import NoAddress from './NoAddress';
import CreatePassword from './CreatePassword';
import ImportMode from './ImportMode';
import ImportPrivateKey from './ImportPrivateKey';
import ImportJson from './ImportJson';
import ImportMnemonics from './ImportMnemonics';
import ImportWatchAddress from './ImportWatchAddress';
import ImportQRCodeBase from './ImportQRCodeBase';
import SelectAddress from './SelectAddress';
import ImportSuccess from './ImportSuccess';
import ImportHardware from './ImportHardware';
import ImportLedgerPathSelect from './ImportHardware/LedgerHdPath';
import ImportGnosis from './ImportGnosisAddress';
import ConnectLedger from './ImportHardware/LedgerConnect';
import Settings from './Settings';
import ConnectedSites from './ConnectedSites';
import Approval from './Approval';
import TokenApproval from './TokenApproval';
import NFTApproval from './NFTApproval';
import CreateMnemonics from './CreateMnemonics';
import AddAddress from './AddAddress';
import ChainManagement, { StartChainManagement } from './ChainManagement';
import ChainList from './ChainList';
import AddressManagement from './AddressManagement';
import SwitchLang from './SwitchLang';
import TransactionHistory from './TransactionHistory';
import History from './History';
import SignedTextHistory from './SignedTextHistory';
import GnosisTransactionQueue from './GnosisTransactionQueue';
import QRCodeReader from './QRCodeReader';
import AdvancedSetting from './AdvancedSetting';
import RequestPermission from './RequestPermission';
import SendToken from './SendToken';
import SendNFT from './SendNFT';
import WalletConnectTemplate from './WalletConnect';
import ConnectWallet from './ConnectWallet';
import ScreenSuccess from './ScreenSuccess';
import ScreenFailed from './ScreenFailed';
import Redirect from './Redirect';
import ConnectWithQRCode from './ConnectWithQRCode';

import ImportAccount from './ImportAccount';
import Routes from '@/constant/routes';
import AddCustomNetwork from './AddCustomNetwork';
import AddNetwork from './AddNetwork';
import BuyToken from './BuyToken';
import Santa from './Santa';
import Swap from './Swap';
import SearchToken from './SearchToken';
import AddCustomToken from './AddCustomToken';
import SettingBoard from './SettingBoard';
import GeneralSetting from './GeneralSetting';
import ContactsSetting from './ContactsSetting';
import NetworksSetting from './NetworksSetting';
import PrivateInfoSetting from './PrivateInfoSetting';
import CommingSoon from './CommingSoon';
import LoggedLayout from '../containers/LoggedLayout';
import Chainlist from './ChainlistIntegrate';
ReactGA.initialize('UA-199755108-1', {
  gaAddress: '/scripts/ga.js',
});
// eslint-disable-next-line @typescript-eslint/no-empty-function
ga('set', 'checkProtocolTask', function () {});
ga('set', 'appName', 'Jigstack');
ga('set', 'appVersion', process.env.release);
ga('require', 'displayfeatures');

const LogPageView = () => {
  ReactGA.pageview(window.location.hash);

  return null;
};

const Main = () => {
  return (
    <>
      <Route path="/" component={LogPageView} />
      <Switch>
        <Route exact path={Routes.CommingSoon}>
          <CommingSoon />
        </Route>
        <Route exact path={Routes.Welcome}>
          <Welcome />
        </Route>
        <Route exact path={Routes.CreatePassword}>
          <CreatePassword />
        </Route>

        <PrivateRoute exact path={Routes.NoAddress}>
          <NoAddress />
        </PrivateRoute>
        <PrivateRoute exact path={Routes.StartChainManagement}>
          <StartChainManagement />
        </PrivateRoute>
        <PrivateRoute exact path={Routes.CreateMnemonics}>
          <CreateMnemonics />
        </PrivateRoute>
        <PrivateRoute exact path={Routes.ScreenSuccess}>
          <ScreenSuccess />
        </PrivateRoute>
        <PrivateRoute exact path={Routes.ScreenFailed}>
          <ScreenFailed />
        </PrivateRoute>
        <PrivateRoute exact path={Routes.Redirect}>
          <Redirect />
        </PrivateRoute>
        <PrivateRoute exact path="/import">
          <ImportMode />
        </PrivateRoute>
        <PrivateRoute exact path="/connect">
          <ConnectWallet />
        </PrivateRoute>

        <PrivateRoute exact path={Routes.ImportPrivateKey}>
          <ImportPrivateKey />
        </PrivateRoute>

        <PrivateRoute exact path={Routes.ImportJson}>
          <ImportJson />
        </PrivateRoute>
        <PrivateRoute exact path={Routes.ImportMnemonics}>
          <ImportMnemonics />
        </PrivateRoute>
        <PrivateRoute exact path={Routes.ImportAccount}>
          <ImportAccount />
        </PrivateRoute>
        <PrivateRoute exact path="/popup/import/select-address">
          <SelectAddress isPopup />
        </PrivateRoute>
        <PrivateRoute exact path="/import/select-address">
          <SelectAddress />
        </PrivateRoute>
        <PrivateRoute exact path="/import/hardware">
          <ImportHardware />
        </PrivateRoute>
        <PrivateRoute exact path="/imardware/ledger-connect">
          <ConnectLedger />
        </PrivateRoute>
        <PrivateRoute exact path="/import/hardware/ledger">
          <ImportLedgerPathSelect />
        </PrivateRoute>
        <PrivateRoute exact path="/import/watch-address">
          <ImportWatchAddress />
        </PrivateRoute>
        <PrivateRoute exact path="/import/qrcode">
          <ImportQRCodeBase />
        </PrivateRoute>
        <PrivateRoute exact path="/import/wallet-connect">
          <WalletConnectTemplate />
        </PrivateRoute>
        <PrivateRoute exact path="/popup/import/success">
          <ImportSuccess isPopup />
        </PrivateRoute>
        <PrivateRoute exact path="/import/success">
          <ImportSuccess />
        </PrivateRoute>
        <PrivateRoute exact path="/tx-history">
          <TransactionHistory />
        </PrivateRoute>
        <PrivateRoute exact path="/history">
          <History />
        </PrivateRoute>
        <PrivateRoute exact path="/text-history">
          <SignedTextHistory />
        </PrivateRoute>
        <PrivateRoute exact path="/gnosis-queue">
          <GnosisTransactionQueue />
        </PrivateRoute>
        <PrivateRoute exact path="/import/gnosis">
          <ImportGnosis />
        </PrivateRoute>
        <PrivateRoute exact path="/add-address">
          <AddAddress />
        </PrivateRoute>
        <PrivateRoute exact path="/approval">
          <Approval />
        </PrivateRoute>
        <PrivateRoute exact path="/token-approval">
          <TokenApproval />
        </PrivateRoute>
        <PrivateRoute exact path="/nft-approval">
          <NFTApproval />
        </PrivateRoute>
        <PrivateRoute exact path="/settings">
          <Settings />
        </PrivateRoute>
        <PrivateRoute exact path="/settings/address">
          <AddressManagement />
        </PrivateRoute>
        <PrivateRoute exact path="/settings/sites">
          <ConnectedSites />
        </PrivateRoute>
        <PrivateRoute exact path="/settings/chain">
          <ChainManagement />
        </PrivateRoute>
        <PrivateRoute exact path="/settings/chain-list">
          <ChainList />
        </PrivateRoute>
        <PrivateRoute exact path="/settings/switch-lang">
          <SwitchLang />
        </PrivateRoute>
        <PrivateRoute exact path="/qrcode-reader">
          <QRCodeReader />
        </PrivateRoute>
        <PrivateRoute exact path="/request-permission">
          <RequestPermission />
        </PrivateRoute>
        <PrivateRoute exact path={Routes.SendToken}>
          <LoggedLayout>
            <SendToken />
          </LoggedLayout>
        </PrivateRoute>
        <PrivateRoute exact path="/send-nft">
          <SendNFT />
        </PrivateRoute>
        <PrivateRoute exact path={Routes.ImportQRCode}>
          <ConnectWithQRCode />
        </PrivateRoute>
        <PrivateRoute exact path={Routes.AddCustomNetwork}>
          <LoggedLayout>
            <AddCustomNetwork />
          </LoggedLayout>
        </PrivateRoute>
        <PrivateRoute exact path={Routes.AddNetwork}>
          <LoggedLayout>
            <AddNetwork />
          </LoggedLayout>
        </PrivateRoute>
        <PrivateRoute exact path={Routes.AddChainlistNetwork}>
          <LoggedLayout>
            <Chainlist />
          </LoggedLayout>
        </PrivateRoute>
        <PrivateRoute exact path={Routes.BuyToken}>
          <LoggedLayout>
            <BuyToken />
          </LoggedLayout>
        </PrivateRoute>
        <PrivateRoute exact path={Routes.Santa}>
          <LoggedLayout>
            <Santa />
          </LoggedLayout>
        </PrivateRoute>
        <PrivateRoute exact path={Routes.Swap}>
          <LoggedLayout>
            <Swap />
          </LoggedLayout>
        </PrivateRoute>

        <PrivateRoute exact path={Routes.SearchToken}>
          <LoggedLayout>
            <SearchToken />
          </LoggedLayout>
        </PrivateRoute>
        <PrivateRoute exact path={Routes.AddCustomToken}>
          <LoggedLayout>
            <AddCustomToken />
          </LoggedLayout>
        </PrivateRoute>
        <PrivateRoute exact path={Routes.SettingBoard}>
          <SettingBoard />
        </PrivateRoute>
        <PrivateRoute exact path={Routes.GeneralSetting}>
          <GeneralSetting />
        </PrivateRoute>
        <PrivateRoute exact path={Routes.AdvancedSetting}>
          <AdvancedSetting />
        </PrivateRoute>
        <PrivateRoute exact path={Routes.ContactsSetting}>
          <ContactsSetting />
        </PrivateRoute>
        <PrivateRoute exact path={Routes.NetworksSetting}>
          <NetworksSetting />
        </PrivateRoute>
        <PrivateRoute exact path={Routes.PrivateInfoSetting}>
          <PrivateInfoSetting />
        </PrivateRoute>
      </Switch>
    </>
  );
};

export default Main;
