import { BigNumber, BytesLike, Contract, Signer } from 'ethers';

import OVM_GasPriceOracle_ABI from '@/constant/abis/OVM_GasPriceOracle.json';
import { Provider } from '@ethersproject/abstract-provider';
import { OVMGasPriceOracle } from '@/constant/types';
import { getOptimismOracleAddress } from '@/constant/OptimismOracle';
import { AddressZero } from '@/constant';

class L1EstimatorService {
  contract: OVMGasPriceOracle;

  constructor(chain: number, signerOrProvider?: Signer | Provider) {
    const address = getOptimismOracleAddress(chain);
    this.contract = new Contract(
      address,
      OVM_GasPriceOracle_ABI,
      signerOrProvider
    ) as OVMGasPriceOracle;
  }

  public getContract() {
    return this.contract;
  }

  public async estimateL1Gas(data: BytesLike) {
    if (this.contract.address === AddressZero) {
      return BigNumber.from(0);
    } else {
      try {
        return await this.contract.getL1Fee(data);
      } catch (error) {
        console.log(error);
        return BigNumber.from(400000000000000); // oracle not deploy yet
      }
    }
  }
}

export default L1EstimatorService;
