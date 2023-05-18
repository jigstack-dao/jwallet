import { useAppContext } from '@/context';
import { ActionTypes, RefreshUseHooks } from '@/context/actions';
import { useWallet } from '@/ui/utils';
import { generateAlianName } from '@/ui/utils/address';
import { Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import StrayButtons from '../Buttons/StrayButtons';
import InputText from '../Inputs/InputText';
import { ReactComponent as CloseModalIcon } from '@/ui/assets/jwallet/close-modal.svg';
import { useHistory } from 'react-router-dom';
import Routes from '@/constant/routes';

const CreateAccountModal = ({ open }) => {
  const [name, setName] = useState('');
  const [err, setErr] = useState<string | undefined>(undefined);
  const [alianNames, setAlianNames] = useState<string[]>([]);
  const { dispatch } = useAppContext();
  const wallet = useWallet();
  const history = useHistory();
  useEffect(() => {
    void (async () => {
      const alianNames = await wallet.getAllAlianName();
      setAlianNames(alianNames.map((x) => x.name));
    })();
  }, []);

  const addAddress = async () => {
    const count = await wallet.getAccountsCount();
    const isExistMnemonic = await wallet.isExportSeed();
    if (!isExistMnemonic) {
      history.push({
        pathname: Routes.CreateMnemonics,
        state: {
          alianName: name,
        },
      });
    } else {
      const address = await wallet.deriveNewAccountFromMnemonic();

      if (address && address.length > 0) {
        await wallet.updateAlianName(
          address[0]?.toLowerCase(),
          name || generateAlianName(count + 1)
        );
      }
    }

    dispatch({
      type: ActionTypes.UpdateRefreshUseHooks,
      payload: [
        RefreshUseHooks.Wallet_Accounts,
        RefreshUseHooks.Wallet_CurrentAccount,
      ],
    });

    close();
    setName('');
  };

  const handleChange = (value: string) => {
    setName(value);
    const isExists = alianNames.find(
      (x) => x.toLowerCase() == value.toLowerCase()
    );
    setErr(isExists ? 'This account name already exists' : undefined);
  };

  const close = () => {
    dispatch({
      type: ActionTypes.UpdateIsOpenModalCreateAccount,
      payload: false,
    });
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
      <div className="px-4 py-6 relative">
        <div
          className="w-fit flex justify-end cursor-pointer hover-overlay p-1 rounded-md absolute right-4"
          onClick={close}
        >
          <CloseModalIcon />
        </div>
        <div className="font-GilroyExtraBold text-18 text-white text-center w-full mb-[28px]">
          Create Account
        </div>
        <div className="mb-[60px]">
          <InputText
            placeHolder="Account name"
            value={name}
            onChange={(e) => handleChange(e.target.value)}
            errorMsg={err}
          />
        </div>
        <StrayButtons
          backTitle="CANCEL"
          nextTitle="SAVE"
          onNext={() => addAddress()}
          disabledNext={err != undefined}
          onBack={close}
        />
      </div>
    </Modal>
  );
};

export default CreateAccountModal;
