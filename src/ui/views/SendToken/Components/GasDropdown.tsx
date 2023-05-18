import React from 'react';
import { ReactComponent as InfoIcon } from '@/ui/assets/jwallet/info.svg';
import { ReactComponent as ChevronUp } from '@/ui/assets/jwallet/chevron-up.svg';
import { ReactComponent as ChevronDown } from '@/ui/assets/jwallet/chevron-down.svg';
import TooltipJwallet from '@/ui/component/Tooltip';

interface IProps {
  title: string;
  value: string;
  tooltip: string;
  disabled: boolean;
  increase: () => void;
  decrease: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
const GasDropdown: React.FC<IProps> = ({
  title,
  value,
  tooltip,
  disabled,
  increase,
  decrease,
  onChange,
}) => {
  return (
    <div className="gas-dropdown">
      <div className="gas-dropdown-title">
        <span>{title}</span>
        <TooltipJwallet title={<span>{tooltip}</span>}>
          <span>
            <InfoIcon />
          </span>
        </TooltipJwallet>
      </div>
      <div className="gas-dropdown-cotent">
        <input
          type="text"
          value={value}
          onChange={onChange}
          disabled={!disabled}
        />
        {disabled && (
          <div className="buttons">
            <button onClick={increase}>
              <ChevronUp />
            </button>
            <button onClick={decrease}>
              <ChevronDown />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default GasDropdown;
