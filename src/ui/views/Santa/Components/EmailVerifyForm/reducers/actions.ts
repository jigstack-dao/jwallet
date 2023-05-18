import { validateEmail } from '@/utils/validate-values';
import VERIFY_ACTIONS from './consts';
import VerifyState from './interfaces';

export const retrieve = (oldState: VerifyState) => {
  return {
    type: VERIFY_ACTIONS.RETRIEVE,
    payload: oldState,
  };
};

export const changeEmail = (email: string) => {
  const errorMsg =
    validateEmail(email) || email.length == 0 ? undefined : 'Invalid email';
  return {
    type: VERIFY_ACTIONS.EMAIL,
    payload: {
      email,
      errorMsg,
    },
  };
};

export const verifyEmail = (isVerified: boolean) => {
  return {
    type: VERIFY_ACTIONS.VERIFY_EMAIL,
    payload: isVerified,
  };
};

export const enterCode = (code: string) => {
  return {
    type: VERIFY_ACTIONS.CODE,
    payload: code,
  };
};

export const verifyCode = (isVerified: boolean) => {
  return {
    type: VERIFY_ACTIONS.VERIFY_CODE,
    payload: isVerified,
  };
};

export const setErr = (errorMsg: string) => {
  return {
    type: VERIFY_ACTIONS.ERROR,
    payload: errorMsg,
  };
};
