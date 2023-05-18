import { ExplainTxResponse } from 'background/service/openapi';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import IconArrowRight from 'ui/assets/arrow-right-gray.svg';
import { NameAndAddress } from 'ui/component';
import BalanceChange from './BalanceChange';
import SpeedUpCorner from './SpeedUpCorner';
import ViewRawModal from './ViewRawModal';

interface CancelProps {
  data: ExplainTxResponse;
  chainName: string;
  isSpeedUp: boolean;
  raw: Record<string, string | number>;
}

const Cancel = ({ data, chainName, isSpeedUp, raw }: CancelProps) => {
  const detail = data.type_cancel_token_approval!;
  const { t } = useTranslation();

  const handleViewRawClick = () => {
    ViewRawModal.open({
      raw,
      abi: data?.abiStr,
    });
  };

  return (
    <div className="cancel">
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
        <p className="title">
          <Trans
            i18nKey="cancelApprovalTitle"
            values={{ symbol: detail.token_symbol }}
          />
        </p>
        <div className="protocol mt-2">
          <NameAndAddress
            address={detail.spender}
            className="text-13"
            nameClass="max-117 text-13"
            addressClass="text-13"
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

export default Cancel;
