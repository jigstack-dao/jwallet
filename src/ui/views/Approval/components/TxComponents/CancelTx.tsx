import { ExplainTxResponse, Tx } from 'background/service/openapi';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import IconArrowRight from 'ui/assets/arrow-right-gray.svg';
import IconCancelTx from 'ui/assets/cancel-tx.svg';
import BalanceChange from './BalanceChange';
import SpeedUpCorner from './SpeedUpCorner';
import ViewRawModal from './ViewRawModal';

const CancelTx = ({
  chainName,
  data,
  tx,
  isSpeedUp,
  raw,
}: {
  chainName: string;
  data: ExplainTxResponse;
  tx: Tx;
  isSpeedUp: boolean;
  raw: Record<string, string | number>;
}) => {
  const { t } = useTranslation();

  const handleViewRawClick = () => {
    ViewRawModal.open({
      raw,
      abi: data?.abiStr,
    });
  };

  return (
    <div className="cancel-tx">
      <p className="section-title">
        <Trans
          i18nKey="signTransactionWithChain"
          values={{ name: chainName }}
        />
        <span
          className="float-right text-12 cursor-pointer flex items-center view-raw"
          onClick={handleViewRawClick}
        >
          {t('View Raw')}
          <img src={IconArrowRight} />
        </span>
      </p>
      <div className="gray-section-block common-detail-block">
        {isSpeedUp && <SpeedUpCorner />}
        <p className="title">{t('Cancel Pending Transaction')}</p>
        <div className="flex justify-between">
          <p className="text-gray-content text-14 mb-0 description">
            Nonce: {+tx.nonce}
          </p>
          <img
            src={IconCancelTx}
            className="icon icon-cancel-tx relative top-0 right-0"
          />
        </div>
      </div>
      <BalanceChange
        data={data.balance_change}
        chainName={chainName}
        isSupport={data.support_balance_change}
      />
    </div>
  );
};

export default CancelTx;
