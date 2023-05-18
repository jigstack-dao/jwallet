import clsx from 'clsx';
import React, { FC, ReactNode, useState, useRef } from 'react';
import './style.less';

interface IProps {
  header: ReactNode;
  content: ReactNode;
  active?: boolean;
  onToggle?: (active: boolean) => any;
  refresh?: boolean;
}

const Accordion: FC<IProps> = (props) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const { header, content, active, onToggle } = props;

  const onClick = () => {
    const newActive = typeof active === 'boolean' ? !active : height === 0;
    onToggle?.(newActive);
    setHeight(newActive ? contentRef.current?.scrollHeight || 1 : 0);
  };

  return (
    <div className="accordion">
      <div className="accordion-header" onClick={() => onClick()}>
        {header}
      </div>
      <div
        className={clsx('accordion-content', active && 'active')}
        ref={contentRef}
      >
        {content}
      </div>
    </div>
  );
};

export default Accordion;
