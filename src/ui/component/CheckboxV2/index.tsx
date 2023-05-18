import React from 'react';
import CheckboxIcon from '@/ui/assets/jwallet/checkbox.svg';
import CheckedIcon from '@/ui/assets/jwallet/checkbox-checked.svg';

interface IProps {
  checked?: boolean;
  children?: React.ReactNode;
  onChange?: (checked: boolean) => void;
}

const Checkbox: React.FC<IProps> = ({
  checked = false,
  children,
  onChange,
}) => {
  const handleChange = () => {
    if (onChange) {
      onChange(!checked);
    }
  };

  return (
    <div className="flex items-center space-x-2" onClick={handleChange}>
      <img src={checked ? CheckedIcon : CheckboxIcon} alt="" />
      {children}
    </div>
  );
};

export default Checkbox;
