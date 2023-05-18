import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWallet, useWalletRequest } from 'ui/utils';
import PrimaryLayout from '../component/Layouts/PrimaryBackground';
import Title from '../component/Title';
import InputTextArea from '../component/Inputs/InputTextArea';
import { isEmpty } from 'lodash';
import StrayButtons from '../component/Buttons/StrayButtons';
import { KEYRING_TYPE } from '@/constant';
import Routes from '@/constant/routes';
import { generateAlianName } from '../utils/address';
import { replaceErrorMsg } from '@/utils/format';
import jwalletAPI from '@/background/service/jwalletAPI';

const ImportMnemonic = () => {
  const history = useHistory();
  const wallet = useWallet();
  const [phrase, setPhrase] = useState('');
  const [errMsg, setErrMsg] = useState<undefined | string>(undefined);
  const { t } = useTranslation();

  const [run, loading] = useWalletRequest(wallet.generateKeyringWithMnemonic, {
    async onSuccess(keyringId) {
      try {
        const accounts = await wallet.requestKeyring(
          KEYRING_TYPE.HdKeyring,
          'getFirstPage',
          keyringId
        );
        await wallet.requestKeyring(
          KEYRING_TYPE.HdKeyring,
          'activeAccounts',
          keyringId,
          [accounts[0].index - 1] // select first account default
        );
        await wallet.addKeyring(keyringId);
        const count = await wallet.getAccountsCount();
        await wallet.updateAlianName(
          accounts[0].address,
          generateAlianName(count)
        );
        jwalletAPI.createWallet(accounts[0].address);
        history.push({
          pathname: Routes.ScreenSuccess,
          state: {
            title: t('Successfully imported'),
            importedLength: 1,
          },
        });
      } catch (err) {
        setErrMsg(replaceErrorMsg(err.message));
      }
    },
    onError(err) {
      setErrMsg(replaceErrorMsg(err.message));
    },
  });

  const handleLoadCache = async () => {
    const cache = await wallet.getPageStateCache();
    if (cache && cache.path === history.location.pathname) {
      setPhrase(cache.states);
    }
  };

  const handleClickBack = () => {
    if (history.length > 1) {
      history.goBack();
    } else {
      history.replace('/connect');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPhrase(e.target.value);
    setErrMsg(undefined);
    wallet.setPageStateCache({
      path: history.location.pathname,
      params: {},
      states: e.target.value,
    });
  };

  useEffect(() => {
    void (async () => {
      if (await wallet.hasPageStateCache()) handleLoadCache();
    })();

    return () => {
      wallet.clearPageStateCache();
    };
  }, []);

  const handleSubmit = () => {
    run(phrase);
  };

  return (
    <PrimaryLayout>
      <div className="text-center mb-[14px] mt-[25px]">
        <Title text="Import by Recovery Phrase" />
      </div>
      <div className="text-center my-4 text-[#E1DFF0] text-14 mx-[-9px]">
        <div>
          Imported accounts will not be associated with the recovery phrase
          originally created with Jwallet.
        </div>
        <div className="mt-2">Paste your recovery phrase here</div>
      </div>
      <div className="h-[320px]">
        <InputTextArea
          value={phrase}
          placeHolder="Recovery phrase"
          onChange={handleChange}
          errMsg={errMsg}
          height={180}
        />
      </div>
      <StrayButtons
        nextTitle="IMPORT"
        disabledNext={isEmpty(phrase) || loading || errMsg != undefined}
        onBack={handleClickBack}
        onNext={handleSubmit}
      />
    </PrimaryLayout>
  );
};

export default ImportMnemonic;
