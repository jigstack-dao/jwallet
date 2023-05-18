import { ReactComponent as ArrowDown } from '@/ui/assets/jwallet/arrow-down.svg';
import './style.less';
import React, { useState } from 'react';
import { TokenSantaResponse } from '@/constant/santa';

const TokenDropdown: React.FC<{
  addressSelected: string | undefined;
  tokens: TokenSantaResponse[];
  amount: string;
  disabledChange: boolean;
  onChangeToken: (value: string) => void;
  onChangeAmount: (value: string) => void;
}> = ({
  addressSelected,
  amount,
  onChangeToken,
  onChangeAmount,
  tokens,
  disabledChange,
}) => {
  const [open, setOpen] = useState(false);
  const token = tokens.find((x) => x.address == addressSelected);
  return (
    <div className="swap-dropdown">
      <div className="content">
        <div className="token-selected" onClick={() => setOpen(!open)}>
          <div className="logo">
            {token && <img src={token.logoURI} alt="" />}
          </div>
          {token && <div className="symbol">{token.symbol}</div>}
          {
            <div className="arrow-down-icon">
              {!disabledChange && <ArrowDown />}
            </div>
          }
        </div>
        <div className="amount">
          <input
            type="text"
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              onChangeAmount(e.target.value);
            }}
          />
        </div>
      </div>
      {open && !disabledChange && (
        <div className="tokens">
          {tokens
            .filter((x) => x.address != addressSelected)
            .map((x) => (
              <div
                key={x.address}
                className="item flex"
                onClick={() => {
                  onChangeToken(x.address);
                  setOpen(false);
                }}
              >
                <div className="w-7 h-7">
                  <img
                    src={x.logoURI}
                    alt=""
                    className="rounded-full w-full h-full"
                  />
                </div>
                <span>{x.symbol}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default TokenDropdown;
