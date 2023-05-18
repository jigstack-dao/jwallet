import React, { useEffect, useState } from 'react';
import { ReactComponent as CheckIcon } from '@/ui/assets/jwallet/check-green.svg';
import { ReactComponent as EditIcon } from '@/ui/assets/jwallet/edit.svg';
import useAccounts from '@/hooks/wallet/useAccounts';
import clsx from 'clsx';

const EditAccount = ({ value, onSave }) => {
  const [isEdit, setIsEdit] = useState(false);
  const [editedValue, setEditedValue] = useState('');
  const [err, setErr] = useState<undefined | string>(undefined);
  const [names, setNames] = useState<string[]>([]);
  const accounts = useAccounts();

  useEffect(() => {
    setEditedValue(value);
  }, [value]);

  useEffect(() => {
    setNames(
      accounts.map((x) => x.alianName.toLowerCase()).filter((x) => x != value)
    );
  }, [accounts, value]);

  const handleChange = (value: string) => {
    setEditedValue(value);
    setErr(
      names.includes(value.toLowerCase())
        ? 'This account name already exists'
        : undefined
    );
  };

  if (isEdit) {
    return (
      <>
        <div className="w-full flex justify-center items-center space-x-1 h-9 relative">
          <input
            type="text"
            className={clsx(
              err ? 'border-orange' : 'border-white',
              'border rounded-lg h-9 p-[10px] pr-6 w-full'
            )}
            style={{ background: ' rgba(21, 29, 40, 0.25)' }}
            value={editedValue}
            onChange={(e) => handleChange(e.target.value)}
          />
          {!err && (
            <span
              onClick={() => {
                setIsEdit(false);
                onSave(editedValue);
              }}
              className="absolute right-1 hover:cursor-pointer hover-overlay rounded-md"
            >
              <CheckIcon />
            </span>
          )}
        </div>
        {err && (
          <span className="text-orange text-[12px] leading-[1rem]">{err}</span>
        )}
      </>
    );
  }

  return (
    <div className="text-[#fff] font-[600] text-[16px] leading-[20px] flex items-center h-9">
      <span>{editedValue}</span>
      <span
        onClick={() => {
          setIsEdit(true);
        }}
        className="hover:cursor-pointer hover-overlay h-5 w-5 p-[1px] ml-[5px] rounded-md"
      >
        <EditIcon />
      </span>
    </div>
  );
};

export default EditAccount;
