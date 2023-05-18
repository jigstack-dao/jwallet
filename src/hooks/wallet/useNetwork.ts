import { ConnectedSite, NetworkChain } from '@/background/service/permission';
import { CHAINS } from '@/constant';
import { useAppContext } from '@/context';
import { ActionTypes, RefreshUseHooks } from '@/context/actions';
import { getCurrentTab, useWallet } from '@/ui/utils';
import { useEffect, useState } from 'react';

const useNetwork = () => {
  const [networks, setNetworks] = useState<NetworkChain[]>([]);
  const [site, setSite] = useState<ConnectedSite>();
  const { appState, dispatch } = useAppContext();
  const wallet = useWallet();
  const changeNetwork = async (chainId: number) => {
    // chain for Dapp
    if (site) {
      const _site = {
        ...site!,
        chainId,
      };
      setSite(_site);
      await wallet.setSite(_site);
    }

    await wallet.setCurrentNetworkTemporary(chainId);
    // reload data all references import hook
    dispatch({
      type: ActionTypes.UpdateRefreshUseHooks,
      payload: [RefreshUseHooks.Wallet_Network],
    });
  };

  useEffect(() => {
    void (async () => {
      const _networks = await wallet.getAllNetworks();
      setNetworks(_networks);
      const tab = await getCurrentTab();
      const current = await wallet.getCurrentSite(tab.id);
      if (current) {
        const chainId = await wallet.getCurrentNetworkTemporary();
        setSite(current);
        dispatch({
          type: ActionTypes.UpdateNetwork,
          payload: await wallet.getNetworkByChainId(
            chainId || CHAINS[current.chain].id
          ),
        });
      } else {
        const chainId = await wallet.getCurrentNetworkTemporary();
        dispatch({
          type: ActionTypes.UpdateNetwork,
          payload: await wallet.getNetworkByChainId(chainId),
        });
      }
    })();
  }, [appState.refreshUseHooks.Wallet_Network]);

  return { currentNetwork: appState.currentNetwork, networks, changeNetwork };
};

export default useNetwork;
