import { ExplainTxResponse } from 'background/service/openapi';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import IconArrowRight from 'ui/assets/arrow-right-gray.svg';
import IconDeployContract from 'ui/assets/deploy-contract.svg';
import BalanceChange from './BalanceChange';
import SpeedUpCorner from './SpeedUpCorner';
import ViewRawModal from './ViewRawModal';

const ContractInteraction = ({
  chainName,
  data,
  isSpeedUp,
  raw,
}: {
  chainName: string;
  data: ExplainTxResponse;
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
        <p className="title-deploy">{t('Contract interaction')}</p>
        <p className="text-gray-content description">
          {t('You are interacting with a smart contract')}
        </p>
        <img src={IconDeployContract} className="icon icon-cancel-tx" />
      </div>
      <BalanceChange
        data={data.balance_change}
        chainName={chainName}
        isSupport={data.support_balance_change}
      />
    </div>
  );
};

export default ContractInteraction;
