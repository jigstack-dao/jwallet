import { useState } from 'react';

const MINIMUM_PASSWORD_LENGTH = 8;

const useFormCreatePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errMsgPassword, setErrMsgPassword] = useState<string | undefined>(
    undefined
  );
  const [errMsgConfirmPassword, setErrMsgConfirmPassword] = useState<
    string | undefined
  >(undefined);

  const handleChangeInput = (field: string, value: string) => {
    switch (field) {
      case 'password': {
        setPassword(value);
        setErrMsgPassword(
          value.length > 0 && value.length < MINIMUM_PASSWORD_LENGTH
            ? 'The password must length must be greater than or equal to 8'
            : undefined
        );
        setErrMsgConfirmPassword(
          value != confirmPassword && confirmPassword.length > 0
            ? 'Those passwords didn’t match! Try again.'
            : undefined
        );
        break;
      }
      case 'confirmPassword': {
        setConfirmPassword(value);
        setErrMsgConfirmPassword(
          value.length > 0 && password != value
            ? 'Those passwords didn’t match! Try again.'
            : undefined
        );
        break;
      }
      default:
        break;
    }
  };

  const isValidForm = () =>
    password.length > 0 &&
    confirmPassword.length > 0 &&
    errMsgConfirmPassword == undefined &&
    errMsgPassword == undefined;

  return {
    handleChangeInput,
    isValidForm,
    password,
    confirmPassword,
    errMsgConfirmPassword,
    errMsgPassword,
  };
};

export default useFormCreatePassword;
