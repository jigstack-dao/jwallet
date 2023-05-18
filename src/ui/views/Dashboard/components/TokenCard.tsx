import { TokenSaved } from '@/background/service/permission';
import { BIG_NUMBER_ZERO } from '@/constant';
import { ERC20ABI } from '@/constant/abi';
import { renderAmount } from '@/utils/render-values';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { isAddress } from 'web3-utils';

const TokenCard: React.FC<{
  rpcURL: string;
  addressAccount: string;
  data: TokenSaved;
  hideCurrency: boolean;
  onClick?: (token: TokenSaved) => any;
}> = ({ data, addressAccount, rpcURL, hideCurrency, onClick }) => {
  const [balanceOf, setBalanceOf] = useState(BIG_NUMBER_ZERO);
  useEffect(() => {
    void (async () => {
      if (!isAddress(addressAccount) || rpcURL == '') return;
      try {
        const provider = new ethers.providers.JsonRpcProvider(rpcURL);
        const contract = new ethers.Contract(data.address, ERC20ABI, provider);
        const _balanceOf = await contract.balanceOf(addressAccount);
        setBalanceOf(_balanceOf);
      } catch {
        setBalanceOf(BIG_NUMBER_ZERO);
      }
    })();
  }, [rpcURL, addressAccount, data]);

  if (balanceOf.isZero() && hideCurrency) return null;

  return (
    <div
      className="flex justify-between items-center text-16 border-[1px] border-white rounded-xl p-4 mb-2 hover:cursor-pointer"
      onClick={() => onClick?.(data)}
    >
      <div className="w-8 h-8 rounded-full">
        {data.img && <img src={data.img} alt="" />}
      </div>
      <span className="flex-1 ml-[10px]">{data.name}</span>
      <span className="font-GilroyExtraBold mr-[5px]">
        {renderAmount(balanceOf, data.decimal, 6)}
      </span>
      <span>{data.symbol}</span>
    </div>
  );
};

export default TokenCard;
