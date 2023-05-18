import React, { FC, useState } from 'react';

import { Modal } from 'antd';
import { ReactComponent as CloseModalIcon } from '@/ui/assets/jwallet/close-modal.svg';
import InputPassword from '@/ui/component/Inputs/InputPassword';
import StrayButtons from '@/ui/component/Buttons/StrayButtons';
import { useWallet } from '@/ui/utils';
interface IProps {
  open: boolean;
  title?: string;
  onSuccess?: () => any;
  onFailed?: () => any;
  onClose?: () => any;
}

const PasswordModal: FC<IProps> = (props) => {
  const { open, title, onFailed, onSuccess, onClose } = props;
  const wallet = useWallet();
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string>();

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      await wallet.verifyPassword(password);
      onSuccess?.();
    } catch (error) {
      setErr('Password incorrect!');
      onFailed?.();
    }
  };

  return (
    <Modal
      title={null}
      open={open}
      footer={null}
      closable={false}
      width={368}
      centered
    >
      <form className="px-4 pb-[30px] text-white" onSubmit={onSubmit}>
        <div
          className="w-full flex justify-end pt-5 cursor-pointer"
          onClick={onClose}
        >
          <CloseModalIcon />
        </div>
        <div className="font-GilroyExtraBold text-18 text-center w-full mb-[28px]">
          {title ?? 'Confirm password'}
        </div>
        <div className="mb-[60px]">
          <InputPassword
            placeHolder="Please enter your password"
            name="password"
            errorMsg={err}
            onChange={(e) => {
              setPassword(e.target.value);
              setErr(undefined);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSubmit(e);
              }
            }}
            value={password}
          />
        </div>
        <StrayButtons
          backTitle="CANCEL"
          nextTitle="CONFIRM"
          disabledNext={!!err}
          onBack={close}
        />
      </form>
    </Modal>
  );
};

export default PasswordModal;
