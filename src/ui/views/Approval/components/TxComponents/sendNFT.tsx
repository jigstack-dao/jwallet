import { ellipsis } from '@/ui/utils/address';
import NFTAvatar from '@/ui/views/Dashboard/components/NFT/NFTAvatar';
import { ExplainTxResponse } from 'background/service/openapi';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import IconArrowRight from 'ui/assets/arrow-right-gray.svg';
import IconUnknownNFT from 'ui/assets/unknown-nft.svg';
import { Copy, NameAndAddress } from 'ui/component';
import BalanceChange from './BalanceChange';
import SpeedUpCorner from './SpeedUpCorner';
import ViewRawModal from './ViewRawModal';

interface SendNFTProps {
  data: ExplainTxResponse;
  chainName: string;
  isSpeedUp: boolean;
  raw: Record<string, string | number>;
}

const SendNFT = ({ data, chainName, isSpeedUp, raw }: SendNFTProps) => {
  const detail = data.type_nft_send!;
  const { t } = useTranslation();

  const handleViewRawClick = () => {
    ViewRawModal.open({
      raw,
      abi: data?.abiStr,
    });
  };

  return (
    <div className="send-nft">
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
          Send {detail.token_amount} {detail.token_amount > 1 ? 'NFTs' : 'NFT'}
        </p>
        <div className="nft-card">
          <NFTAvatar
            thumbnail={!detail.nft?.detail_url}
            type={detail.nft?.content_type}
            content={detail.nft?.detail_url || ''}
            unknown={IconUnknownNFT}
          ></NFTAvatar>
          <div className="nft-card-content">
            <div className="nft-card-title text-white">
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
          <div className="item">
            <div className="label">To address</div>
            <div className="value flex items-center gap-8">
              <div className="address flex gap-6">
                <NameAndAddress
                  address={detail.spender}
                  className="text-13"
                  nameClass="max-117 text-13"
                  addressClass="text-13"
                />
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

export default SendNFT;
