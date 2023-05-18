import useCurrentAccount from '@/hooks/wallet/useCurrentAccount';
import React, { FC } from 'react';
import { useCopyToClipboard } from 'react-use';
import { message } from 'antd';
import { MoreButton } from '../MoreButton';
import './style.less';

const DashboardHead: FC = () => {
  const [, copyToClipboard] = useCopyToClipboard();
  const currentAccount = useCurrentAccount();
  return (
    <>
      <div className="mb-3 flex items-center h-16 relative">
        <div className="absolute top-0 left-0 right-0 h-16 w-fit m-auto">
          <div
            className="inline-block hover-area cursor-pointer"
            onClick={() => {
              copyToClipboard(currentAccount.address);
              message.success({
                content: 'Address copied',
                duration: 1,
                className: 'refresh-toast rectangle-toast',
              });
            }}
          >
            <p>{currentAccount.alianName}</p>
            <p>{currentAccount.shortAddress}</p>
          </div>
        </div>
        <div className="ml-auto">
          <MoreButton />
        </div>
      </div>
    </>
  );
};

export default DashboardHead;
