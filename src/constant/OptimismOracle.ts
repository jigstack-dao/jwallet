import { AddressZero } from '.';

const OptimismOracle = {
  10: '0x420000000000000000000000000000000000000F',
  69: '0x420000000000000000000000000000000000000F',
  300: '0x420000000000000000000000000000000000000F',
  420: '0x420000000000000000000000000000000000000F',
};

export const getOptimismOracleAddress = (chain: number) => {
  return OptimismOracle[chain] || AddressZero;
};

export default OptimismOracle;
