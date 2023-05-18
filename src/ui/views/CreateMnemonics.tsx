import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useWallet } from 'ui/utils';
import Title from '../component/Title';
import PrimaryButton from '../component/Buttons/PrimaryButton';
import DownloadIcon from '@/ui/assets/jwallet/download.svg';
import AttentionIcon from '@/ui/assets/jwallet/attention.svg';
import SelectMnemonics from '../component/SelectMnemonics';
import PrimaryLayout from '../component/Layouts/PrimaryBackground';
import { useTranslation } from 'react-i18next';
import StrayButtons from '../component/Buttons/StrayButtons';
import { generateAlianName } from '../utils/address';
import Routes from '@/constant/routes';
import SecurityModal from './PrivateInfoSetting/Components/SecurityModal';

const CreateMnemonic = () => {
  const [showVerify, setShowVerify] = useState<boolean>(false);
  const [mnemonics, setMnemonics] = useState('');
  const wallet = useWallet();
  useEffect(() => {
    void (async () => {
      const MNEMONICS_LENGTH = 12;
      let uniqueMne: string[] = [];
      do {
        const _mnemonics = ((await wallet.getPreMnemonics()) ||
          (await wallet.generatePreMnemonic())) as string;
        uniqueMne = [...new Set(_mnemonics.split(' '))];
      } while (uniqueMne.length != MNEMONICS_LENGTH);
      setMnemonics(uniqueMne.join(' '));
    })();
  }, []);

  const toggleVerify = () => {
    setShowVerify(!showVerify);
  };

  return showVerify ? (
    <VerifyMnemonics mnemonics={mnemonics} onBackClick={toggleVerify} />
  ) : (
    <DisplayMnemonic mnemonics={mnemonics} onNextClick={toggleVerify} />
  );
};

const DisplayMnemonic = ({ mnemonics, onNextClick }) => {
  const wallet = useWallet();
  const history = useHistory();
  const [openDownload, setOpenDownload] = useState(false);

  const handleBackClick = async () => {
    await wallet.removePreMnemonics();
    if (history.length > 1) {
      history.goBack();
    } else {
      history.replace('/');
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

  return (
    <PrimaryLayout>
      {openDownload && (
        <SecurityModal
          onClose={() => setOpenDownload(false)}
          onContinue={downloadPhrase}
        />
      )}
      <div className="text-center mb-[14px] mt-[25px]">
        <Title text="Recovery Phrase" />
      </div>
      <p className="text-center mb-[14px] text-14 opacity-60 mx-[-10px]">
        Your secret Recovery phrase makes it easy to back up and restore your
        account.
      </p>
      <div className="py-[40px] px-[35px] font-GilroyExtraBold border-[1px] border-white rounded-xl mb-[14px] flex justify-center items-center flex-wrap">
        <p className="text-[16px] text-center leading-7">{mnemonics}</p>
      </div>
      <div className="flex justify-center mb-[35px]">
        <span className="mr-1">
          <img src={AttentionIcon} alt="" />
        </span>
        <span className="text-orange text-14 text-center mr-1">
          Be sure to save recovery phrase, it cannot be retrieved after loss!
        </span>
      </div>
      <div className="flex justify-center items-center mb-[55px]">
        <span className="mr-3 cursor-pointer">
          <img src={DownloadIcon} alt="" />
        </span>
        <span
          className="text-14 font-GilroyExtraBold cursor-pointer"
          // onClick={downloadPhrase}
          onClick={() => setOpenDownload(true)}
        >
          Download Phrase
        </span>
      </div>
      <div className="grid grid-cols-2 gap-5">
        <PrimaryButton
          text="BACK"
          onClick={handleBackClick}
          color="transparent"
        />
        <PrimaryButton text="NEXT" onClick={onNextClick} />
      </div>
    </PrimaryLayout>
  );
};

const VerifyMnemonics = ({
  mnemonics,
  onBackClick,
}: {
  mnemonics: string;
  onBackClick: () => void;
}) => {
  const history = useHistory();
  const wallet = useWallet();
  const { t } = useTranslation();
  const { state } = useLocation<{
    alianName?: string;
  }>();
  const [selectedMnemonics, setSelectedMnemonics] = useState<string[]>([]);
  const [errMsg, setErrMsg] = useState<undefined | string>(undefined);

  const onVerify = async () => {
    if (selectedMnemonics.join(' ') !== mnemonics) {
      setErrMsg('Wrong mnemonic word');
      return;
    }
    const count = await wallet.getAccountsCount();
    const accounts = await wallet.createKeyringWithMnemonics(mnemonics);
    const name =
      state?.alianName && state.alianName != ''
        ? state.alianName
        : generateAlianName(count + 1);
    await wallet.updateAlianName(accounts[0].address, name);
    history.replace({
      pathname: Routes.ScreenSuccess,
      state: {
        title: t('Successfully created'),
        importedLength: 1,
      },
    });
  };

  const changeMnemonics = (values: string[]) => {
    setSelectedMnemonics(values);
    setErrMsg(undefined);
  };

  return (
    <PrimaryLayout>
      <div className="text-center mb-[14px] mt-[25px]">
        <Title text="Confirm Recovery Phrase" />
      </div>
      <p className="text-center mb-[14px] text-14 opacity-60 mx-[-10px]">
        Please select the words in order
      </p>
      <div className="mb-[50px]">
        <SelectMnemonics
          mnemonics={mnemonics}
          selected={selectedMnemonics}
          onChange={changeMnemonics}
          error={errMsg}
        />
      </div>
      <StrayButtons
        disabledNext={selectedMnemonics.length != mnemonics.split(' ').length}
        onBack={onBackClick}
        onNext={onVerify}
      />
    </PrimaryLayout>
  );
};

export default CreateMnemonic;
