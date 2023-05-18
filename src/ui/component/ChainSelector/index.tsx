import React, { ReactNode, useCallback, useState } from 'react';
import { useHover } from 'ui/utils';
import { SvgIconArrowDown } from 'ui/assets';

import './style.less';
import clsx from 'clsx';
import useNetwork from '@/hooks/wallet/useNetwork';
import { getChainLogoById } from '@/constant/chains';

interface ChainSelectorProps {
  value: number;
  onChange: (value: number) => void;
  direction?: 'top' | 'bottom';
  connection?: boolean;
  showModal?: boolean;
  className?: string;
  title?: ReactNode;
}

const ChainSelector = ({
  title,
  value,
  onChange,
  connection = false,
  showModal = false,
  className = '',
}: ChainSelectorProps) => {
  const [showSelectorModal, setShowSelectorModal] = useState(showModal);
  const [selectedChainId, setSelectedChainId] = useState(1);
  const [isHovering, hoverProps] = useHover();
  const { networks } = useNetwork();
  const handleClickSelector = () => {
    setShowSelectorModal(!showSelectorModal);
  };

  const handleChange = (id: number) => {
    // const chainEnum: CHAINS_ENUM = getChainEnumById(id) || CHAINS_ENUM.ETH;
    onChange(id);
    setShowSelectorModal(false);
    setSelectedChainId(id);
  };
  const getCurrentImage = useCallback((id) => {
    return getChainLogoById(id);
  }, []);
  const getCurrentNameChain = useCallback(
    (id) => {
      const nw = networks.find((item) => item.chainId === id);
      return nw?.name || networks?.[0]?.name;
    },
    [networks]
  );
  return (
    <>
      <div
        className={clsx(
          'chain-selector',
          className,
          !className && isHovering && 'hover'
        )}
        onClick={handleClickSelector}
        {...hoverProps}
      >
        <img src={getCurrentImage(selectedChainId)} className="chain-logo" />
        {getCurrentNameChain(selectedChainId)}
        <SvgIconArrowDown className={clsx('icon icon-arrow-down arrowColor')} />
      </div>
      {showSelectorModal && (
        <div className="chain-selector-list">
          {networks.map((x, key) => (
            <div
              key={key}
              className="chain-selector-options"
              onClick={() => handleChange(x.chainId)}
            >
              <img
                src={getCurrentImage(x?.chainId || 1)}
                className="chain-logo"
              />
              {x.name}
            </div>
          ))}
        </div>
      )}
      {/* <Modal
        title={title}
        value={value}
        open={showSelectorModal}
        onChange={handleChange}
        onCancel={handleCancel}
        connection={connection}
      /> */}
    </>
  );
};

export default ChainSelector;
