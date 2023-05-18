import clsx from 'clsx';
import React, { ReactNode } from 'react';

interface IProps {
  value?: string;
  placeHolder?: string;
  name?: string;
  errMsg?: string | undefined;
  height?: number;
  wrapperClass?: string;
  inputClass?: string;
  disable?: boolean;
  appendedIcon?: ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const InputTextArea: React.FC<IProps> = ({
  value = '',
  placeHolder = '',
  name = '',
  errMsg = undefined,
  height = 110,
  wrapperClass = '',
  inputClass = '',
  disable = false,
  appendedIcon = undefined,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <>
      <div
        className={clsx(
          errMsg ? 'border border-orange' : 'border-none',
          'w-full bg-[#e4eaf340] rounded-xl p-[20px]',
          appendedIcon && 'flex',
          wrapperClass
        )}
        style={{ height }}
      >
        <textarea
          style={{ background: 'transparent' }}
          name={name}
          value={value}
          placeholder={placeHolder}
          className={clsx(
            'tracking-[1px] font-[500] text-[#FFF] whitespace-normal break-words resize-none placeholder-[#ffffffb3] w-full h-full disabled:opacity-50',
            appendedIcon && 'mr-4',
            inputClass
          )}
          onChange={handleChange}
          disabled={disable}
        />
        {appendedIcon}
      </div>
      {errMsg && <span className="text-orange">{errMsg}</span>}
    </>
  );
};

export default InputTextArea;
