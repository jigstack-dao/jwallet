import React from 'react';
import { Drawer as DrawerAntD } from 'antd';
import './style.less';

interface IProps {
  placement?: 'bottom' | 'top' | 'right' | 'left';
  width?: number;
  height?: number;
  onClose?: () => void;
  open?: boolean;
  children?: React.ReactNode;
}

const Drawer: React.FC<IProps> = ({
  placement = 'bottom',
  width = 400,
  height = 400,
  onClose,
  open = false,
  children,
}) => {
  return (
    <DrawerAntD
      title={null}
      placement={placement}
      width={width}
      height={height}
      onClose={() => {
        if (onClose) onClose();
      }}
      open={open}
      closable={false}
    >
      {children}
    </DrawerAntD>
  );
};

export default Drawer;
