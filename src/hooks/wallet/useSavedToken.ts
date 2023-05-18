import { TokenSaved } from '@/background/service/permission';
import { useWallet } from '@/ui/utils';
import { useEffect, useState } from 'react';
import useNetwork from './useNetwork';

const useSavedTokens = () => {
  const [savedTokens, setSavedTokens] = useState<TokenSaved[]>([]);
  const wallet = useWallet();
  const { currentNetwork } = useNetwork();

  useEffect(() => {
    (async () => {
      const tokens = await wallet.getTokensByChainId(currentNetwork.chainId);
      setSavedTokens(tokens);
    })();
  }, [wallet, currentNetwork.chainId]);

  return savedTokens;
};

export default useSavedTokens;
