import { BigNumber, ethers } from 'ethers';
import { bnToNumber } from '../format';

export const renderShortAmount = (
  balance: BigNumber,
  symbol: string,
  decimals = 18
) => {
  try {
    const balanceStr = ethers.utils.formatUnits(balance, decimals);
    if (balance.isZero()) return `${balanceStr} ${symbol}`;
    const indexDot = balanceStr.indexOf('.');
    return `${balanceStr.substring(0, indexDot + 5)} ${symbol}`;
  } catch {
    return '';
  }
};

export const renderAmount = (amount: BigNumber, decimals = 18, fixed = 4) => {
  return amount.isZero() ? '0' : bnToNumber(amount, decimals).toFixed(fixed);
};
