import LRU from 'lru-cache';
import { createPersistStore } from 'background/utils';
import {
  defaultNetwork,
  INTERNAL_REQUEST_ORIGIN,
  NETWORKS_SUPPORT_DEFAULT,
} from 'consts';
import { max } from 'lodash';

export interface ConnectedSite {
  origin: string;
  icon: string;
  name: string;
  e?: number;
  isSigned: boolean;
  isTop: boolean;
  order?: number;
  isConnected: boolean;
  chainId: number;
}

export interface PermissionStore {
  dumpCache: ReadonlyArray<LRU.Entry<string, ConnectedSite>>;
}

export interface NetworkChain {
  chainId: number;
  name: string;
  symbol: string;
  decimals: number;
  scanLink: string;
  rpcURL: string;
}

interface NetworkStore {
  chains: NetworkChain[];
  tokens: TokenSaved[];
  currentChainId: number;
}

export interface TokenSaved {
  id: number;
  address: string;
  name: string;
  symbol: string;
  decimal: number;
  img: string;
  standard: string;
  chainId: number;
  createdAt: number;
}

class PermissionService {
  store: PermissionStore = {
    dumpCache: [],
  };

  lruCache: LRU<string, ConnectedSite> | undefined;
  // currentNetworkTemporary: number | undefined;
  networkStore!: NetworkStore;

  init = async () => {
    const storage = await createPersistStore<PermissionStore>({
      name: 'permission',
    });
    this.store = storage || this.store;
    // this.currentNetworkTemporary = defaultNetwork.chainId;
    this.networkStore = await createPersistStore<NetworkStore>({
      name: 'networkStore',
      template: {
        chains: [],
        tokens: [],
        currentChainId: 0,
      },
    });
    if (this.networkStore.chains.length == 0) {
      this.networkStore.chains = [...NETWORKS_SUPPORT_DEFAULT];
    }
    if (this.networkStore.tokens.length == 0) {
      this.networkStore.tokens = [];
    }
    if (!this.networkStore.currentChainId) {
      this.networkStore.currentChainId = defaultNetwork.chainId;
    }
    this.lruCache = new LRU();
    const cache: ReadonlyArray<LRU.Entry<string, ConnectedSite>> = (
      this.store.dumpCache || []
    ).map((item) => ({
      k: item.k,
      v: item.v,
      e: 0,
    }));
    this.lruCache.load(cache);
  };

  sync = () => {
    if (!this.lruCache) return;
    this.store.dumpCache = this.lruCache.dump();
  };

  getWithoutUpdate = (key: string) => {
    if (!this.lruCache) return;

    return this.lruCache.peek(key);
  };

  getSite = (origin: string) => {
    return this.lruCache?.get(origin);
  };

  setSite = (site: ConnectedSite) => {
    if (!this.lruCache) return;
    this.lruCache.set(site.origin, site);
    this.sync();
  };

  addConnectedSite = (
    origin: string,
    name: string,
    icon: string,
    chainId: number,
    isSigned = false
  ) => {
    if (!this.lruCache) return;

    this.lruCache.set(origin, {
      origin,
      name,
      icon,
      isSigned,
      isTop: false,
      isConnected: true,
      chainId,
    });
    this.sync();
  };

  touchConnectedSite = (origin) => {
    if (!this.lruCache) return;
    if (origin === INTERNAL_REQUEST_ORIGIN) return;
    this.lruCache.get(origin);
    this.sync();
  };

  updateConnectSite = (
    origin: string,
    value: Partial<ConnectedSite>,
    partialUpdate?: boolean
  ) => {
    if (!this.lruCache || !this.lruCache.has(origin)) return;
    if (origin === INTERNAL_REQUEST_ORIGIN) return;

    if (partialUpdate) {
      const _value = this.lruCache.get(origin);
      this.lruCache.set(origin, { ..._value, ...value } as ConnectedSite);
    } else {
      this.lruCache.set(origin, value as ConnectedSite);
    }

    this.sync();
  };

  hasPermission = (origin) => {
    if (!this.lruCache) return;
    if (origin === INTERNAL_REQUEST_ORIGIN) return true;

    const site = this.lruCache.get(origin);
    return site?.isConnected;
  };

  setRecentConnectedSites = (sites: ConnectedSite[]) => {
    this.lruCache?.load(
      sites
        .map((item) => ({
          e: 0,
          k: item.origin,
          v: item,
        }))
        .concat(
          (this.lruCache?.values() || [])
            .filter((item) => !item.isConnected)
            .map((item) => ({
              e: 0,
              k: item.origin,
              v: item,
            }))
        )
    );
    this.sync();
  };

  getRecentConnectedSites = () => {
    const sites = (this.lruCache?.values() || []).filter(
      (item) => item.isConnected
    );
    const pinnedSites = sites
      .filter((item) => item?.isTop)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    const recentSites = sites.filter((item) => !item.isTop);
    return [...pinnedSites, ...recentSites];
  };

  getConnectedSites = () => {
    return (this.lruCache?.values() || []).filter((item) => item.isConnected);
  };

  getConnectedSite = (key: string) => {
    const site = this.lruCache?.get(key);
    if (site?.isConnected) {
      return site;
    }
  };

  topConnectedSite = (origin: string, order?: number) => {
    const site = this.getConnectedSite(origin);
    if (!site || !this.lruCache) return;
    order =
      order ??
      (max(this.getRecentConnectedSites().map((item) => item.order)) || 0) + 1;
    this.updateConnectSite(origin, {
      ...site,
      order,
      isTop: true,
    });
  };

  unpinConnectedSite = (origin: string) => {
    const site = this.getConnectedSite(origin);
    if (!site || !this.lruCache) return;
    this.updateConnectSite(origin, {
      ...site,
      isTop: false,
    });
  };

  removeConnectedSite = (origin: string) => {
    if (!this.lruCache) return;
    const site = this.getConnectedSite(origin);
    if (!site) {
      return;
    }
    this.setSite({
      ...site,
      isConnected: false,
    });
    this.sync();
  };

  getSitesByDefaultChain = (chainId: number) => {
    if (!this.lruCache) return [];
    return this.lruCache.values().filter((item) => item.chainId === chainId);
  };

  isInternalOrigin = (origin: string) => {
    return origin === INTERNAL_REQUEST_ORIGIN;
  };

  setCurrentNetworkTemporary = (chainId: number) => {
    this.networkStore.currentChainId = chainId;
  };

  getCurrentNetworkTemporary = () => this.networkStore.currentChainId;

  getAllNetworks = () => this.networkStore.chains;

  getNetworkByChainId = (chainId: number) => {
    if (!this.networkStore) return defaultNetwork;
    return (
      this.getAllNetworks().find((x) => x.chainId == chainId) || defaultNetwork
    );
  };

  upsertNetwork = (network: NetworkChain, oldChain = 0) => {
    const _networks = [...this.getAllNetworks()];
    const chainToReplace = +oldChain ? +oldChain : network.chainId;
    const index = _networks.findIndex((x) => x.chainId == chainToReplace);
    if (index >= 0) {
      _networks[index] = network;
      this.networkStore.chains = _networks;
    } else {
      this.networkStore.chains = [..._networks, network];
    }
  };

  getAllTokens = () => this.networkStore.tokens;

  getTokensByChainId = (chainId: number) =>
    this.networkStore.tokens.filter((x) => x.chainId == chainId);

  importTokens = (tokens: TokenSaved[]) => {
    const existed = this.networkStore.tokens.filter((x) => {
      if (
        tokens.some(
          (addedToken) =>
            +addedToken.chainId === +x.chainId &&
            addedToken.address.toLowerCase() === x.address.toLowerCase()
        )
      ) {
        return false;
      }
      return true;
    });
    this.networkStore.tokens = [...existed, ...tokens];
  };

  removeToken = (token: TokenSaved) => {
    const filteredToken = this.networkStore.tokens.filter(
      (tk) => tk.chainId !== token.chainId || tk.address !== token.address
    );
    this.networkStore.tokens = filteredToken;
  };
}

export default new PermissionService();
