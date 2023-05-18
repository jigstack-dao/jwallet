import ERC1155Service from '@/ui/services/contracts/ERC1155';
import ERC20Service from '@/ui/services/contracts/ERC20';
import ERC721Service from '@/ui/services/contracts/ERC721';
import { JsonRpcProvider } from '@ethersproject/providers';

export enum AssetType {
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155',
  OTHER = 'OTHER',
}

type Map<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        metadata: M[Key];
      };
};

export interface ERC20_Metadata {
  name: string;
  symbol: string;
  decimals: number;
}
export interface ERC721_Metadata {
  name: string;
  symbol: string;
}

interface Metadata {
  [AssetType.ERC20]: ERC20_Metadata;
  [AssetType.ERC721]: ERC721_Metadata;
  [AssetType.ERC1155]: any;
  [AssetType.OTHER]: any;
}

export type AssetMetadata = Map<Metadata>[keyof Map<Metadata>];

const getAsset = async (
  address: string,
  provider: JsonRpcProvider
): Promise<AssetMetadata> => {
  const erc20Service = new ERC20Service(address, provider);
  const erc721Service = new ERC721Service(address, provider);
  const erc1155Service = new ERC1155Service(address, provider);

  let type = AssetType.OTHER;
  let metadata: any;
  try {
    const is721 = await erc721Service.is721();
    if (is721) {
      type = AssetType.ERC721;
      metadata = await erc721Service.getMetadata();
      return {
        type,
        metadata,
      };
    }
  } catch (error) {}

  try {
    const is1155 = await erc1155Service.is1155();
    if (is1155) {
      type = AssetType.ERC1155;
      return {
        type,
        metadata,
      };
    }
  } catch (error) {}

  try {
    const is20 = await erc20Service.getBalanceOf(address);
    if (is20) {
      type = AssetType.ERC20;
      metadata = await erc20Service.getMetadata();
      return {
        type,
        metadata: {
          ...metadata,
          decimals: +metadata.decimals,
        },
      };
    }
  } catch (error) {}

  return {
    type,
    metadata,
  };
};

export default getAsset;
