import PrimaryButton from '@/ui/component/Buttons/PrimaryButton';
import StrayButtons from '@/ui/component/Buttons/StrayButtons';
import { useWallet } from '@/ui/utils';
import React, { useState } from 'react';
import './style.less';
import { ReactComponent as DownloadIcon } from '@/ui/assets/jwallet/download.svg';
import { ReactComponent as CopyIcon } from '@/ui/assets/jwallet/copy.svg';
import { useCopyToClipboard } from 'react-use';
import InputPassword from '@/ui/component/Inputs/InputPassword';
import { useHistory } from 'react-router-dom';
import SecurityModal from '../SecurityModal';

const ExportSeed = () => {
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [errorPassword, setErrorPassword] = useState<string | undefined>(
    undefined
  );
  const [mnemonics, setMnemonics] = useState(
    'federal skull wall width trick sponsor notable feed much speak claw sausage'
  );
  const [openDownload, setOpenDownload] = useState(false);
  const wallet = useWallet();
  const [, copyToClipboard] = useCopyToClipboard();
  const history = useHistory();

  const onPasswordChange = (value: string) => {
    if (step == 2) return;
    setPassword(value);
    setErrorPassword(undefined);
  };

  const confirmPassword = async () => {
    try {
      await wallet.verifyPassword(password);
      const seed = await wallet.getMnemonics(password);
      setMnemonics(seed);
      setErrorPassword(undefined);
      setStep(2);
    } catch {
      setErrorPassword('Incorrect password, try again');
    }
  };

  const downloadPhrase = () => {
    const element = document.createElement('a');
    const file = new Blob([mnemonics], {
      type: 'text/plain',
    });
    element.href = URL.createObjectURL(file);
    element.download = 'recovery-phrase.txt';
    document.body.appendChild(element);
    element.click();
  };

  const onClose = () => {
    history.goBack();
  };

  return (
    <div>
      <div className="export-seed-main">
        {step == 1 && (
          <div className="mt-4">
            <InputPassword
              placeHolder="Enter your password to continue"
              name="password"
              value={password}
              errorMsg={errorPassword}
              autoFocus={true}
              onChange={(e) => onPasswordChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  confirmPassword();
                }
              }}
            />
          </div>
        )}
        {step == 2 && (
          <div className="menemonics">
            {openDownload && (
              <SecurityModal
                onClose={() => setOpenDownload(false)}
                onContinue={downloadPhrase}
              />
            )}
            <div className="menemonics__title">Your secret recovery phrase</div>
            <div className="menemonics__content">
              <div className="menemonics__content__text">{mnemonics}</div>
            </div>
            <div className="menemonics__buttons">
              <div
                className="menemonics__buttons__item"
                onClick={() => setOpenDownload(true)}
              >
                <span>
                  <DownloadIcon />
                </span>
                <span>Download Phrase</span>
              </div>
              <div
                className="menemonics__buttons__item"
                onClick={() => copyToClipboard(mnemonics)}
              >
                <span>
                  <CopyIcon />
                </span>
                <span>Copy to clipboard</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {step == 1 && (
        <StrayButtons
          backTitle="CANCEL"
          onNext={() => confirmPassword()}
          disabledNext={password.length == 0}
        />
      )}
      {step == 2 && (
        <PrimaryButton text="CLOSE" onClick={() => onClose()}></PrimaryButton>
      )}
    </div>
  );
};

export default ExportSeed;
