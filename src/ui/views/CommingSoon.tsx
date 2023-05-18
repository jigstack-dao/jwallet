import React from 'react';
import { useTranslation } from 'react-i18next';
import LogoWelcome from 'ui/assets/logo-welcome.svg';
import BackgroundWelcome from 'ui/assets/background/background-welcome.svg';
import PrimaryButton from '../component/Buttons/PrimaryButton';
import { useHistory } from 'react-router-dom';
import PrimaryLayout from '../component/Layouts/PrimaryBackground';

const CommingSoon = () => {
  const { t } = useTranslation();
  const history = useHistory();

  return (
    <PrimaryLayout showHeader={false}>
      <div className="mt-[82px]">
        <div className="absolute top-0 left-0">
          <img src={BackgroundWelcome} />
        </div>
        <div className="flex justify-center mb-[40px]">
          <img src={LogoWelcome} alt="" />
        </div>
        <p className="text-[28px] leading-[35px] mb-[20px] text-center font-GilroyExtraBold tracking-1">
          {t('COMMING SOON')}
        </p>
        <div>
          <PrimaryButton
            text="GET BACK"
            onClick={() => {
              history.goBack();
            }}
          />
        </div>
      </div>
    </PrimaryLayout>
  );
};

export default CommingSoon;
