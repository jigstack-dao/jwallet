import React from 'react';
import { useWallet, useApproval, useWalletRequest } from 'ui/utils';
import Logo from '../../assets/jwallet/logo.svg';
import InputPassword from '@/ui/component/Inputs/InputPassword';
import PrimaryButton from '@/ui/component/Buttons/PrimaryButton';
import PrimaryLayout from '@/ui/component/Layouts/PrimaryBackground';
import useConfirmPassword from '@/hooks/forms/useConfirmPassword';
import { ERROR_MESSAGES } from '@/constant/messages';

const Unlock = () => {
  const wallet = useWallet();
  const [, resolveApproval] = useApproval();
  const {
    password,
    errMsg,
    setErrMsg,
    handleKeyDownPassword,
    handleChangePassword,
  } = useConfirmPassword();

  const [run] = useWalletRequest(wallet.unlock, {
    onSuccess() {
      resolveApproval();
      setErrMsg(undefined);
    },
    onError() {
      setErrMsg(ERROR_MESSAGES.PASSWORD_INVALID);
    },
  });

  const onUnlock = async () => {
    run(password);
  };

  return (
    <PrimaryLayout showHeader={false}>
      <div className="flex justify-center w-full">
        <img src={Logo} alt="" />
      </div>
      <p className="font-GilroyExtraBold text-22 leading-7 mb-[6px] -mt-5 text-center">
        Welcome back to JWallet!
      </p>
      <p className="opacity-60 text-14 mb-8 text-center">
        The easiest crypto solution
      </p>
      <div className="mb-3">
        <InputPassword
          placeHolder="Password"
          name="password"
          value={password}
          errorMsg={errMsg}
          autoFocus={true}
          onChange={handleChangePassword}
          onKeyDown={(e) =>
            handleKeyDownPassword(e, () => {
              onUnlock();
            })
          }
        />
      </div>
      <p className="mb-[34px] text-12 opacity-60 px-[2px] text-center">
        If you don’t remember you passsword you have to reset the extension and
        re-import your wallet
      </p>
      <p className="mb-8 text-14 text-center">
        Need help? Contact&nbsp;
        <a
          target="_blank"
          href={process.env.REACT_APP_SUPPORT_LINK}
          className="opacity-60"
          rel="noreferrer"
        >
          <u>Jwallet Support</u>
        </a>
      </p>
      <div className="">
        <PrimaryButton
          text="UNLOCK"
          disabled={password.length == 0 || errMsg != undefined}
          onClick={onUnlock}
        />
      </div>
    </PrimaryLayout>
  );
};

export default Unlock;
