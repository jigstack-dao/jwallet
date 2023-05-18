import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWallet, useWalletRequest } from 'ui/utils';
import PrimaryLayout from '../component/Layouts/PrimaryBackground';
import Title from '../component/Title';
import InputPassword from '../component/Inputs/InputPassword';
import StrayButtons from '../component/Buttons/StrayButtons';
import useConfirmPassword from '@/hooks/forms/useConfirmPassword';
import Routes from '@/constant/routes';
import { generateAlianName } from '../utils/address';
import { replaceErrorMsg } from '@/utils/format';
import CloudUpload from '../assets/jwallet/carbon-cloud-upload.svg';
import JsonUploaded from '../assets/jwallet/json-uploaded.svg';
import CloseIcon from '../assets/jwallet/close.svg';
import clsx from 'clsx';
import jwalletAPI from '@/background/service/jwalletAPI';

const ExpectedFile = 'application/JSON';
enum UPLOADER_STATE {
  INITIAL,
  SELECTED,
}
const ImportJson = () => {
  const history = useHistory();
  const { password, errMsg, handleChangePassword, setPassword } =
    useConfirmPassword();
  const wallet = useWallet();
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [isUpload, setUpload] = useState(false);
  const [jsonData, setJsonData] = useState<any>(undefined);
  const [errorFile, setErrorFile] = useState<string | undefined>(undefined);
  const [filename, setFilename] = useState<string>('');
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UPLOADER_STATE>(
    UPLOADER_STATE.INITIAL
  );
  const [run] = useWalletRequest(wallet.importJson, {
    async onSuccess(accounts) {
      const count = await wallet.getAccountsCount();
      await wallet.updateAlianName(
        accounts[0].address,
        generateAlianName(count)
      );
      jwalletAPI.createWallet(accounts[0].address);
      history.replace({
        pathname: Routes.ScreenSuccess,
        state: {
          title: t('Successfully created'),
          importedLength: 1,
        },
      });
      setIsSubmiting(false);
    },
    onError(err) {
      setErrorFile(replaceErrorMsg(err.message));
      setIsSubmiting(false);
    },
  });

  const onImport = async () => {
    setIsSubmiting(true);
    run(jsonData, password);
  };

  const handleClickBack = () => {
    if (history.length > 1) {
      history.goBack();
    } else {
      history.replace('/');
    }
  };

  const handleFileChange = async (file: File | undefined) => {
    let _base64File: any;
    let _filename = '';
    if (file) {
      _base64File = await toBase64(file);
      _filename = file.name;
      setErrorFile(
        file.type.toLowerCase() == ExpectedFile.toLowerCase()
          ? undefined
          : 'The file type is incorrect. Choose a Json file'
      );
      setUpload(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        setJsonData(e.target?.result);
      };
      reader.readAsText(file);
    } else {
      setUpload(false);
      setErrorFile(undefined);
    }

    setFilename(_filename);
    updateCache({ base64File: _base64File, filename: _filename });
  };

  const updateCache = async (newState: Record<string, any>) => {
    const cache = await wallet.getPageStateCache();
    wallet.setPageStateCache({
      path: history.location.pathname,
      params: {},
      states: { ...cache?.states, ...newState },
    });
  };

  function dataURLtoFile(dataurl, fname) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], fname, { type: mime });
  }

  useEffect(() => {
    const handleLoadCache = async () => {
      const cache = await wallet.getPageStateCache();
      if (cache && cache.path === history.location.pathname) {
        if (cache.states?.password) {
          setPassword(cache.states.password);
        }
        if (cache.states?.base64File && cache.states?.filename) {
          handleFileChange(
            dataURLtoFile(cache.states?.base64File, cache.states?.filename)
          );
          setFilename(cache.states?.filename);
          setUploadState(UPLOADER_STATE.SELECTED);
        }
      }
    };

    void (async () => {
      if (await wallet.hasPageStateCache()) handleLoadCache();
    })();

    return () => {
      wallet.clearPageStateCache();
    };
  }, []);

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(undefined);
      }
      return undefined;
    });

  const handleClick = () => {
    if (!inputRef.current) {
      return;
    }

    inputRef.current.click();
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!files) {
      return;
    }

    handleFileChange(files[0]);
    setFilename(files[0]?.name);
    setUploadState(UPLOADER_STATE.SELECTED);
  };

  const handleRemove = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    handleFileChange(undefined);
    setFilename('');
    setUploadState(UPLOADER_STATE.INITIAL);
  };

  return (
    <PrimaryLayout>
      <div className="mt-[25px]">
        <Title text="Import by keystore file" />
      </div>
      <div className="mt-[14px] text-center mb-[14px] text-14 opacity-60">
        <p>
          Select the keystore file you want to import and enter the
          corresponding password
        </p>
      </div>
      <div
        className={clsx(
          'w-full min-h-[194px] rounded-xl border-[1px] flex justify-center items-center',
          uploadState == UPLOADER_STATE.INITIAL
            ? 'border-dashed'
            : 'border-solid',
          errorFile != undefined ? 'border-orange' : 'border-[#B7B2DB]'
        )}
        style={{
          background: 'transparent',
        }}
        onClick={handleClick}
      >
        <input
          type="file"
          accept={ExpectedFile}
          onChange={handleOnChange}
          onClick={(e) => e.stopPropagation()}
          className="hidden"
          ref={inputRef}
        />
        {uploadState === UPLOADER_STATE.INITIAL && (
          <div className="text-center w-full">
            <img
              src={CloudUpload}
              width={36}
              height={29}
              className="block mx-auto mb-[10px] cursor-pointer"
            />
            <div>{t('Select a JSON file')}</div>
          </div>
        )}
        {uploadState === UPLOADER_STATE.SELECTED && (
          <div className="text-center w-full flex justify-center flex-col">
            <div
              className="w-[60px] h-[65px] relative rounded-lg mb-[20px] block m-auto"
              style={{
                background:
                  'linear-gradient(154.64deg, rgba(255, 255, 255, 0.35) 6.18%, rgba(255, 255, 255, 0.09) 93.39%)',
              }}
            >
              <img
                src={JsonUploaded}
                alt=""
                className="absolute m-auto left-0 right-0 top-0 bottom-0"
              />
              <img
                src={CloseIcon}
                alt=""
                className="absolute right-[-5px] top-[-5px] cursor-pointer"
                onClick={handleRemove}
              />
            </div>
            <div className="overflow-ellipsis overflow-hidden whitespace-nowrap max-w-[80%] mx-auto">
              {filename}
            </div>
          </div>
        )}
      </div>
      {errorFile && <span className="text-orange">{errorFile}</span>}
      <div className="mt-[12px]" style={{ height: 130 }}>
        <InputPassword
          placeHolder="Password"
          value={password}
          errorMsg={errMsg}
          onChange={(e) =>
            handleChangePassword(e, () => {
              setErrorFile(undefined);
              updateCache({ password: e.target.value });
            })
          }
        />
      </div>
      <StrayButtons
        disabledNext={
          errMsg != undefined ||
          password.length == 0 ||
          !isUpload ||
          errorFile != undefined ||
          isSubmiting
        }
        nextTitle={isSubmiting ? 'IMPORTING...' : 'IMPORT'}
        onNext={onImport}
        onBack={handleClickBack}
      />
    </PrimaryLayout>
  );
};

export default ImportJson;
