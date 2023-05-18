import React, { useState } from 'react';
import { ReactComponent as InfoIcon } from '@/ui/assets/jwallet/info.svg';
import { Modal } from 'antd';
import { ReactComponent as CloseModalIcon } from '@/ui/assets/jwallet/close-modal.svg';
import InputText from '@/ui/component/Inputs/InputText';
import PrimaryButton from '@/ui/component/Buttons/PrimaryButton';

const AddContactModal: React.FC<{
  visible: boolean;
  close: () => void;
  onSave: (address: string, name: string) => void;
  address: string;
}> = ({ visible, address, close, onSave }) => {
  const [name, setName] = useState('');
  return (
    <Modal
      title={null}
      open={visible}
      footer={null}
      closable={false}
      width={368}
      centered
    >
      <div id="add-contact-modal-container">
        <div className="header">
          <div className="text">Add Address</div>
          <div className="icon" onClick={close}>
            <CloseModalIcon />
          </div>
        </div>
        <div className="content">
          <div className="address">{address}</div>
          <div className="name-contact">
            <InputText
              placeHolder="Add nickname"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
        <PrimaryButton
          text="SAVE"
          onClick={() => {
            onSave(address, name);
            close();
          }}
          disabled={name.length == 0}
        />
      </div>
    </Modal>
  );
};

const AddContact: React.FC<{
  address: string;
  visible: boolean;
  onAddContact: (address: string, name: string) => void;
}> = ({ address, visible, onAddContact }) => {
  const [open, setOpen] = useState(false);
  if (!visible) return null;
  return (
    <>
      <div id="contact-container">
        <div className="detect-new-address" onClick={() => setOpen(true)}>
          <div>
            <InfoIcon />
          </div>
          <div className="text">
            There is new address detected! Click here to add to your address
            book.
          </div>
        </div>
      </div>
      <AddContactModal
        visible={open}
        address={address}
        close={() => setOpen(false)}
        onSave={onAddContact}
      />
    </>
  );
};

export default AddContact;
