import React from 'react';
import clsx from 'clsx';

interface IProps {
  value?: string;
  errorMsg?: string | undefined;
  placeHolder?: string;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const InputText: React.FC<IProps> = ({
  value = '',
  errorMsg = undefined,
  placeHolder = '',
  name = '',
  onChange,
  onBlur,
  onKeyDown,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    }
  };

  const handleBlur = () => {
    if (onBlur) {
      onBlur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <>
      <div
        className={clsx(
          'w-full h-[60px] flex justify-center items-center opacity-100 px-[20px] rounded-[12px] bg-input',
          errorMsg
            ? 'border-[1px] border-orange'
            : 'focus-within:border-[1px] focus-within:border-white'
        )}
        onBlur={() => handleBlur()}
      >
        <input
          type="text"
          name={name}
          value={value}
          placeholder={placeHolder}
          className="w-full h-[60px] opacity-100 text-14 text-white"
          style={{ background: 'transparent' }}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </div>
      {errorMsg && <p className="text-orange text-14">{errorMsg}</p>}
    </>
  );
};

export default InputText;
