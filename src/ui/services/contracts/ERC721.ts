import { Contract, Overrides, BigNumber, Signer } from 'ethers';

import ERC721ABI from '@/constant/abis/ERC721.json';
import { Provider } from '@ethersproject/abstract-provider';
import { ERC721 as ERC721Contract } from '@/constant/types';

class ERC721Service {
  contract: ERC721Contract;

  constructor(address: string, signerOrProvider?: Signer | Provider) {
    this.contract = new Contract(
      address,
      ERC721ABI,
      signerOrProvider
    ) as ERC721Contract;
  }

  public getContract() {
    return this.contract;
  }

  public async getBalanceOf(owner: string) {
    return await this.contract.balanceOf(owner);
  }

  public async is721() {
    return await this.contract.supportsInterface('0x80ac58cd');
  }

  public async getMetadata() {
    const promises = [this.contract.name(), this.contract.symbol()];
    const [name, symbol] = await Promise.all(promises);
    return { name, symbol };
  }

  public async approve(
    spender: string,
    amount: BigNumber,
    overrides?: Overrides
  ) {
    return await this.contract.approve(spender, amount, overrides);
  }
}

export default ERC721Service;
