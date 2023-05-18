import React, { useEffect, useRef, useState } from 'react';
import EyeIcon from '@/ui/assets/jwallet/eye.svg';
import EyeHiddenIcon from '@/ui/assets/jwallet/eye-hidden.svg';
import clsx from 'clsx';

interface IProps {
  value?: string;
  errorMsg?: string | undefined;
  placeHolder?: string;
  name?: string;
  autoFocus?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const InputPassword: React.FC<IProps> = ({
  value = '',
  errorMsg = undefined,
  placeHolder = '',
  name = '',
  autoFocus = false,
  onChange,
  onBlur,
  onKeyDown,
}) => {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLInputElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (onBlur) {
      onBlur(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onKeyDown) {
      onKeyDown(e);
    }
  };
  useEffect(() => {
    if (ref?.current && autoFocus) {
      ref.current.focus();
    }
  }, []);

  return (
    <>
      <div
        className={clsx(
          'w-full h-[60px] flex justify-center items-center opacity-100 px-[20px] rounded-[12px] bg-input',
          errorMsg
            ? 'border-[1px] border-orange'
            : 'focus-within:border-[1px] focus-within:border-white'
        )}
      >
        <input
          type={show ? 'text' : 'password'}
          style={{ background: 'transparent' }}
          name={name}
          value={value}
          placeholder={placeHolder}
          className="w-full h-[60px] opacity-100 text-14 mb-1 text-inherit"
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
        <img
          src={show ? EyeIcon : EyeHiddenIcon}
          alt=""
          className="hover:cursor-pointer"
          onClick={() => {
            setShow(!show);
          }}
        />
      </div>
      {errorMsg && <p className="text-orange text-14">{errorMsg}</p>}
    </>
  );
};

export default InputPassword;
