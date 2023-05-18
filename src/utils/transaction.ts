import { isHexString } from 'ethereumjs-util';
import { CHAINS, GASPRICE_RANGE } from 'consts';
import { Tx } from 'background/service/openapi';
import {
  ERC1155__factory,
  ERC20__factory,
  ERC721__factory,
} from '@/constant/types';
import { AssetType } from './asset';

export const validateGasPriceRange = (tx: Tx) => {
  const chain = Object.values(CHAINS).find((chain) => chain.id === tx.chainId);
  if (!chain) return true;
  const range = GASPRICE_RANGE[chain.enum];
  if (!range) return true;
  const [min, max] = range;
  if (Number((tx as Tx).gasPrice || tx.maxFeePerGas) / 1e9 < min)
    throw new Error('GasPrice too low');
  if (Number((tx as Tx).gasPrice || tx.maxFeePerGas) / 1e9 > max)
    throw new Error('GasPrice too high');
  return true;
};

export const convert1559ToLegacy = (tx) => {
  return {
    chainId: tx.chainId,
    from: tx.from,
    to: tx.to,
    value: tx.value,
    data: tx.data,
    gas: tx.gas,
    gasPrice: tx.maxFeePerGas,
    nonce: tx.nonce,
  };
};

export const convertLegacyTo1559 = (tx: Tx) => {
  return {
    chainId: tx.chainId,
    from: tx.from,
    to: tx.to,
    value: tx.value,
    data: tx.data,
    gas: tx.gas,
    maxFeePerGas: tx.gasPrice,
    maxPriorityFeePerGas: tx.gasPrice,
    nonce: tx.nonce,
  };
};

export const is1559Tx = (tx: Tx) => {
  if (!('maxFeePerGas' in tx) || !('maxPriorityFeePerGas' in tx)) return false;
  return isHexString(tx.maxFeePerGas!) && isHexString(tx.maxPriorityFeePerGas!);
};

/**
 * Attempts to decode transaction data using ABIs for three different token standards: ERC20, ERC721, ERC1155.
 * The data will decode correctly if the transaction is an interaction with a contract that matches one of these
 * contract standards
 *
 * @param data - encoded transaction data
 * @returns {EthersContractCall | undefined}
 */
export function parseStandardTokenTransactionData(data, type: AssetType) {
  try {
    switch (type) {
      case AssetType.ERC20: {
        return ERC20__factory.createInterface().parseTransaction({ data });
      }
      case AssetType.ERC721: {
        return ERC721__factory.createInterface().parseTransaction({ data });
      }
      case AssetType.ERC1155: {
        return ERC1155__factory.createInterface().parseTransaction({ data });
      }
    }
  } catch {
    // ignore and next try to parse with erc721 ABI
  }

  return undefined;
}
