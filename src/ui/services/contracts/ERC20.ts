import {
  Contract,
  Overrides,
  BigNumber,
  BytesLike,
  Signer,
  BigNumberish,
} from 'ethers';

import ERC20ABI from '@/constant/abis/ERC20.json';
import { Provider } from '@ethersproject/abstract-provider';
import { ERC20 as ERC20Contract } from '@/constant/types';

class ERC20Service {
  contract: ERC20Contract;

  constructor(address: string, signerOrProvider?: Signer | Provider) {
    this.contract = new Contract(
      address,
      ERC20ABI,
      signerOrProvider
    ) as ERC20Contract;
  }

  public getContract() {
    return this.contract;
  }

  public async approve(
    spender: string,
    amount: BigNumber,
    overrides?: Overrides
  ) {
    return await this.contract.approve(spender, amount, overrides);
  }

  public async getMetadata() {
    const promises = [
      this.contract.name(),
      this.contract.symbol(),
      this.contract.decimals(),
    ];
    const [name, symbol, decimals] = (await Promise.all(promises)) as [
      string,
      string,
      number
    ];
    return { name, symbol, decimals };
  }

  public async getAllowance(owner: string, spender: string) {
    return await this.contract.allowance(owner, spender);
  }

  public async getBalanceOf(owner: string) {
    return await this.contract.balanceOf(owner);
  }

  public encodeAllowance(owner: string, spender: string) {
    return this.contract.interface.encodeFunctionData('allowance', [
      owner,
      spender,
    ]);
  }

  public encodeApprove(spender: string, amount: BigNumberish) {
    return this.contract.interface.encodeFunctionData('approve', [
      spender,
      amount,
    ]);
  }

  public encodeTransfer(to: string, amount: BigNumberish) {
    return this.contract.interface.encodeFunctionData('transfer', [to, amount]);
  }

  public decodeAllowance(data: BytesLike) {
    return this.contract.interface.decodeFunctionData('allowance', data);
  }
}

export default ERC20Service;
