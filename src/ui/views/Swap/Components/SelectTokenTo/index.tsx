import React, { useMemo, useState } from 'react';
import './style.less';
import { ReactComponent as ArrowDown } from '@/ui/assets/jwallet/arrow-down.svg';
import { Token, TokenAmount } from '@lifi/sdk';
import SearchField from '@/ui/component/SearchField';
import useVisible from '@/hooks/forms/useVisible';
import { ConvertURL } from '@/utils/misc';
import { shortedAmount } from '@/utils/format';

interface IProps {
  tokens: TokenAmount[];
  selected: Token;
  onChange: (tk: Token) => void;
}

const SelectTokenTo: React.FC<IProps> = ({ tokens, selected, onChange }) => {
  const { isVisible, ref, setIsVisible } = useVisible(false);
  const [searchText, setSearchText] = useState('');

  const tokensSearched = useMemo(() => {
    if (searchText == '') return tokens;
    return tokens.filter(
      (x) =>
        x.name.toLowerCase().includes(searchText) ||
        x.symbol.toLowerCase().includes(searchText)
    );
  }, [searchText, tokens]);

  const onToggleOption = () => {
    setIsVisible((old) => {
      const newVisible = !old;

      if (!newVisible || !ref.current) {
        return newVisible;
      }
      if (typeof document == 'undefined') {
        return newVisible;
      }
      const extension = document.getElementById('extension');
      if (!extension) {
        return newVisible;
      }
      const offset =
        ref.current.getBoundingClientRect().top + window.scrollY - 80;

      setTimeout(() => {
        extension.scrollTo({
          top: offset,
          behavior: 'smooth',
        });
      }, 350);
      return newVisible;
    });
  };

  return (
    <div className="select-token" ref={ref}>
      <div className="select-token__selected" onClick={onToggleOption}>
        <div className="select-token__selected-label">
          <img src={ConvertURL(selected.logoURI || '')} alt="" />
          <span>{selected.name}</span>
        </div>
        <div>
          <ArrowDown />
        </div>
      </div>
      {isVisible && (
        <div className="select-token__menu">
          <div className="px-5">
            <SearchField
              value={searchText}
              placeholder="Search Token"
              onChange={(value) => setSearchText(value)}
            />
          </div>
          {tokensSearched.map((x) => (
            <div
              key={x.address}
              className="select-token__menu__item justify-between"
              onClick={() => {
                onChange(x);
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

export default SelectTokenTo;
