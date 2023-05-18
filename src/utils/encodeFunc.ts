import { BigNumber } from 'ethers';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const abiCoder = require('web3-eth-abi');

export const encodeTransfer = (to: string, value: BigNumber) => {
  return abiCoder.encodeFunctionCall(
    {
      name: 'transfer',
      type: 'function',
      inputs: [
        {
          name: '_to',
          type: 'address',
        },
        {
          name: '_value',
          type: 'uint256',
        },
      ],
    },
    [to, value.toHexString()]
  );
};
