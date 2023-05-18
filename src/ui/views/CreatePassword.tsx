import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useWallet, useWalletRequest } from 'ui/utils';
import UnlockLogo from 'ui/assets/jwallet/un-lock.svg';
import InputPassword from '../component/Inputs/InputPassword';
import PrimaryButton from '../component/Buttons/PrimaryButton';
import Checkbox from '../component/CheckboxV2';
import useFormCreatePassword from '@/hooks/forms/useFormCreatePassword';
import PrimaryHeader from '../component/Headers/PrimaryHeader';
import Title from '../component/Title';
import Routes from '@/constant/routes';

const CreatePassword = () => {
  const history = useHistory();
  const wallet = useWallet();
  const {
    password,
    confirmPassword,
    errMsgConfirmPassword,
    errMsgPassword,
    handleChangeInput,
    isValidForm,
  } = useFormCreatePassword();

  const [checked, setChecked] = useState(false);

  const [run, loading] = useWalletRequest(wallet.boot, {
    onSuccess() {
      // history.replace('/start-chain-management'); <= screen select newwork
      history.replace(Routes.NoAddress);
    },
    onError(err) {
      console.log(err);
    },
  });

  useEffect(() => {
    void (async () => {
      if ((await wallet.isBooted()) && !(await wallet.isUnlocked())) {
        history.replace('/unlock');
      }
    })();
  }, []);

  const onSubmit = () => {
    run(password.trim());
  };

  const disableCreate = () => loading || !checked || !isValidForm();

  return (
    <div className="flex justify-center h-full">
      <div className="w-[400px] d-flex justify-center h-full text-white relative pt-[15px] pb-[35px]">
        <div className="mb-[22px]">
          <PrimaryHeader />
        </div>
        <div className="flex justify-center mb-[26px]">
          <img src={UnlockLogo} alt="" />
        </div>
        <div className="mb-[8px]">
          <Title text="Create secure password first" />
        </div>
        <p className="mb-[33px] text-center text-12 opacity-60">
          This password will be used to unlock your wallet
        </p>

        <div className="px-[30px] mb-[16px]">
          <InputPassword
            placeHolder="Please enter at least 8 characters"
            name="password"
            value={password}
            errorMsg={errMsgPassword}
            onChange={(e) => handleChangeInput(e.target.name, e.target.value)}
          />
        </div>
        <div className="px-[30px] mb-[17px]">
          <InputPassword
            placeHolder="Confirm password"
            name="confirmPassword"
            value={confirmPassword}
            errorMsg={errMsgConfirmPassword}
            onChange={(e) => handleChangeInput(e.target.name, e.target.value)}
          />
        </div>
        <div className="px-[30px]">
          <Checkbox
            checked={checked}
            onChange={(_checked) => {
              setChecked(_checked);
            }}
          >
            <p className="text-14">
              <span className="mr-[4px]">I have read and agree to the</span>
              <span className="opacity-60">Terms of Use</span>
            </p>
          </Checkbox>
        </div>
        <div className="px-[30px] absolute bottom-[35px] w-full">
          <PrimaryButton
            text="CREATE"
            disabled={disableCreate()}
            onClick={onSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default CreatePassword;
