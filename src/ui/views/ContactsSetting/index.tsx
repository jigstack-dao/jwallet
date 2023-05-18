import './style.less';
import { ReactComponent as AvatarIcon } from '@/ui/assets/jwallet/avatar.svg';
import { ReactComponent as CopyIcon } from '@/ui/assets/jwallet/copy.svg';
import { ReactComponent as EditIcon } from '@/ui/assets/jwallet/edit.svg';
import { ReactComponent as PlusIcon } from '@/ui/assets/jwallet/plusWhite.svg';
import React, { useEffect, useMemo, useState } from 'react';
import { ContactBookItem } from '@/background/service/contactBook';
import { useWallet } from '@/ui/utils';
import { shortenAddress } from '@/utils/format';
import { Modal, notification } from 'antd';
import InputText from '@/ui/component/Inputs/InputText';
import InputTextArea from '@/ui/component/Inputs/InputTextArea';
import StrayButtons from '@/ui/component/Buttons/StrayButtons';
import { ReactComponent as CloseModalIcon } from '@/ui/assets/jwallet/close-modal.svg';
import { isAddress } from 'web3-utils';
import { useCopyToClipboard } from 'react-use';
import PageContainer from '@/ui/component/PageContainer';

const ContactsSetting = () => {
  const [accountContact, setAccountContact] = useState<ContactBookItem[]>([]);
  const [mode, setMode] = useState('Create');
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState({
    name: '',
    address: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    address: '',
  });
  const [oldForm, setOldForm] = useState({
    name: '',
    address: '',
  });

  const wallet = useWallet();
  const [, copyToClipboard] = useCopyToClipboard();

  const init = async () => {
    const _accounts = await wallet.listContact();
    setAccountContact(_accounts);
  };

  useEffect(() => {
    init();
  }, []);

  const validForm = useMemo(() => {
    return (
      Object.values(form).some((x) => x.length == 0) ||
      Object.values(errors).some((x) => x.length > 0)
    );
  }, [form, errors]);

  const onCreateContact = async () => {
    await wallet.addContact({
      name: form.name,
      address: form.address,
      isAlias: true,
      isContact: true,
    });
    await init();
    closeModal();
  };

  const onEditContact = async () => {
    await wallet.updateContact({
      name: form.name,
      address: form.address,
      isAlias: true,
      isContact: true,
    });
    await init();
    closeModal();
  };

  const onDeleteContact = async () => {
    await wallet.removeContact(form.address);
    await init();
    closeModal();
  };

  const closeModal = () => {
    openModal(false, 'Create');
    setErrors({
      name: '',
      address: '',
    });
    setForm({
      name: '',
      address: '',
    });
    setOldForm({
      name: '',
      address: '',
    });
  };

  const validateNameContact = (value: string) => {
    let _accountContact = [...accountContact];
    if (mode !== 'Create') {
      _accountContact = _accountContact.filter(
        (x) => x.name.toLowerCase() !== oldForm.name.toLowerCase()
      );
    }
    if (
      _accountContact.find((x) => x.name.toLowerCase() == value.toLowerCase())
    ) {
      return 'Contact name duplicated';
    }
    return '';
  };

  const validateAddressContact = (value: string) => {
    let _accountContact = [...accountContact];
    if (mode !== 'Create') {
      _accountContact = _accountContact.filter(
        (x) => x.address.toLowerCase() !== oldForm.address.toLowerCase()
      );
    }
    if (
      _accountContact.find(
        (x) => x.address.toLowerCase() == value.toLowerCase()
      )
    ) {
      return 'The entered wallets have already been saved';
    }
    if (!isAddress(value)) {
      return 'Address entered is not supported. Please enter a valid Address.';
    }
    return '';
  };

  const onChangeName = (value: string) => {
    setForm((prev) => ({ ...prev, name: value }));
    setErrors((prev) => ({ ...prev, name: validateNameContact(value) }));
  };

  const onChangeAddress = (value: string) => {
    setForm((prev) => ({ ...prev, address: value }));
    setErrors((prev) => ({ ...prev, address: validateAddressContact(value) }));
  };

  const openModal = (_visible: boolean, _mode: string) => {
    setVisible(_visible);
    setMode(_mode);
  };

  return (
    <PageContainer title="Contacts">
      <div id="contacts-setting">
        <div>
          {accountContact.map((x) => (
            <div className="account-item" key={x.address}>
              <div className="avatar">
                <AvatarIcon />
              </div>
              <div className="info">
                <div className="info__top">{x.name}</div>
                <div className="info__bottom">
                  <div className="address">
                    {shortenAddress(x.address, 9, 9)}
                  </div>
                  <div
                    className="copy-icon hover-overlay p-1 rounded-md"
                    onClick={() => {
                      copyToClipboard(x.address);
                      notification.open({
                        message: 'Address copied',
                        className: 'notification-jwallet',
                        duration: 1,
                      });
                    }}
                  >
                    <CopyIcon />
                  </div>
                  <div
                    className="edit-icon hover-overlay p-1 rounded-md"
                    onClick={() => {
                      openModal(true, 'Edit');
                      setForm({ name: x.name, address: x.address });
                      setOldForm({ name: x.name, address: x.address });
                    }}
                  >
                    <EditIcon />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div
          className="flex justify-center font-[600] text-[14px] text-[#fff] mt-[10px] cursor-pointer hover-overlay p-2 rounded-md w-fit m-auto"
          onClick={() => openModal(true, 'Create')}
        >
          <PlusIcon className="fill-white mr-[10px]" /> Add contact
        </div>

        <Modal
          title={null}
          open={visible}
          footer={null}
          closable={false}
          width={368}
          centered
        >
          <div id="contacts-detail-modal">
            <div className="header">
              <div className="text">
                {mode == 'Create' ? 'Add Contact' : 'Edit Account'}
              </div>
              <div
                className="icon hover-overlay p-1 rounded-md hover:cursor-pointer"
                onClick={() => closeModal()}
              >
                <CloseModalIcon />
              </div>
            </div>
            <div className="content">
              <div className="name-contact">
                <InputText
                  placeHolder="Account name"
                  value={form.name}
                  onChange={(e) => onChangeName(e.target.value)}
                  errorMsg={errors.name}
                />
              </div>
              <div className="address-contact">
                <InputTextArea
                  placeHolder="Address"
                  value={form.address}
                  onChange={(e) => onChangeAddress(e.target.value)}
                  errMsg={errors.address}
                  height={85}
                />
              </div>
            </div>
            {mode == 'Create' ? (
              <StrayButtons
                backTitle="CANCEL"
                nextTitle="SAVE"
                onBack={() => closeModal()}
                disabledNext={validForm}
                onNext={() => onCreateContact()}
              />
            ) : (
              <StrayButtons
                backTitle="DELETE ACCOUNT"
                nextTitle="SAVE"
                onBack={() => onDeleteContact()}
                disabledNext={validForm}
                onNext={() => onEditContact()}
              />
            )}
          </div>
        </Modal>
      </div>
    </PageContainer>
  );
};

export default ContactsSetting;
