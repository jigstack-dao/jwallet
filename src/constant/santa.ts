import { AddressZero } from '.';

export interface TokenSantaResponse {
  address: string;
  createdAt: string;
  decimals: number;
  id: number;
  logoURI: string;
  name: string;
  network: number;
  symbol: string;
  updatedAt: string;
}

interface INetworkSantaGift {
  chainId: number;
  color: string;
  apiId: string;
  escrowAddress: string;
  multiSendContract: string;
  infos: {
    chainId: string;
    chainName: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    rpcUrls: string[];
    blockExplorerUrls: string[];
  };
}

const networkSantaGift: INetworkSantaGift[] = [
  {
    chainId: 1,
    color: 'green',
    apiId: 'ethereum',
    escrowAddress: '0x34988600941bFd61ee26ae624DCa7aFD51ad961f',
    multiSendContract: '0xA5025FABA6E70B84F74e9b1113e5F7F4E7f4859f',
    infos: {
      chainId: '0x1',
      chainName: 'Mainnet',
      nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: [''],
      blockExplorerUrls: ['https://etherscan.io'],
    },
  },
  {
    chainId: 137,
    color: 'purple',
    apiId: 'matic-network',
    escrowAddress: '0xB1cEbb696778fcAd9B96689337ED4932046A05bB',
    multiSendContract: '0x9c8a06F0197ee718cd820adEb48A88Ea2A9B5c48',
    infos: {
      chainId: '0x89',
      chainName: 'Polygon',
      nativeCurrency: {
        name: 'Matic',
        symbol: 'MATIC',
        decimals: 18,
      },
      rpcUrls: ['https://polygon-rpc.com'],
      blockExplorerUrls: ['https://polygonscan.com'],
    },
  },
  {
    chainId: 5,
    apiId: 'ethereum',
    color: 'orange',
    escrowAddress: '0x4A8099CDcbb7D64286A0EE430563dE390274a261',
    multiSendContract: '0xA5025FABA6E70B84F74e9b1113e5F7F4E7f4859f',
    infos: {
      chainId: '0x4',
      chainName: 'Goerli',
      nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: [''],
      blockExplorerUrls: ['https://goerli.etherscan.io/'],
    },
  },
  // {
  //   chainId: 80001,
  //   apiId: 'matic-network',
  //   color: 'pink',
  //   escrowAddress: '',
  //   multiSendContract: '',
  //   infos: {
  //     chainId: '0x13881',
  //     chainName: 'Mumbai',
  //     nativeCurrency: {
  //       name: 'Matic',
  //       symbol: 'MATIC',
  //       decimals: 18,
  //     },
  //     rpcUrls: ['https://matic-mumbai.chainstacklabs.com'],
  //     blockExplorerUrls: ['https://mumbai.polygonscan.com'],
  //   },
  // },
];

// const supportedNetwork = networkSantaGift.map((network) => network.chainId);
const devNetwork = [5];

export const getEscrowAddress = (chainId: number) => {
  const address =
    networkSantaGift.find((x) => x.chainId == chainId)?.escrowAddress ||
    AddressZero;

  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    return address;
  } else {
    return devNetwork.includes(chainId) ? AddressZero : address;
  }
};

export enum SendGiftFormStep {
  Initial,
  FilledForm,
}

export interface TransactionItem {
  imageURL: string | undefined;
  status: string;
  to: string | undefined;
  scanLink: string;
  createdDate: string;
  amount: string;
  imageToken: string | undefined;
  title: string;
  comment: string;
  nameToken: string;
  symbolToken: string;
}

export enum TxStateSanta {
  Waiting = 1,
  Progress = 2,
  Pending = 3,
  Claimed = 4,
}

export const getTransactionStateSanta = (state: number) => {
  if (state == TxStateSanta.Claimed) return 'Claimed';
  return 'Pending';
};
