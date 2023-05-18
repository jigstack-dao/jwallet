import useVisible from '@/hooks/forms/useVisible';
import { ReactComponent as ArrowDown } from '@/ui/assets/jwallet/arrow-down.svg';
import SearchField from '@/ui/component/SearchField';
import { shortedAmount } from '@/utils/format';
import { ConvertURL } from '@/utils/misc';
import { Token, TokenAmount } from '@lifi/sdk';
import React, { useMemo, useState } from 'react';
import './style.less';

const SelectTokenFrom: React.FC<{
  token: Token;
  amount: string;
  readonly: boolean;
  tokens: TokenAmount[];
  onChangeAmount: (value: string) => void;
  onChangeToken: (tk: Token) => void;
}> = ({ token, amount, onChangeAmount, readonly, tokens, onChangeToken }) => {
  const { isVisible, setIsVisible, ref } = useVisible(false);
  const [searchText, setSearchText] = useState('');

  const tokensSearched = useMemo(() => {
    if (searchText == '') return tokens;
    return tokens.filter(
      (x) =>
        x.name.toLowerCase().includes(searchText) ||
        x.symbol.toLowerCase().includes(searchText)
    );
  }, [searchText, tokens]);

  return (
    <div className="swap-dropdown" ref={ref}>
      <div className="content">
        <div
          className="token-selected"
          onClick={() => setIsVisible(!isVisible)}
        >
          <div className="logo">
            <img src={ConvertURL(token.logoURI || '')} alt="" />
          </div>
          <div className="symbol">{token.symbol}</div>
          <div className="arrow-down-icon">
            <ArrowDown />
          </div>
        </div>
        <div className="amount">
          <input
            type="text"
            placeholder="0.00"
            value={amount}
            readOnly={readonly}
            onChange={(e) => onChangeAmount(e.target.value)}
          />
        </div>
      </div>
      {isVisible && (
        <div className="swap-dropdown__menu">
          <SearchField
            value={searchText}
            placeholder="Search Token"
            onChange={(value) => setSearchText(value)}
          />
          {tokensSearched.map((x) => (
            <div
              key={x.address}
              className="swap-dropdown__menu-item justify-between"
              onClick={() => {
                onChangeToken(x);
                setIsVisible(false);
              }}
            >
              <div className="flex items-center">
                <img src={ConvertURL(x.logoURI || '')} alt="" />
                <span>{x.name}</span>
              </div>
              <div className="">
                {shortedAmount(+x.amount ? x.amount : '', 6)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectTokenFrom;
