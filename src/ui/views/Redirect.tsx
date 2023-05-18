import PrimaryHeader from '../component/Headers/PrimaryHeader';
import PrimaryButton from '../component/Buttons/PrimaryButton';
import React, { useHistory, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ReactNode } from 'react';

export default function Redirect() {
  const history = useHistory();
  const { t } = useTranslation();

  const onDone = () => {
    history.replace('/');
  };

  const { state } = useLocation<{
    message: ReactNode;
  }>();

  const { message = t('Successfully imported') } = state;
  return (
    <div
      className="w-full h-full text-white relative pt-[15px] pb-[35px] px-[30px]"
      style={{
        background: 'linear-gradient(156.27deg, #5957D5 0%, #9257D5 100.75%)',
      }}
    >
      <div className="mb-[25px] ml-[-30px]">
        <PrimaryHeader />
      </div>
      <div className="redirect">
        <div className="my-[13px]">{message}</div>
      </div>
      <div className="w-full py-2">
        <PrimaryButton text="HOME" onClick={onDone} />
      </div>
    </div>
  );
}
