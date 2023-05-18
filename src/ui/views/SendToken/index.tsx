import React, { useState, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { ethers } from 'ethers';
import { ContactBookItem } from 'background/service/contactBook';
import { useWallet } from 'ui/utils';
import './style.less';
import { ReactComponent as ArrowLeft } from '@/ui/assets/jwallet/arrow-left.svg';
import Routes from '@/constant/routes';
import SendStep from './Components/SendStep';
import GasFeeStep from './Components/GasFeeStep';
import PrimaryButton from '@/ui/component/Buttons/PrimaryButton';
import StrayButtons from '@/ui/component/Buttons/StrayButtons';
import useNetwork from '@/hooks/wallet/useNetwork';
import useCurrentAccount from '@/hooks/wallet/useCurrentAccount';
import useSendTransaction, { StepKeys } from '@/hooks/forms/useSendTransaction';
import AddContact from './Components/AddContact';
import ContactList from './Components/ContactList';
import { KEYRING_TYPE } from '@/constant';
import useFiatNativeCurrency from '@/hooks/wallet/useFiatNativeCurrency';
import useAccounts from '@/hooks/wallet/useAccounts';

const SendToken = () => {
  const wallet = useWallet();
  const history = useHistory();
  const [accountContact, setAccountContact] = useState<ContactBookItem[]>([]);
  const { currentNetwork } = useNetwork();
  const currentAccount = useCurrentAccount();
  const {
    amount,
    addressReceiver,
    errorReceiver,
    steps,
    gasLimit,
    gasPrice,
    nonce,
    setNonce,
    errorAmount,
    errorGasLimit,
    errorGasPrice,
    canSubmit,
    hexData,
    canNextStep,
    token,
    balance,
    canEditHexData,
    changeAmount,
    changeAddressReceiver,
    setSteps,
    reloadAllState,
    onSendTransaction,
    onGasLimitChange,
    onGasPriceChange,
    onChangeHexData,
    handleClickMax,
    changeGasFeeString,
    setToken,
  } = useSendTransaction();
  const allAccounts = useAccounts();

  const fiatCurrency = useFiatNativeCurrency(balance);
  useEffect(() => {
    reloadAllState();
  }, [currentAccount, currentNetwork]);

  const onBack = () => {
    history.push(Routes.Dashboard);
  };

  const renderButton = useMemo(() => {
    const isWatchAddress =
      currentAccount.type == KEYRING_TYPE.WatchAddressKeyring;
    if (steps == StepKeys.Send) {
      return (
        <>
          <PrimaryButton
            onClick={() => setSteps(StepKeys.GasFee)}
            text="Next"
            disabled={!canNextStep || isWatchAddress}
          />
          {isWatchAddress && (
            <span className="text-14 text-[#FFA877]">
              The current address is in Watch Mode. . If your want to continue,
              please import it again using another mode.
            </span>
          )}
        </>
      );
    }
    return (
      <div className="mt-[50px]">
        <StrayButtons
          nextTitle="CONFIRM"
          onBack={onBack}
          onNext={onSendTransaction}
          disabledNext={!canSubmit}
        />
      </div>
    );
  }, [steps, canNextStep, canSubmit, currentAccount, onSendTransaction]);

  const handleAddContact = async (address: string, name: string) => {
    await wallet.addContact({
      name,
      address,
      isAlias: true,
      isContact: true,
    });
    const _accounts = await wallet.listContact();
    setAccountContact(_accounts);
  };

  const canAddContact = useMemo(() => {
    return (
      ethers.utils.isAddress(addressReceiver) &&
      [...accountContact, ...allAccounts].find(
        (x) => x.address == addressReceiver
      ) == undefined &&
      steps == StepKeys.Send
    );
  }, [accountContact, addressReceiver, steps, allAccounts]);

  useEffect(() => {
    const init = async () => {
      const _accounts = await wallet.listContact();
      setAccountContact(_accounts);
    };
    init();
  }, []);

  return (
    <div id="send-token-container">
      <div className="title">
        <div onClick={onBack} className="back hover-overlay rounded-lg">
          <ArrowLeft />
        </div>
        <div className="text">Send</div>
      </div>
      <div className="content">
        <SendStep
          balance={balance}
          fiat={fiatCurrency}
          amount={amount}
          addressReceiver={addressReceiver}
          errorAmount={errorAmount}
          errorReceiver={errorReceiver}
          changeAmount={changeAmount}
          changeAddressReceiver={changeAddressReceiver}
          clickMax={handleClickMax}
          setToken={setToken}
          token={token}
        />
        <AddContact
          address={addressReceiver}
          visible={canAddContact}
          onAddContact={handleAddContact}
        />
        {steps == StepKeys.Send && (
          <ContactList
            accounts={accountContact}
            onClick={(address) => changeAddressReceiver(address)}
          />
        )}
        {steps == StepKeys.GasFee && (
          <GasFeeStep
            gasLimit={gasLimit}
            gasPrice={gasPrice}
            nonce={nonce}
            setNonce={setNonce}
            hexData={hexData}
            canEditHexData={canEditHexData}
            errorGasLimit={errorGasLimit}
            errorGasPrice={errorGasPrice}
            onGasLimitChange={onGasLimitChange}
            onGasPriceChange={onGasPriceChange}
            onChangeHexData={onChangeHexData}
            changeGasFeeString={changeGasFeeString}
          />
        )}
      </div>
      {renderButton}
    </div>
  );
};

export default SendToken;
