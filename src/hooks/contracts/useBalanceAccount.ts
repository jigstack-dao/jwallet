import { useAppContext } from '@/context';
import { BigNumber, ethers } from 'ethers';
import { useEffect, useState } from 'react';
import useNetwork from '../wallet/useNetwork';

const useBalanceAccount = (account: string) => {
  const { currentNetwork } = useNetwork();
  const [state, setState] = useState<BigNumber>(BigNumber.from(0));
  const { appState } = useAppContext();

  useEffect(() => {
    void (async () => {
      try {
        if (account.length == 0 || currentNetwork.rpcURL.length == 0) return;
        const provider = new ethers.providers.JsonRpcProvider(
          currentNetwork.rpcURL
        );
        const balance = await provider.getBalance(account);
        setState((old) => {
          if (!old.eq(balance)) {
            return balance;
          } else {
            return old;
          }
        });
      } catch (error) {
        console.log(error);
      }
    })();
  }, [account, currentNetwork, appState.refreshUseHooks.Account_Balance]);
  return state;
};

export default useBalanceAccount;
