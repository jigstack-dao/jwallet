import { BigNumber } from 'ethers';
import { TokenSaved } from '@/background/service/permission';
import TokenDropdown from './TokenDropdown';
import useSavedTokens from '@/hooks/wallet/useSavedToken';
import { getChainLogoById } from '@/constant/chains';
import useNetwork from '@/hooks/wallet/useNetwork';
import React, { useMemo } from 'react';
import { AddressZero } from '@/constant';

interface IProps {
  balance: BigNumber;
  fiat: string;
  amount: string;
  addressReceiver: string;
  errorAmount: string | undefined;
  errorReceiver: string | undefined;
  token: TokenSaved;
  changeAmount: (value: string) => void;
  changeAddressReceiver: (value: string) => void;
  clickMax: () => void;
  setToken: (token: TokenSaved) => void;
}

const SendStep: React.FC<IProps> = ({
  balance,
  amount,
  addressReceiver,
  errorAmount,
  errorReceiver,
  token,
  changeAmount,
  changeAddressReceiver,
  clickMax,
  setToken,
}) => {
  const { currentNetwork } = useNetwork();
  const nativeTokenLogo = getChainLogoById(currentNetwork.chainId);
  const initialToken: TokenSaved = {
    address: AddressZero,
    img: nativeTokenLogo || '',
    decimal: currentNetwork.decimals,
    chainId: currentNetwork.chainId,
    createdAt: 0,
    id: -1,
    name: currentNetwork.symbol,
    symbol: currentNetwork.symbol,
    standard: 'Native token',
  };
  const savedTokens = useSavedTokens();
  const tokenList = useMemo(
    () => [initialToken, ...savedTokens],
    [savedTokens, initialToken]
  );
  return (
    <div id="send-step-container">
      <TokenDropdown
        defaultToken={token}
        onChange={setToken}
        tokenList={tokenList}
        balance={balance}
      />
      <div className="mb-4">
        <div className="amount">
          <input
            type="text"
            placeholder={`Amount ${token.symbol}`}
            value={amount}
            onChange={(e) => changeAmount(e.target.value)}
          />
          <button onClick={clickMax} disabled={balance.isZero()}>
            MAX
          </button>
        </div>
        <div>
          {errorAmount && (
            <span className="text-14 text-[#FFA877]">{errorAmount}</span>
          )}
        </div>
      </div>
      <textarea
        className="address-receiver"
        placeholder="Address receiver"
        value={addressReceiver}
        rows={2}
        maxLength={60}
        onChange={(e) => changeAddressReceiver(e.target.value)}
        style={{
          padding: addressReceiver.length > 42 ? '8px 20px' : '18px 20px',
        }}
      />
      <div>
        {errorReceiver && (
          <span className="text-14 text-[#FFA877]">{errorReceiver}</span>
        )}
      </div>
    </div>
  );
};

export default SendStep;
