import ThreeDot from '@/ui/assets/jwallet/3-dot.svg';
import React, { useState } from 'react';
import AccountInfo from './AccountInfo';
import PrivateKeyExport from './PrivateKeyExport';
import './style.less';

export const MoreButton = () => {
  const [openInfoDrawer, setOpenInfoDrawer] = useState(false);
  const [openPrvKeyDrawer, setOpenPrvKeyDrawer] = useState(false);

  return (
    <>
      <button
        className="mr-2 more-btn"
        onClick={() => {
          setOpenInfoDrawer(true);
        }}
      >
        <img src={ThreeDot} alt="" />
      </button>
      <AccountInfo
        onClose={() => {
          setOpenInfoDrawer(false);
        }}
        openExport={() => {
          setOpenInfoDrawer(false);
          setOpenPrvKeyDrawer(true);
        }}
        show={openInfoDrawer}
      />
      {openPrvKeyDrawer && (
        <PrivateKeyExport
          onClose={() => {
            setOpenPrvKeyDrawer(false);
          }}
          onBack={() => {
            setOpenPrvKeyDrawer(false);
            setOpenInfoDrawer(true);
          }}
          show={openPrvKeyDrawer}
        />
      )}
    </>
  );
};
