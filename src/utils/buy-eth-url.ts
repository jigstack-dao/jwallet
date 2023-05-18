import { BUY_ETH_KEYS } from '@/constant/menuWithIcon';

export const getBuyURL = async (service: BUY_ETH_KEYS, address: string) => {
  switch (service) {
    case BUY_ETH_KEYS.Wyre: {
      return createWyrePurchaseUrl(address);
    }

    case BUY_ETH_KEYS.TestFaucet: {
      return 'https://faucet.metamask.io/';
    }

    default:
      return undefined;
  }
};

const createWyrePurchaseUrl = async (address: string) => {
  const configStr = new URLSearchParams({
    dest: `ethereum:${address}`,
    destCurrency: 'ETH',
    accountId: process.env.REACT_APP_ACCOUNT_ID_WYRE || '',
    paymentMethod: 'debit-card',
  }).toString();
  return `${process.env.REACT_APP_URL_WYRE_PURCHASE}?${configStr}`;
};
