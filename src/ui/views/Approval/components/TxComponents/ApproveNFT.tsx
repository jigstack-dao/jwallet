import { ellipsis } from '@/ui/utils/address';
import NFTAvatar from '@/ui/views/Dashboard/components/NFT/NFTAvatar';
import { ExplainTxResponse } from 'background/service/openapi';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import IconArrowRight from 'ui/assets/arrow-right-gray.svg';
import IconUnknownNFT from 'ui/assets/unknown-nft.svg';
import IconUnknownProtocol from 'ui/assets/unknown-protocol.svg';
import { Copy } from 'ui/component';
import BalanceChange from './BalanceChange';
import SpeedUpCorner from './SpeedUpCorner';
import ViewRawModal from './ViewRawModal';

interface ApproveNFTProps {
  data: ExplainTxResponse;
  chainName: string;
  isSpeedUp: boolean;
  raw: Record<string, string | number>;
}

const ApproveNFT = ({ data, chainName, isSpeedUp, raw }: ApproveNFTProps) => {
  const detail = data.type_single_nft_approval!;
  const { t } = useTranslation();

  const handleViewRawClick = () => {
    ViewRawModal.open({
      raw,
      abi: data?.abiStr,
    });
  };

  const handleProtocolLogoLoadFailed = function (
    e: React.SyntheticEvent<HTMLImageElement>
  ) {
    e.currentTarget.src = IconUnknownProtocol;
  };

  return (
    <div className="approve-nft">
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
        <p className="title text-white py-2 justify-center font-bold text-18">
          {t('Single NFT Approval')}
        </p>
        <div className="nft-card">
          <NFTAvatar
            thumbnail={!detail.nft?.detail_url}
            type={detail.nft?.content_type}
            content={detail.nft?.detail_url || ''}
            unknown={IconUnknownNFT}
          ></NFTAvatar>
          <div className="nft-card-content">
            <div className="nft-card-title">
              {detail.nft?.name || t('Unknown')}
            </div>
            <div className="jigstack-list">
              <div className="item">
                <div className="label text-white">Collection</div>
                <div className="value text-white">
                  {detail.nft?.collection?.name || t('Unknown')}
                </div>
              </div>
              <div className="item">
                <div className="label text-white">Contract</div>
                <div className="value flex items-center gap-6 text-white">
                  {ellipsis(detail.nft?.contract_id)}
                  <Copy data={detail.nft?.contract_id} className="w-8"></Copy>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="jigstack-list">
          <div className="item flex-col items-start">
            <div className="label text-white">Approve to</div>
            <div className="value flex items-center gap-8">
              <img
                className="logo"
                src={detail.spender_protocol_logo_url || IconUnknownProtocol}
                onError={handleProtocolLogoLoadFailed}
              />
              <div className="name text-white">
                {detail.spender_protocol_name || t('Unknown')}
              </div>
              <div className="address flex gap-6 items-center text-14 text-white">
                {ellipsis(detail.spender)}
                <Copy data={detail.spender} className="w-8"></Copy>
              </div>
            </div>
          </div>
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

export default ApproveNFT;
