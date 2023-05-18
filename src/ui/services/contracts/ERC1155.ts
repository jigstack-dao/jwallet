import { Contract, Signer } from 'ethers';

import ERC1155ABI from '@/constant/abis/ERC1155.json';
import { Provider } from '@ethersproject/abstract-provider';
import { ERC1155 as ERC1155Contract } from '@/constant/types';

class ERC1155Service {
  contract: ERC1155Contract;

  constructor(address: string, signerOrProvider?: Signer | Provider) {
    this.contract = new Contract(
      address,
      ERC1155ABI,
      signerOrProvider
    ) as ERC1155Contract;
  }

  public getContract() {
    return this.contract;
  }

  public async is1155() {
    return await this.contract.supportsInterface('0xd9b67a26');
  }
}

export default ERC1155Service;
