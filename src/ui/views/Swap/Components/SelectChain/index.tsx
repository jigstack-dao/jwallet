import React, { useMemo } from 'react';
import './style.less';
import { ReactComponent as ArrowDown } from '@/ui/assets/jwallet/arrow-down.svg';
import { NetworkChain } from '@/background/service/permission';
import useVisible from '@/hooks/forms/useVisible';

interface IProps {
  chains: NetworkChain[];
  selected: number;
  onChange: (id: number) => void;
}

const SelectChain: React.FC<IProps> = ({ chains, selected, onChange }) => {
  const { isVisible, ref, setIsVisible } = useVisible(false);

  const selectedElement = useMemo(() => {
    const _chain = chains.find((x) => x.chainId == selected);
    if (_chain) {
      return (
        <div className="select-chain__selected-label">
          <span>{_chain.name}</span>
        </div>
      );
    }
    return <span>Selected CHAIN</span>;
  }, [chains, selected]);

  return (
    <div className="select-chain" ref={ref}>
      <div
        className="select-chain__selected"
        onClick={() => setIsVisible(!isVisible)}
      >
        <div>{selectedElement}</div>
        <div>
          <ArrowDown />
        </div>
      </div>
      {isVisible && (
        <div className="select-chain__menu">
          <div className="max-h-72 overflow-auto thin-scrollbar">
            {chains
              .filter((x) => x.chainId !== selected)
              .map((x) => (
                <div
                  key={x.chainId}
                  className="select-chain__menu__item hover-overlay"
                  onClick={() => {
                    onChange(x.chainId);
                    setIsVisible(false);
                  }}
                >
                  <span>{x.name}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectChain;
