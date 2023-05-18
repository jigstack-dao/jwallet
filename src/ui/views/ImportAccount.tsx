import { ReactComponent as KeyIcon } from '@/ui/assets/jwallet/key.svg';
import { ReactComponent as FileIcon } from '@/ui/assets/jwallet/file.svg';
import { ReactComponent as FolderIcon } from '@/ui/assets/jwallet/folder.svg';
import { ReactComponent as HardwareWalletIcon } from '@/ui/assets/jwallet/hardware-wallet.svg';
import { ReactComponent as IconQR } from '@/ui/assets/jwallet/icon-connect/QR.svg';
import { ReactComponent as Back } from '@/ui/assets/jwallet/arrow-left.svg';
import PrimaryLayout from '../component/Layouts/PrimaryBackground';
import Routes from '@/constant/routes';
import { useHistory } from 'react-router-dom';
import React, { useCallback } from 'react';
import clsx from 'clsx';

const arr = [
  {
    icon: <KeyIcon />,
    name: 'Import by private key',
    to: Routes.ImportPrivateKey,
    active: true,
  },
  {
    icon: <FileIcon />,
    name: 'Import by recovery phrase',
    to: Routes.ImportMnemonics,
    active: true,
  },
  {
    icon: <FolderIcon />,
    name: 'Import by keystore file',
    to: Routes.ImportJson,
    active: true,
  },
  {
    icon: <HardwareWalletIcon />,
    name: 'Connect a hardware wallet',
    to: '',
    active: false,
  },
  {
    icon: <IconQR />,
    name: 'Connect with QR-code',
    to: Routes.ImportQRCode,
    active: true,
  },
];

const ImportAccount = () => {
  const history = useHistory();

  const redirect = (link: string) => {
    history.push(link);
  };

  const goBack = useCallback(() => {
    history.replace('/');
  }, []);

  return (
    <PrimaryLayout>
      <div className="relative">
        <Back
          onClick={goBack}
          className="absolute left-0 hover:cursor-pointer hover-overlay rounded-md"
        />
        <div className="mt-[25px] font-GilroyExtraBold text-22 mb-[32px] w-full text-center">
          Import account
        </div>
      </div>

      <div>
        {arr.map((x) => (
          <div
            key={x.name}
            className={clsx(
              'flex items-center h-[74px] mb-[24px] px-5 rounded-2xl',
              !x.active ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            )}
            style={{
              background:
                'linear-gradient(154.64deg, rgba(255, 255, 255, 0.35) 6.18%, rgba(255, 255, 255, 0.09) 93.39%)',
            }}
            onClick={() => x.active && redirect(x.to)}
          >
            <div className="mr-3">{x.icon}</div>
            <div className="text-14 font-GilroyExtraBold">{x.name}</div>
          </div>
        ))}
      </div>
    </PrimaryLayout>
  );
};

export default ImportAccount;
