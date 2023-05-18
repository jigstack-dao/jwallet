import React from 'react';
import './style.less';
import Checkbox from '@/ui/component/CheckboxV2';

const TokenCard: React.FC<{
  img: string;
  name: string;
  symbol: string;
  checked: boolean;
  handleSelectToken: () => void;
}> = ({ img, name, symbol, checked, handleSelectToken }) => {
  return (
    <div className="token-card">
      <div className="token-logo">{img && <img src={img} alt="" />}</div>
      <div className="token-name">
        {name} ({symbol})
      </div>
      <div className="token-checkbox">
        <Checkbox checked={checked} onChange={handleSelectToken} />
      </div>
    </div>
  );
};

export default TokenCard;
