import clsx from 'clsx';
import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface IProps {
  text?: string;
  disabled?: boolean;
  onClick?: () => void;
  Icon?: ReactNode;
}

const ConnectButton: FC<IProps> = ({
  text = '',
  disabled = false,
  onClick,
  Icon = <></>,
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
        disabled ? 'opacity-50' : 'hover:opacity-90',
        'w-full h-[74px] backdrop-blur-10 rounded-[16px] flex items-center p-[20px] mb-[24px] font-[600] text-[14px] shadow-[0px_4px_24px_-1px_rgba(0, 0, 0, 0.1)]'
      )}
      style={{
        background:
          'linear-gradient(154.64deg, rgba(255, 255, 255, 0.35) 6.18%, rgba(255, 255, 255, 0.09) 93.39%)',
      }}
      onClick={() => handleClick()}
      // disabled={disabled}
    >
      {Icon}
      <span className="font-GilroyExtraBold text-[14px] leading-[35px] tracking-1">
        {t(text)}
      </span>
    </button>
  );
};

export default ConnectButton;
