import React, { FC, useState } from 'react';
import { message } from 'antd';
import Drawer from '@/ui/component/Drawer';
import { ReactComponent as CloseModalIcon } from '@/ui/assets/jwallet/close-modal.svg';
import { ReactComponent as BackIcon } from '@/ui/assets/jwallet/arrow-left.svg';
import { ReactComponent as AttentionIcon } from '@/ui/assets/jwallet/attention.svg';
import { ReactComponent as CopyIcon } from '@/ui/assets/jwallet/copy.svg';
import useCurrentAccount from '@/hooks/wallet/useCurrentAccount';
import { useWallet } from '@/ui/utils';
import { useCopyToClipboard } from 'react-use';
import { useTranslation } from 'react-i18next';
import InputPassword from '@/ui/component/Inputs/InputPassword';
import StrayButtons from '@/ui/component/Buttons/StrayButtons';
import InputTextArea from '@/ui/component/Inputs/InputTextArea';
import PrimaryButton from '@/ui/component/Buttons/PrimaryButton';
import './style.less';

interface PropsType {
  show: boolean;
  onClose: () => void;
  onBack: () => void;
}

const PrivateKeyExport: FC<PropsType> = (props) => {
  const { show, onClose, onBack } = props;

  const currentAccount = useCurrentAccount();
  const wallet = useWallet();
  const [, copyToClipboard] = useCopyToClipboard();
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = async () => {
    try {
      await wallet.verifyPassword(password);
      const prvKey = await wallet.getPrivateKeyInternal(currentAccount.address);
      setPrivateKey(prvKey);
      setErrorPassword('');
    } catch (err) {
      setErrorPassword('Incorrect password, try again');
    }
  };

  const copyPrvKey = async () => {
    copyToClipboard(privateKey);
    message.success({
      content: t('Copied'),
      duration: 0.5,
      className: 'refresh-toast rectangle-toast',
    });
  };

  return (
    <Drawer open={show} height={459} onClose={handleClose}>
      <div
        className="w-full h-full rounded-t-lg relative"
        style={{
          background: 'linear-gradient(180deg, #866DDC 0%, #7A50D7 100%)',
          overflow: 'scroll',
        }}
      >
        <div className="flex w-full justify-end pt-[11px] pr-[16px] pb-1">
          <span onClick={handleClose}>
            <CloseModalIcon className="hover:cursor-pointer" />
          </span>
        </div>
        <div className="flex items-center w-full px-[30px]">
          <BackIcon className="hover:cursor-pointer mr-2" onClick={onBack} />
          <h2 className="text-18 font-GilroyExtraBold text-white ">
            Show Private Key
          </h2>
        </div>

        <div className="mt-8 px-[30px] h-max">
          {!privateKey && (
            <>
              <div className="mb-3">
                <InputPassword
                  placeHolder="Enter your password to continue"
                  name="password"
                  value={password}
                  errorMsg={errorPassword}
                  autoFocus={true}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleConfirm();
                    }
                  }}
                />
              </div>
            </>
          )}

          {privateKey && (
            <InputTextArea
              value={privateKey}
              placeHolder={'Private key'}
              onChange={() => true}
              disable={true}
              wrapperClass="mb-3"
              appendedIcon={
                <CopyIcon
                  className="hover:cursor-pointer small-icon"
                  onClick={copyPrvKey}
                />
              }
            />
          )}

          <div className="flex items-start">
            <AttentionIcon className="mr-3 block small-icon" />
            <div className="text-orange font-bold">
              Warning: Never disclose this key. Anyone with your private keys
              can steal any assets held in your account.
            </div>
          </div>

          {!privateKey && (
            <div className="bottom-btn">
              <StrayButtons
                nextTitle="CONFIRM"
                backTitle="CANCEL"
                disabledNext={!password}
                onBack={onBack}
                onNext={handleConfirm}
              />
            </div>
          )}
          {privateKey && (
            <div className="bottom-btn">
              <PrimaryButton text="DONE" onClick={onBack} />
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default PrivateKeyExport;
