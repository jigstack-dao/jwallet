import { Dropdown, Menu } from 'antd';
import React from 'react';
import IconArrowDown from 'ui/assets/arrow-down-white.svg';
import IconChecked from 'ui/assets/checked-1.svg';

const options = [
  {
    label: 'Collections',
    value: 'collection',
  },
  {
    label: 'All NFTs',
    value: 'nft',
  },
];

interface NFTDropdownProps {
  value: 'collection' | 'nft';
  onChange: (val: NFTDropdownProps['value']) => void;
}

const NFTDropdown = ({ value, onChange }: NFTDropdownProps) => {
  const current =
    options.find((option) => option.value === value) || options[0];

  const menu = (
    <Menu
      className="jigstack-dropdown-menu"
      onClick={(e) => onChange(e.key as NFTDropdownProps['value'])}
    >
      {options.map((option) => (
        <Menu.Item key={option.value} className="jigstack-dropdown-menu-item">
          <div className="jigstack-dropdown-menu-item-icon">
            {value === option.value && <img src={IconChecked} alt="" />}
          </div>
          <div className="jigstack-dropdown-menu-item-label">
            {option.label}
          </div>
        </Menu.Item>
      ))}
    </Menu>
  );
  return (
    <Dropdown
      className="jigstack-dropdown"
      overlay={menu}
      placement="bottomRight"
      trigger={['click']}
    >
      <div className="jigstack-dropdown-current pointer">
        {current?.label} <img src={IconArrowDown} className="ml-2" />
      </div>
    </Dropdown>
  );
};

export default NFTDropdown;
