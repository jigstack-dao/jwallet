import { BigNumber, ethers } from 'ethers';
import currencySymbol from '@/constant/currency-symbol';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { isAddress } from 'web3-utils';

export const stringToBigNumber = (value: string, decimals: number) =>
  parseUnits(value, decimals);

export const bnToNumber = (value: BigNumber, decimals: number) =>
  Number(formatUnits(value, decimals));

export const shortenAddress = (address: string, start = 4, end = 4): string => {
  if (!isAddress(address)) {
    return '';
  } else {
    const len = address.length;
    const prefix = address.substring(0, start + 1);
    const postfix = address.substring(len - end, len);
    return prefix + '...' + postfix;
  }
};

export const replaceErrorMsg = (msg: string) => {
  switch (msg) {
    case 'Key derivation failed - possibly wrong passphrase':
      return 'The Password you entered is invalid. Try again';
    case 'Not a V3 wallet':
      return 'The file invalid. Choose the right Json file';
    case 'The file type is incorrect. Choose a Json file':
      return 'The file invalid. Choose the right Json file';
    // eslint-disable-next-line quotes
    case "The account you're are trying to import is duplicate":
      return 'This Account was successfully imported before';
    default:
      return msg;
  }
};

export const shortedAmount = (value: string, n = 6) => {
  const dotIndex = value.lastIndexOf('.');
  if (!dotIndex) return value;
  return (
    value.substring(0, dotIndex + 1) +
    value.substring(dotIndex + 1, dotIndex + 1 + n)
  );
};

export const renderBalanceToken = (
  value: BigNumber,
  decimals: number,
  symbol: string,
  fixed = 8
) => {
  try {
    const balanceStr = ethers.utils
      .formatUnits(value, decimals)
      .substring(0, fixed);
    return `${balanceStr} ${symbol}`;
  } catch {
    return '';
  }
};

export const prefixAmountTransaction = (to: string, from: string) =>
  to?.toLowerCase() !== from?.toLowerCase() ? '-' : '';

export const getCurrencySymbol = (code: string) => {
  try {
    const currency = currencySymbol.find(
      (x) =>
        x.code.toLowerCase() == code.toLowerCase() &&
        typeof x.symbol == 'string'
    );
    if (!currency) return '$';
    return currency.symbol;
  } catch {
    return '$';
  }
};
