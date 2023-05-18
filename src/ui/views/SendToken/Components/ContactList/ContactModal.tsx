import React, { useState } from 'react';
import { ReactComponent as AvatarIcon } from '@/ui/assets/jwallet/avatar.svg';
import { ContactBookItem } from '@/background/service/contactBook';
import { shortenAddress } from '@/utils/format';
import Drawer from '@/ui/component/Drawer';
import { ReactComponent as CloseModalIcon } from '@/ui/assets/jwallet/close-modal.svg';
import { ReactComponent as ContactIcon } from '@/ui/assets/jwallet/contact.svg';
import useAccounts from '@/hooks/wallet/useAccounts';
import clsx from 'clsx';

import './style.less';

interface PropsType {
  show: boolean;
  onClose: () => void;
  contacts: ContactBookItem[];
  onClick: (address: string) => void;
}

const ContactModal: React.FC<PropsType> = (props) => {
  const { show, onClose, contacts, onClick } = props;
  const allAccounts = useAccounts();
  const [contactTab, setContactTab] = useState(true);

  return (
    <Drawer open={show} height={459} onClose={onClose}>
      <div
        id="contact-modal"
        className="w-full h-full rounded-lg overflow-y-auto"
        style={{
          background:
            'linear-gradient(rgb(134, 109, 220) 0%, rgb(122, 80, 215) 100%)',
        }}
      >
        <div className="flex w-full justify-end pt-[11px] pr-[16px] pb-1">
          <span
            onClick={onClose}
            className="hover-overlay rounded-md p-1 hover:cursor-pointer"
          >
            <CloseModalIcon />
          </span>
        </div>
        <div className="title">
          <div className="inline-flex items-center" style={{ gap: '0.25rem' }}>
            <div className="icon">
              <ContactIcon />
            </div>
            <div className="text">Saved addresses</div>
          </div>
        </div>
        <div>
          <div className="tab p-3">
            <div
              className={clsx('tab-item', contactTab && 'active')}
              onClick={() => setContactTab(true)}
            >
              <span>Contacts</span>
            </div>
            <div
              className={clsx('tab-item', !contactTab && 'active')}
              onClick={() => setContactTab(false)}
            >
              <span>Accounts</span>
            </div>
            <div
              className="tab-indicator"
              style={{ left: `${contactTab ? 0 : 50}%` }}
            ></div>
          </div>
          {contactTab ? (
            <div className="max-h-[250px] overflow-y-auto flex flex-col gap-2.5 p-3">
              {contacts.map((x) => (
                <div
                  className="account-item flex cursor-pointer gap-3 p-3 rounded-xl border-white border hover:bg-violet-700 hover:border-violet-700 transition-all"
                  key={x.address}
                  onClick={() => {
                    onClick(x.address);
                    onClose();
                  }}
                >
                  <div className="avatar">
                    <AvatarIcon />
                  </div>

                  <div className="info">
                    <div className="name">{x.name}</div>

                    <div className="address">
                      {shortenAddress(x.address, 9, 9)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-h-[250px] overflow-y-auto flex flex-col gap-2.5 p-3">
              {allAccounts.map((x) => (
                <div
                  className="account-item flex cursor-pointer gap-3 p-3 rounded-xl border-white border hover:bg-violet-700 hover:border-violet-700 transition-all"
                  key={x.address}
                  onClick={() => {
                    onClick(x.address);
                    onClose();
                  }}
                >
                  <div className="avatar">
                    <AvatarIcon />
                  </div>

                  <div className="info">
                    <div className="name">{x.alianName}</div>

                    <div className="address">
                      {shortenAddress(x.address, 9, 9)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default ContactModal;
