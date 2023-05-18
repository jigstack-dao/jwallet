import React from 'react';
import { useTranslation } from 'react-i18next';
import { message } from 'antd';
import { useWallet } from 'ui/utils';
import IconJigstackWhite from 'ui/assets/jigstack-white.svg';

const DefaultWalletAlertBar = ({ onChange }: { onChange: () => void }) => {
  const { t } = useTranslation();
  const wallet = useWallet();
  const handleConfirm = () => {
    wallet.setIsDefaultWallet(true);
    onChange();
    message.info({
      className: 'refresh-toast rectangle-toast',
      content: t('Please refresh the website your are viewing'),
      duration: 3,
    });
  };

  return (
    <div className="default-wallet-alert">
      <img src={IconJigstackWhite} className="icon icon-jigstack-white" />
      <span>{t('SetDefaultWalletAlert')}</span>
      <a href="javascript:;" className="confirm-btn" onClick={handleConfirm}>
        {t('Confirm')}
      </a>
    </div>
  );
};

export default DefaultWalletAlertBar;
