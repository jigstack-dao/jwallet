import { CHAINS } from '..';
import { CHAINS_ENUM } from '../chains';
import NetworkInfo from './networkInfo.json';
import ChainSlugs from './chainIds.json';

type NetworkMap = {
  [key in keyof typeof NetworkInfo]: typeof NetworkInfo[key];
};

const networkMap = NetworkInfo.reduce(
  (prev, curr) => ({
    ...prev,
    [curr.chainId]: curr,
  }),
  {}
) as any as NetworkMap;

export const getNetworkInfo = (chainId: number) => {
  const network = networkMap[chainId];

  if (network) {
    return network;
  }
  return undefined;
};

/**
 *
 * @param {string} chainIcon  chain icon from chainlist.org
 * @returns {string} the url of icon
 */
export const getChainIcon = (chainId: number) => {
  const slug = ChainSlugs[chainId];
  if (!slug) {
    return CHAINS[CHAINS_ENUM.ETH].logo;
  }
  return `https://icons.llamao.fi/icons/chains/rsz_${slug}.jpg`;
};
