import React from 'react';
import { TAB_SANTA_KEYS } from '@/constant';
import clsx from 'clsx';
import './style.less';

const Tab: React.FC<{
  active: TAB_SANTA_KEYS;
  tabs: TAB_SANTA_KEYS[];
  onChange: (t: TAB_SANTA_KEYS) => void;
}> = ({ active, tabs, onChange }) => {
  return (
    <div className="tab-container">
      {tabs.map((x, i) => (
        <div
          key={i}
          onClick={() => onChange(x)}
          className={clsx('item', active == x && 'active')}
        >
          {x}
        </div>
      ))}
    </div>
  );
};

export default Tab;
