import { TokenSaved } from '@/background/service/permission';
import AvatarIcon from '@/ui/assets/jwallet/avatar.svg';
import useVisible from '@/hooks/forms/useVisible';
import React, { FC, ReactNode, useMemo, useState } from 'react';
import './style.less';
import { renderShortAmount } from '@/utils/render-values';
import { ReactComponent as DropdownIcon } from '@/ui/assets/jwallet/dropdown.svg';
import { BigNumber } from 'ethers';
import SearchField from '@/ui/component/SearchField';

interface PropsType {
  tokenList: TokenSaved[];
  defaultToken: TokenSaved;
  defaultRender?: ReactNode;
  balance: BigNumber;
  onChange: (token: TokenSaved) => void;
}

export const TokenItem: FC<
  TokenSaved & { onSelect: (token: TokenSaved) => void }
> = (props) => {
  const { symbol, name, img, onSelect } = props;

  const tokenImg = useMemo(() => img || AvatarIcon, [img]);
  const handleSelect = () => {
    const token: TokenSaved = {
      ...props,
    };
    onSelect(token);
  };

  return (
    <div
      className="asset-info hover:cursor-pointer hover:opacity-60"
      onClick={handleSelect}
    >
      <div className="token flex flex-nowrap">
        <div className="rounded-full overflow-hidden w-8 h-8 mr-2">
          <img src={tokenImg} alt="" className="min-h-full min-w-full" />
        </div>
        <div className="">
          <div className="token-symbol">{symbol}</div>
          <div className="token-name">{name}</div>
        </div>
      </div>
    </div>
  );
};

const TokenDropdown: FC<PropsType> = (props) => {
  const { tokenList, defaultToken, defaultRender, balance, onChange } = props;
  const { ref, isVisible, setIsVisible } = useVisible(false);
  const [searchText, setSearchText] = useState('');

  const filteredTokens = useMemo(() => {
    if (searchText == '') return tokenList;
    return tokenList.filter(
      (token) =>
        token.name.toLowerCase().includes(searchText.toLocaleLowerCase()) ||
        token.symbol.toLowerCase().includes(searchText.toLocaleLowerCase()) ||
        token.address.toLowerCase().includes(searchText.toLocaleLowerCase())
    );
  }, [searchText, tokenList]);

  return (
    <div id="send-step-container" className="relative mb-4" ref={ref}>
      {defaultRender && (
        <div
          className="hover:cursor-pointer"
          onClick={() => setIsVisible((old) => !old)}
        >
          {defaultRender}
        </div>
      )}
      {!defaultRender && (
        <div
          className="asset-info hover:cursor-pointer"
          onClick={() => setIsVisible((old) => !old)}
        >
          <div className="token">
            <div className="token-symbol">{defaultToken.symbol}</div>
            <div className="token-name">{defaultToken.name}</div>
          </div>
          <div className="balance">
            <div className="balance-info">
              <span className="balance-info-title">Balance: </span>
              <span className="balance-info-token">
                {renderShortAmount(
                  balance,
                  defaultToken.symbol,
                  defaultToken.decimal
                )}
              </span>
            </div>
            <div className="usd">{0}</div>
          </div>
          <div className="icon">
            <DropdownIcon />
          </div>
        </div>
      )}
      {isVisible && (
        <div id="send-token-dropdown" className="absolute w-full p6 rounded-md">
          <div className="mb-4">
            <SearchField
              value={searchText}
              placeholder="Search Token"
              onChange={(value) => setSearchText(value)}
            />
          </div>
          <div className="token-list overflow-auto ">
            {filteredTokens.map((token) => (
              <TokenItem
                {...token}
                key={token.address}
                onSelect={(token) => {
                  setIsVisible(false);
                  onChange(token);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenDropdown;
