import { Provider } from '@ethersproject/abstract-provider';
import { BigNumber, BytesLike, Signer } from 'ethers';
import { ERC20ABI } from '@/constant/abi';
import useContract from './useContract';
import type { ERC20Contract } from '@lifi/sdk';
import { useCallback } from 'react';

const useErc20 = (address: string, signerOrProvider?: Signer | Provider) => {
  const contract = useContract(
    address,
    ERC20ABI,
    signerOrProvider
  ) as any as ERC20Contract;

  const approve = useCallback(
    async (spender: string, amount: BigNumber) => {
      return await contract.approve(spender, amount);
    },
    [contract]
  );
  const getAllowance = useCallback(
    async (owner: string, spender: string) => {
      return await contract.allowance(owner, spender);
    },
    [contract]
  );

  const encodeAllowance = useCallback(
    (owner: string, spender: string) => {
      return contract.interface.encodeFunctionData('allowance', [
        owner,
        spender,
      ]);
    },
    [contract]
  );
  const decodeAllowance = useCallback(
    (data: BytesLike) => {
      return contract.interface.decodeFunctionData('allowance', data);
    },
    [contract]
  );

  return {
    contract,
    approve,
    getAllowance,
    encodeAllowance,
    decodeAllowance,
  };
};

export default useErc20;
