import PrimaryHeader from '../component/Headers/PrimaryHeader';
import Title from '../component/Title';
import CheckIcon from '../assets/jwallet/check.svg';
import PrimaryButton from '../component/Buttons/PrimaryButton';
import React, { useHistory, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

export default function ScreenSuccess() {
  const history = useHistory();
  const { t } = useTranslation();

  const onDone = () => {
    history.replace('/');
  };

  const { state } = useLocation<{
    title: string;
    importedLength?: number;
  }>();

  const { title = t('Successfully imported'), importedLength = 0 } = state;

  return (
    <div className="w-[400px] h-full mx-auto text-white relative pt-[15px] pb-[35px] px-[30px]">
      <div className="mb-[25px] ml-[-30px]">
        <PrimaryHeader />
      </div>
      <div className="mb-[13px]">
        <Title text={title} />
      </div>
      <p className="mb-[83px] text-center">
        {importedLength
          ? `${importedLength} ${importedLength > 1 ? 'addresses' : 'address'}`
          : ''}{' '}
      </p>
      <div
        className={clsx(
          'flex justify-center items-center mb-[164px]',
          importedLength ? 'mb-[150px]' : 'mb-[164px]'
        )}
      >
        <div className="bg-transparent w-[134px] h-[134px] border-[3px] rounded-full flex justify-center items-center">
          <img src={CheckIcon} alt="" />
        </div>
      </div>
      <div>
        <PrimaryButton text="DONE" onClick={onDone} />
      </div>
    </div>
  );
}
