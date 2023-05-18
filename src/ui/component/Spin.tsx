import React, { ReactNode } from 'react';
import { Spin, SpinProps as AntdSpinProps } from 'antd';
import PrimaryLayout from './Layouts/PrimaryBackground';
import { LoadingOutlined } from '@ant-design/icons';

interface SpinProps {
  children?: ReactNode;
  spinning?: boolean;
  className?: string;
  iconClassName?: string;
  size?: AntdSpinProps['size'];
}

const icon = (
  <LoadingOutlined
    style={{ fontSize: 48, color: 'white', opacity: '.5' }}
    spin
  />
);

const StyledSpin = ({
  children,
  spinning = true,
  className,
  size = 'default',
  iconClassName,
}: SpinProps) => {
  className;
  size;
  iconClassName;
  return (
    <PrimaryLayout showHeader={false}>
      {spinning ? (
        <div className="flex w-full h-full justify-center items-center">
          <Spin indicator={icon} />
        </div>
      ) : (
        children
      )}
    </PrimaryLayout>
  );
};

export default StyledSpin;
