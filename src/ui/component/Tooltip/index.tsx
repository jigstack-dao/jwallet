import { Tooltip } from 'antd';
import React from 'react';
import './style.less';
const TooltipJwallet: React.FC<{
  children: React.ReactNode;
  title: React.ReactNode;
}> = ({ children, title }) => <Tooltip title={title}>{children}</Tooltip>;

export default TooltipJwallet;
