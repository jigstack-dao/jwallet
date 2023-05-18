import React from 'react';
import PrimaryButton from './PrimaryButton';

interface IProps {
  backTitle?: string;
  nextTitle?: string;
  disabledBack?: boolean;
  disabledNext?: boolean;
  onBack?: () => void;
  onNext?: () => void;
}

const StrayButtons: React.FC<IProps> = ({
  backTitle = 'BACK',
  nextTitle = 'NEXT',
  disabledBack = false,
  disabledNext = false,
  onBack,
  onNext,
}) => {
  const handleClickBack = () => {
    if (onBack) {
      onBack();
    }
  };

  const handleClickNext = () => {
    if (onNext) {
      onNext();
    }
  };

  return (
    <div className="grid grid-cols-2 gap-5">
      <PrimaryButton
        text={backTitle}
        color="transparent"
        disabled={disabledBack}
        onClick={handleClickBack}
      />
      <PrimaryButton
        text={nextTitle}
        disabled={disabledNext}
        onClick={handleClickNext}
      />
    </div>
  );
};

export default StrayButtons;
