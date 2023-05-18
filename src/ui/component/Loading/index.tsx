import clsx from 'clsx';
import React, { ReactNode } from 'react';
import './style.less';
import { SvgIconLoading } from 'ui/assets';

interface CopyProps {
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
  loading?: boolean;
}

const Loading = ({ className, style, children, loading }: CopyProps) => {
  return loading ? (
    <div className={clsx('jigstack-loading', className)} style={style}>
      <SvgIconLoading
        className="jigstack-loading-image"
        fill="#707280"
      ></SvgIconLoading>
      <div className="jigstack-loading-text">{children}</div>
    </div>
  ) : null;
};

export default Loading;
