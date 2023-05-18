import { WALLETCONNECT_STATUS_MAP } from '@/constant';
import { isBrowser } from '@/utils/misc';
import WalletConnectKeyring, {
  OLD_DEFAULT_BRIDGE,
} from '@rabby-wallet/eth-walletconnect-keyring';
import WalletConnect from '@walletconnect/client';

export class WrappedWalletConnectKeyring extends WalletConnectKeyring {
  createConnector = async (brandName: string, bridge = OLD_DEFAULT_BRIDGE) => {
    if (isBrowser() && localStorage.getItem('walletconnect')) {
      // always clear walletconnect cache
      localStorage.removeItem('walletconnect');
    }
    const connector = new WalletConnect({
      bridge,
      clientMeta: this.clientMeta!,
    });
    connector.on('connect', (error, payload) => {
      if (payload?.params[0]?.accounts) {
        const [account] = payload.params[0].accounts;
        this.connectors[`${brandName}-${account.toLowerCase()}`] = {
          connector,
          status: connector.connected
            ? WALLETCONNECT_STATUS_MAP.CONNECTED
            : WALLETCONNECT_STATUS_MAP.PENDING,
          chainId: payload?.params[0]?.chainId,
          brandName,
        };
        setTimeout(() => {
          this.closeConnector(connector, account.address, brandName);
        }, this.maxDuration);
      }

      this.onAfterConnect?.(error, payload);
    });

    connector.on('disconnect', (error, payload) => {
      this.onDisconnect?.(error, payload);
    });

    connector.on('transport_error', (_, payload) => {
      this.emit('transport_error', payload);
      // address is not necessary to close connection
      this.closeConnector(connector, '0x', brandName);
    });

    await connector.createSession();

    return connector;
  };
}
