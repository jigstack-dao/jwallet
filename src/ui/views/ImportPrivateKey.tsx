import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWallet, useWalletRequest } from 'ui/utils';
import PrimaryLayout from '../component/Layouts/PrimaryBackground';
import Title from '../component/Title';
import { isEmpty } from 'lodash';
import InputTextArea from '../component/Inputs/InputTextArea';
import StrayButtons from '../component/Buttons/StrayButtons';
import Routes from '@/constant/routes';
import { generateAlianName } from '../utils/address';
import { replaceErrorMsg } from '@/utils/format';
import jwalletAPI from '@/background/service/jwalletAPI';

const ImportPrivateKey = () => {
  const history = useHistory();
  const wallet = useWallet();
  const { t } = useTranslation();
  const [privateKey, setPrivateKey] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  const [importedAccountsLength, setImportedAccountsLength] =
    useState<number>(0);

  const [run, loading] = useWalletRequest(wallet.importPrivateKey, {
    async onSuccess(accounts) {
      await wallet.updateAlianName(
        accounts[0]?.address.toLowerCase(),
        generateAlianName(importedAccountsLength + 1)
      );
      jwalletAPI.createWallet(accounts[0].address);

      history.replace({
        pathname: Routes.ScreenSuccess,
        state: {
          title: t('Successfully imported'),
          importedLength: 1,
        },
      });
    },
    onError(err) {
      setErrorMessage(replaceErrorMsg(err.message));
    },
  });

  const handleClickBack = () => {
    if (history.length > 1) {
      history.goBack();
    } else {
      history.replace('/');
    }
  };

  const handleSubmit = () => {
    run(privateKey);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrivateKey(e.target.value);
    wallet.setPageStateCache({
      path: history.location.pathname,
      params: {},
      states: e.target.value,
    });
    setErrorMessage(undefined);
  };

  useEffect(() => {
    const handleLoadCache = async () => {
      const cache = await wallet.getPageStateCache();
      if (cache && cache.path === history.location.pathname) {
        setPrivateKey(cache.states);
      }
    };

    void (async () => {
      const count = await wallet.getAccountsCount();
      setImportedAccountsLength(count);
      if (await wallet.hasPageStateCache()) handleLoadCache();
    })();

    return () => {
      wallet.clearPageStateCache();
    };
  }, []);

  return (
    <PrimaryLayout>
      <div className="text-center mb-[14px] mt-[25px]">
        <Title text="Import by private key" />
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
          value={privateKey}
          placeHolder={'Private key'}
          errMsg={errorMessage}
          onChange={handleChange}
        />
      </div>
      <div>
        <StrayButtons
          nextTitle="IMPORT"
          disabledNext={
            isEmpty(privateKey) || loading || errorMessage != undefined
          }
          onBack={handleClickBack}
          onNext={handleSubmit}
        />
      </div>
    </PrimaryLayout>
  );
};

export default ImportPrivateKey;
