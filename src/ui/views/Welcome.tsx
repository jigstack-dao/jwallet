import React from 'react';
import { useTranslation } from 'react-i18next';
import LogoWelcome from 'ui/assets/logo-welcome.svg';
import BackgroundWelcome from 'ui/assets/background/background-welcome.svg';
import PrimaryButton from '../component/Buttons/PrimaryButton';
import { useHistory } from 'react-router-dom';
import PrimaryLayout from '../component/Layouts/PrimaryBackground';
import Routes from '@/constant/routes';

const Welcome = () => {
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
          {t('Jwallet')}
        </p>
        <p className="font-semibold text-[16px] leading-[20px] mb-[129px] text-center">
          {t('A better extension wallet for users')}
        </p>
        <div>
          <PrimaryButton
            text="GET STARTED"
            onClick={() => {
              history.push(Routes.CreatePassword);
            }}
          />
        </div>
      </div>
    </PrimaryLayout>
  );
};

export default Welcome;
