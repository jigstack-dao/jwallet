import React, { useState } from 'react';
import { ReactComponent as ContactIcon } from '@/ui/assets/jwallet/contact.svg';
import { ContactBookItem } from '@/background/service/contactBook';
import ContactModal from './ContactModal';
import { ReactComponent as PlusIcon } from '@/ui/assets/jwallet/plusWhite.svg';

const ContactList: React.FC<{
  accounts: ContactBookItem[];
  onClick: (address: string) => void;
}> = ({ accounts, onClick }) => {
  const [openContactModal, setOpenContactModal] = useState(false);

  return (
    <div id="contact-list-container">
      <div className="top-line"></div>
      <div className="header hover-overlay rounded-lg w-fit p-2">
        <div
          className="flex cursor-pointer"
          onClick={() => setOpenContactModal(true)}
        >
          <div className="icon">
            <PlusIcon />
          </div>
          <div className="icon">
            <ContactIcon />
          </div>
          <div className="text">Saved addresses</div>
        </div>
      </div>
      <ContactModal
        show={openContactModal}
        onClose={() => setOpenContactModal(false)}
        contacts={accounts}
        onClick={onClick}
      />
    </div>
  );
};

export default ContactList;
