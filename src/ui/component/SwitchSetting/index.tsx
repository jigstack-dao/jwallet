import React from 'react';
import './style.less';
import { Switch } from 'antd';
import clsx from 'clsx';

const SwitchSetting = ({ checked, onChange }) => {
  return (
    <div className={clsx('switch-setting-container', !checked && 'unchecked')}>
      <Switch checked={checked} onClick={() => onChange()} />
      <div className="status">{checked ? 'On' : 'Off'}</div>
    </div>
  );
};

export default SwitchSetting;
