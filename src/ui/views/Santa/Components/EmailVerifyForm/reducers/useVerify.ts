import { useReducer } from 'react';
import VERIFY_ACTIONS from './consts';
import VerifyState from './interfaces';

const initialState: VerifyState = {
  email: '',
  emailVerified: false,
  code: '',
  codeVerified: false,
  errorMsg: '',
};

const reducer = (
  state: VerifyState,
  action: { type: string; payload: any }
): VerifyState => {
  const { type, payload } = action;
  switch (type) {
    case VERIFY_ACTIONS.RETRIEVE:
      return {
        ...state,
        ...payload,
      };
    case VERIFY_ACTIONS.EMAIL:
      return {
        ...state,
        email: payload.email,
        errorMsg: payload.errorMsg,
      };
    case VERIFY_ACTIONS.VERIFY_EMAIL:
      return {
        ...state,
        emailVerified: payload,
      };
    case VERIFY_ACTIONS.CODE:
      return {
        ...state,
        code: payload,
      };
    case VERIFY_ACTIONS.VERIFY_CODE:
      return {
        ...state,
        codeVerified: payload,
      };
    case VERIFY_ACTIONS.ERROR:
      return {
        ...state,
        errorMsg: payload,
      };
    default:
      return state;
  }
};

const useVerify = () => {
  return useReducer(reducer, initialState);
};

export default useVerify;
