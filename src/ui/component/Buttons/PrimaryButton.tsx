import clsx from 'clsx';
import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type ButtonColors = 'primary' | 'white' | 'transparent';

export const colorCSS = {
  primary: {
    background:
      'linear-gradient(154.64deg, rgba(255, 255, 255, 0.35) 6.18%, rgba(255, 255, 255, 0.09) 93.39%)',
    color: 'white',
  },
  white: {
    background:
      'linear-gradient(180deg, #FCFAFF 0%, #E8DBFF 100%), linear-gradient(156.27deg, #5957D5 0%, #9257D5 100.75%), linear-gradient(154.64deg, rgba(255, 255, 255, 0.35) 6.18%, rgba(255, 255, 255, 0.09) 93.39%)',
    color: '#5957D5',
  },
  transparent: {
    background: 'transparent',
    color: 'white',
    borderWidth: 2,
    borderColor:
      'linear-gradient(154.64deg, rgba(255, 255, 255, 0.35) 6.18%, rgba(255, 255, 255, 0.09) 93.39%)',
    borderOpacity: 0.6,
  },
};

interface IProps {
  text?: ReactNode;
  disabled?: boolean;
  onClick?: any;
  color?: ButtonColors;
}

const PrimaryButton: React.FC<IProps> = ({
  text = '',
  disabled = false,
  color = 'primary',
  onClick,
}) => {
  const { t } = useTranslation();

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      className={clsx(
        disabled
          ? 'opacity-50 hover:cursor-not-allowed'
          : 'hover:opacity-80 active:opacity-60',
        'w-full h-[60px] rounded-[100px] backdrop-blur-10'
      )}
      style={{
        ...colorCSS[color],
        boxShadow: '0px 4px 24px -1px rgba(0, 0, 0, 0.1)',
      }}
      onClick={() => handleClick()}
      disabled={disabled}
    >
      <span className="font-GilroyExtraBold text-[16px] leading-[35px] tracking-1">
        {typeof text === 'string' ? t(text) : text}
      </span>
    </button>
  );
};

export default PrimaryButton;
