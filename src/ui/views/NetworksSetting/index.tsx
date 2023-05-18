import React from 'react';
import useNetwork from '@/hooks/wallet/useNetwork';
import './style.less';
import { ReactComponent as ArrowRightIcon } from '@/ui/assets/jwallet/arrow-right.svg';
import PrimaryButton from '@/ui/component/Buttons/PrimaryButton';
import { useHistory } from 'react-router-dom';
import Routes from '@/constant/routes';
import PageContainer from '@/ui/component/PageContainer';

const NetworksSetting = () => {
  const { networks } = useNetwork();
  const history = useHistory();
  return (
    <PageContainer title="Networks">
      <div>
        <div id="networks-setting">
          {networks.map((x) => (
            <div
              key={x.chainId}
              className="network-card hover:cursor-pointer"
              onClick={() => {
                history.push({
                  pathname: Routes.AddCustomNetwork,
                  search: `?old=${x.chainId}`,
                });
              }}
            >
              <div className="network-card__dot"></div>
              <div className="network-card__name">{x.name}</div>
              <div className="network-card__arrow-right">
                <ArrowRightIcon />
              </div>
            </div>
          ))}
        </div>
        <PrimaryButton
          text="ADD NETWORK"
          onClick={() => {
            history.push(Routes.AddNetwork);
          }}
        />
      </div>
    </PageContainer>
  );
};

export default NetworksSetting;
