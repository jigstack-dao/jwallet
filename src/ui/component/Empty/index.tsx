import clsx from 'clsx';
import React, { ReactNode } from 'react';
import './style.less';

interface EmptyProps {
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
  title?: ReactNode;
  desc?: ReactNode;
}

const Empty = ({ className, style, children, title, desc }: EmptyProps) => {
  return (
    <div className={clsx('jigstack-empty', className)} style={style}>
      <img className="jigstack-empty-image" src="./images/nodata-tx.png" />
      <div className="jigstack-empty-content">
        {title && <div className="jigstack-empty-title">{title}</div>}
        <div className="jigstack-empty-desc">{children || desc}</div>
      </div>
    </div>
  );
};

export default Empty;
