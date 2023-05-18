import ConnectButton from '@/ui/component/Buttons/ConnectButton';
import React, { useCallback } from 'react';
import PrimaryLayout from '../../component/Layouts/PrimaryBackground';
import Title from '../../component/Title';
import { ReactComponent as IconQR } from '@/ui/assets/jwallet/icon-connect/QR.svg';
import { ReactComponent as IconFile } from '@/ui/assets/jwallet/icon-connect/file.svg';
import { ReactComponent as IconKey } from '@/ui/assets/jwallet/icon-connect/key.svg';
import { ReactComponent as IconFolders } from '@/ui/assets/jwallet/icon-connect/folder.svg';
import { ReactComponent as IconWallet } from '@/ui/assets/jwallet/icon-connect/hardware-wallet.svg';
import { ReactComponent as Back } from '@/ui/assets/jwallet/arrow-left.svg';
import { useHistory } from 'react-router-dom';
import Routes from '@/constant/routes';

const listOption = [
  {
    text: 'Import by private key',
    Icon: <IconKey className="mr-[25px]" />,
    url: Routes.ImportPrivateKey,
    active: true,
  },
  {
    text: 'Import by recovery phrase',
    Icon: <IconFile className="mr-[25px]" />,
    url: Routes.ImportMnemonics,
    active: true,
  },
  {
    text: 'Import by keystore file',
    Icon: <IconFolders className="mr-[25px]" />,
    url: Routes.ImportJson,
    active: true,
  },
  {
    text: 'Connect a hardware wallet',
    Icon: <IconWallet className="mr-[25px]" />,
    url: Routes.CommingSoon,
    active: false,
  },
  {
    text: 'Connect with QR-code',
    Icon: <IconQR className="mr-[25px]" />,
    url: Routes.ImportQRCode,
    active: true,
  },
];

export default function ConnectWallet() {
  const history = useHistory();
  const goBack = useCallback(() => {
    history.replace(Routes.NoAddress);
  }, []);

  return (
    <PrimaryLayout>
      <div className="relative text-center mb-[32px] mt-[25px]">
        <Back
          onClick={goBack}
          className="absolute left-0 hover:cursor-pointer"
        />
        <Title text="Access existing wallet" />
      </div>
      {listOption.map((item, idx) => (
        <ConnectButton
          key={idx}
          text={item.text}
          Icon={item.Icon}
          onClick={() => history.push(item.url)}
          disabled={!item.active}
        />
      ))}
    </PrimaryLayout>
  );
}
