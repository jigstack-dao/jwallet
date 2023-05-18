import LIFI from '@lifi/sdk';
import { TokenSaved } from '@/background/service/permission';
import { useQuery } from '@tanstack/react-query';
import { AddressZero } from '@/constant';
import { ConvertURL } from '@/utils/misc';

const fetchToken = async (chainId: number) => {
  const lifi = new LIFI();
  try {
    const rawTokens = await lifi.getTokens({
      chains: [chainId],
    });
    const tokens = rawTokens.tokens[chainId].reduce((prev: any, x) => {
      // to push jigstack token on top of token list
      if (x.name.toLowerCase().includes('jigstack')) {
        return [
          {
            id: `add_${x.address}-chain_${x.chainId}`,
            address: x.address,
            name: x.name,
            symbol: x.symbol,
            decimal: x.decimals,
            img: ConvertURL(x.logoURI || ''),
            standard: 'ERC20',
            chainId: x.chainId,
            createdAt: Date.now(),
          },
          ...prev,
        ];
      }
      if (x.address != AddressZero) {
        return [
          ...prev,
          {
            id: `add_${x.address}-chain_${x.chainId}`,
            address: x.address,
            name: x.name,
            symbol: x.symbol,
            decimal: x.decimals,
            img: x.logoURI,
            standard: 'ERC20',
            chainId: x.chainId,
            createdAt: Date.now(),
          },
        ];
      }
      return prev;
    }, []) as any as TokenSaved[];

    return tokens;
  } catch (err) {
    return [];
  }
};

export const useLifiTokens = (chainId?: number) => {
  return useQuery({
    queryKey: [`getLifiTokens-chainId-{${chainId}}`],
    queryFn: () => fetchToken(chainId || 0),
  });
};
