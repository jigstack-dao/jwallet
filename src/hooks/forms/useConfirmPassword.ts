import { useState } from 'react';

const useConfirmPassword = () => {
  const [password, setPassword] = useState('');
  const [errMsg, setErrMsg] = useState<undefined | string>(undefined);

  const handleChangePassword = (
    e: React.ChangeEvent<HTMLInputElement>,
    cb?: () => void
  ) => {
    setPassword(e.target.value);
    setErrMsg(undefined);
    if (cb) cb();
  };

  const handleKeyDownPassword = (
    e: React.KeyboardEvent<HTMLInputElement>,
    cb: () => void
  ) => {
    if (e.key == 'Enter') {
      cb();
    }
  };

  return {
    password,
    errMsg,
    handleChangePassword,
    setErrMsg,
    handleKeyDownPassword,
    setPassword,
  };
};

export default useConfirmPassword;
