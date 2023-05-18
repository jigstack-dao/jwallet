import React, { useMemo } from 'react';
import CloseIcon from '@/ui/assets/jwallet/close-fill.svg';
import clsx from 'clsx';

interface IProps {
  mnemonics: string;
  selected: string[];
  error: undefined | string;
  onChange: (values: string[]) => void;
}

const SelectMnemonics: React.FC<IProps> = ({
  mnemonics,
  selected,
  error,
  onChange,
}) => {
  const randomMnemonics = useMemo(
    () => mnemonics.split(' ').sort(() => Math.random() - 0.5),
    [mnemonics]
  );

  const handleSelect = (value: string) => {
    const _selected = [...selected];
    _selected.push(value);
    onChange(_selected);
  };

  const handleRemove = (value: string) => {
    onChange([...selected].filter((x) => x != value));
  };

  return (
    <>
      <div className="mb-[14px]">
        <div
          className={clsx(
            error ? 'border-orange' : 'border-white',
            'h-[184px] py-[20px] px-[16px] font-GilroyExtraBold border-[1px]  rounded-xl flex flex-wrap justify-start content-start'
          )}
        >
          {selected.map((x: string) => (
            <div
              key={x}
              className="py-1 px-2 rounded-lg flex justify-center items-center h-[28px] mr-[17px] mb-[13px]"
              style={{
                background:
                  'linear-gradient(154.64deg, rgba(255, 255, 255, 0.35) 6.18%, rgba(255, 255, 255, 0.09) 93.39%)',
              }}
            >
              <span className="mr-[6px] text-14 font-GilroyExtraBold">{x}</span>
              <span onClick={() => handleRemove(x)}>
                <img src={CloseIcon} alt="" />
              </span>
            </div>
          ))}
        </div>
        <span className="text-orange">{error}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {randomMnemonics.map((x) => (
          <span
            key={x}
            className={clsx(
              selected.includes(x) && 'opacity-60 pointer-events-none',
              'text-14 font-GilroyExtraBold border-[1px] border-white py-1 px-2 rounded-lg text-center cursor-pointer'
            )}
            onClick={() => handleSelect(x)}
          >
            {x}
          </span>
        ))}
      </div>
    </>
  );
};

export default SelectMnemonics;
