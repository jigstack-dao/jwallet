import React from 'react';
import { Skeleton } from 'antd';
import { Trans } from 'react-i18next';
import BalanceChange from './LoadingBalanceChange';

interface SignProps {
  chainName: string;
}

const Loading = ({ chainName }: SignProps) => {
  return (
    <div className="sign">
      <p className="section-title">
        <Trans
          i18nKey="signTransactionWithChain"
          values={{ name: chainName }}
        />
      </p>
      <div className="gray-section-block common-detail-block">
        <div className="block-field">
          <Skeleton.Input active style={{ width: 200 }} />
        </div>
        <div className="block-field">
          <Skeleton.Input active style={{ width: 200 }} />
        </div>
        <div className="block-field contract">
          <Skeleton.Input active style={{ width: 120 }} />
        </div>
      </div>
      <BalanceChange />
    </div>
  );
};

export default Loading;
