import PrimaryHeader from '../component/Headers/PrimaryHeader';
import Title from '../component/Title';
import RejectedIcon from '../assets/jwallet/rejected.svg';
import PrimaryButton from '../component/Buttons/PrimaryButton';
import React, { useHistory, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ScreenFailed() {
  const history = useHistory();
  const { t } = useTranslation();

  const onDone = () => {
    history.replace('/');
  };

  const { state } = useLocation<{
    title: string;
  }>();

  const { title = t('Transaction rejected') } = state;
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
      <div className="mb-[13px]">
        <Title text={title} />
      </div>
      <div className="flex justify-center items-center my-[130px]">
        <div className="bg-transparent w-[134px] h-[134px] border-[3px] rounded-full flex justify-center items-center">
          <img src={RejectedIcon} alt="" />
        </div>
      </div>
      <div>
        <PrimaryButton text="DONE" onClick={onDone} />
      </div>
    </div>
  );
}
