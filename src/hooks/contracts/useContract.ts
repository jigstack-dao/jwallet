import { Contract, Signer } from 'ethers';
import { Provider } from '@ethersproject/abstract-provider';
import { useMemo } from 'react';

const useContract = (
  address: string,
  abi: any,
  signerOrProvider?: Signer | Provider | undefined
) => {
  return useMemo(() => {
    return new Contract(address, abi, signerOrProvider);
  }, [abi, address, signerOrProvider]);
};

export default useContract;
