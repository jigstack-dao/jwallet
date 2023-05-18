import React from 'react';
import './style.less';
import { ReactComponent as NotFoundTokenIcon } from '@/ui/assets/jwallet/not-found-token.svg';
const NotFoundToken = () => {
  return (
    <div id="not-found-token">
      <div className="icon">
        <NotFoundTokenIcon />
      </div>
      <div className="title">
        The token you entered is not in our lists, please add a Custom Token
      </div>
    </div>
  );
};

export default NotFoundToken;
