import React, { ReactNode, SyntheticEvent, useEffect, useState } from 'react';
import cx from 'clsx';
import IconCheck from 'ui/assets/check.svg';
import './style.less';

interface CheckboxProps {
  checked: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  background?: string;
  width?: string;
  height?: string;
  className?: string;
  children?: ReactNode;
}

const unCheckBackground = '#D8DFEB';

const Checkbox = ({
  checked,
  onChange,
  defaultChecked = false,
  background = '#FFA877',
  width = '20px',
  height = '20px',
  className,
  children,
}: CheckboxProps) => {
  const [checkState, setCheckState] = useState(defaultChecked);

  useEffect(() => {
    setCheckState(checked);
  }, [checked]);

  const handleValueChange = (e: SyntheticEvent, checked) => {
    e.stopPropagation();
    onChange?.(checked);
  };

  return (
    <div
      className={cx('jigstack-checkbox__wrapper', className)}
      onClick={(e) => handleValueChange(e, !checkState)}
    >
      <div
        className="jigstack-checkbox"
        style={{
          width,
          height,
          backgroundColor: checkState ? background : unCheckBackground,
        }}
      >
        <img src={IconCheck} className="icon icon-check" />
      </div>
      {children && <div>{children}</div>}
    </div>
  );
};

export default Checkbox;
