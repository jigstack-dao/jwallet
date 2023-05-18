import React from 'react';
import { ReactComponent as ArrowRightIcon } from '@/ui/assets/jwallet/arrow-right.svg';
import './style.less';
import PageContainer from '@/ui/component/PageContainer';
import { useHistory } from 'react-router-dom';
import Routes from '@/constant/routes';

const SettingPaths = [
  { name: 'General', link: Routes.GeneralSetting },
  { name: 'Private Info', link: Routes.PrivateInfoSetting },
  { name: 'Advanced', link: Routes.AdvancedSetting },
  { name: 'Contacts', link: Routes.ContactsSetting },
  { name: 'Networks', link: Routes.NetworksSetting },
];

const SettingBoard = () => {
  const history = useHistory();

  return (
    <PageContainer title="Settings">
      <div id="setting-board-container">
        <div>
          {SettingPaths.map((x) => (
            <div
              className="setting-card"
              key={x.name}
              onClick={() => {
                history.push(x.link);
              }}
            >
              <div className="setting-card__name">{x.name}</div>
              <div className="setting-card__icon">
                <ArrowRightIcon />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
};

export default SettingBoard;
