import { getAddress } from 'ethers/lib/utils';

export const ellipsis = (text: string) => {
  return text.replace(/^(.{6})(.*)(.{4})$/, '$1...$3');
};

export const generateAlianName = (counter: number) => {
  return `Account ${counter}`;
};

export const toCheckSumAddress = (address: string) => {
  const lowercased = address.toLowerCase();
  return getAddress(lowercased);
};
