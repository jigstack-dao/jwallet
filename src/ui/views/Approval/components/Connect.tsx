import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Chain } from 'background/service/openapi';
import { ChainSelector, Spin, FallbackSiteLogo } from 'ui/component';
import { useApproval, useWallet } from 'ui/utils';
import { CHAINS_ENUM, CHAINS } from 'consts';
import '../style.less';
import StrayButtons from '@/ui/component/Buttons/StrayButtons';
import useNetwork from '@/hooks/wallet/useNetwork';

interface ConnectProps {
  params: any;
  onChainChange: (chain: CHAINS_ENUM) => void;
  defaultChain: CHAINS_ENUM;
}

const Connect = ({ params: { icon, origin } }: ConnectProps) => {
  const { state } = useLocation<{
    showChainsModal?: boolean;
  }>();
  const { showChainsModal = false } = state ?? {};
  const [showModal] = useState(showChainsModal);
  const [, resolveApproval, rejectApproval] = useApproval();
  const { t } = useTranslation();
  const wallet = useWallet();
  const [chainId, setChainId] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const { changeNetwork } = useNetwork();
  const init = async () => {
    const account = await wallet.getCurrentAccount();
    const site = await wallet.getSite(origin);
    if (site) {
      setChainId(site.chainId);
      setIsLoading(false);
      return;
    }
    try {
      const recommendChains = await wallet.openapi.getRecommendChains(
        account!.address,
        origin
      );
      setIsLoading(false);
      let targetChain: Chain | undefined;
      for (let i = 0; i < recommendChains.length; i++) {
        targetChain = Object.values(CHAINS).find(
          (c) => c.serverId === recommendChains[i].id
        );
        if (targetChain) break;
      }
      changeNetwork(targetChain?.id || CHAINS[CHAINS_ENUM.ETH].id);
      setChainId(targetChain ? targetChain.id : 1);
    } catch (e) {
      setIsLoading(false);
      console.log(e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    init();
  }, []);

  const handleCancel = () => {
    rejectApproval('User rejected the request.');
  };

  const handleAllow = async () => {
    changeNetwork(chainId);
    resolveApproval({
      chainId,
    });
  };

  const handleChainChange = (val: number) => {
    setChainId(val);
  };

  return (
    <Spin spinning={isLoading}>
      <div className="h-full flex flex-col justify-between">
        <div className="approval-connect">
          <div className="font-extrabold text-22 text-center">
            {t('Website Wants to Connect')}
          </div>
          <div className="connect-card">
            <div className="site-info">
              <div className="site-info__icon">
                <FallbackSiteLogo url={icon} origin={origin} width="44px" />
              </div>
              <div className="site-info__text">
                <p className="text-15 font-medium">{origin}</p>
              </div>
            </div>
            <div className="site-chain">
              <p className="mb-0 text-14 text-gray-content">
                {t('On this site use chain')}
              </p>
              <ChainSelector
                value={chainId}
                onChange={handleChainChange}
                connection
                showModal={showModal}
              />
            </div>
          </div>
        </div>
        <StrayButtons
          onBack={handleCancel}
          onNext={handleAllow}
          backTitle="Cancel"
          nextTitle="Connect"
        />
      </div>
    </Spin>
  );
};

export default Connect;
