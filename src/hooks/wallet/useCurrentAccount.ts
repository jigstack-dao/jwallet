import { useAppContext } from '@/context';
import { ActionTypes } from '@/context/actions';
import { useWallet } from '@/ui/utils';
import { shortenAddress } from '@/utils/format';
import { isEqual } from 'lodash';
import { useEffect, useMemo } from 'react';

const useCurrentAccount = () => {
  const wallet = useWallet();
  const { appState, dispatch } = useAppContext();
  const currentAccount = useMemo(
    () => appState.currentAccount,
    [appState.currentAccount]
  );

  useEffect(() => {
    let isMounted = true;
    void (async () => {
      const _currentAccount = await wallet.syncGetCurrentAccount();
      const alianName = await wallet.getAlianName(_currentAccount.address);
      const originalAddress = await wallet.getOriginalAddress(
        _currentAccount.address,
        _currentAccount?.type
      );
      const newAccount = {
        address: _currentAccount.address,
        alianName: alianName || '',
        shortAddress: shortenAddress(_currentAccount.address),
        type: _currentAccount.type,
        brandName: _currentAccount.brandName,
        originalAddress,
      };
      if (!isEqual(appState.currentAccount, newAccount) && isMounted) {
        dispatch({
          type: ActionTypes.UpdateAccount,
          payload: newAccount,
        });
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [appState.refreshUseHooks.Wallet_CurrentAccount]);

  return currentAccount;
};

export default useCurrentAccount;
