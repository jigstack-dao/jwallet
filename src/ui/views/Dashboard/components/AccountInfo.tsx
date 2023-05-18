import React, { FC, useState } from 'react';
import { message } from 'antd';
import { ReactComponent as CloseModalIcon } from '@/ui/assets/jwallet/close-modal.svg';
import { ReactComponent as CopyIcon } from '@/ui/assets/jwallet/copy.svg';
import { ReactComponent as UploadIcon } from '@/ui/assets/jwallet/upload.svg';
import { ReactComponent as ExplorerIcon } from '@/ui/assets/jwallet/external-link.svg';
import { ReactComponent as TrashIcon } from '@/ui/assets/jwallet/trash.svg';
import Drawer from '@/ui/component/Drawer';
import QRCode from 'qrcode.react';
import EditAccount from './EditAccount';
import useCurrentAccount from '@/hooks/wallet/useCurrentAccount';
import { useApproval, useWallet } from '@/ui/utils';
import { ActionTypes, RefreshUseHooks } from '@/context/actions';
import { useAppContext } from '@/context';
import { useCopyToClipboard } from 'react-use';
import { useTranslation } from 'react-i18next';
import useNetwork from '@/hooks/wallet/useNetwork';
import ConnectSites from './ConnectSites';
import Tooltip from 'antd/es/tooltip';
import { shortenAddress } from '@/utils/format';
import PasswordModal from './PasswordModal';

interface PropsType {
  show: boolean;
  onClose: () => void;
  openExport: () => void;
}

const AccountInfo: FC<PropsType> = (props) => {
  const { show, onClose, openExport } = props;

  const currentAccount = useCurrentAccount();
  const [, resolveApproval, rejectApproval] = useApproval();
  const wallet = useWallet();
  const { currentNetwork } = useNetwork();
  const { dispatch } = useAppContext();
  const { t } = useTranslation();
  const [, copyToClipboard] = useCopyToClipboard();
  const [openConfirmDeleteModal, setOpenConfirmDeleteModal] = useState(false);

  const handleClose = () => {
    onClose();
  };

  const handleCopyCurrentAddress = () => {
    copyToClipboard(currentAccount.address);
    message.success({
      content: t('Copied'),
      duration: 0.5,
      className: 'refresh-toast rectangle-toast',
    });
  };

  const handleEditAccount = async (value: string) => {
    await wallet.updateAlianName(currentAccount.address, value);
    dispatch({
      type: ActionTypes.UpdateRefreshUseHooks,
      payload: [
        RefreshUseHooks.Wallet_CurrentAccount,
        RefreshUseHooks.Wallet_Accounts,
      ],
    });
  };

  const handleDeleteAccount = async () => {
    const { address, type, brandName } = currentAccount;
    try {
      await wallet.removeAddress(address, type, brandName);
      message.success({
        content: t(`Deleted ${shortenAddress(address)}`),
        duration: 0.5,
        className: 'refresh-toast rectangle-toast',
      });
      resolveApproval();
    } catch (error) {
      message.error({
        content: t(`Failed to deleted ${shortenAddress(address)}`),
        duration: 0.5,
        className: 'refresh-toast rectangle-toast',
      });
      rejectApproval();
    }
  };

  const text = [
    'Export Private Key ',
    'Copy Address',
    'Block Explorer',
    'Delete Account',
  ];
  return (
    <>
      <Drawer open={show} height={459} onClose={handleClose}>
        <div
          className="w-full h-full rounded-t-lg"
          style={{
            background: 'linear-gradient(180deg, #866DDC 0%, #7A50D7 100%)',
            overflow: 'scroll',
          }}
        >
          <div className="flex w-full justify-end pt-[11px] pr-[16px] pb-1">
            <span
              onClick={handleClose}
              className="hover:cursor-pointer hover-overlay p-1 rounded-md"
            >
              <CloseModalIcon />
            </span>
          </div>
          <div className="flex justify-between items-center w-full px-[30px]">
            <div className="max-w-[194px]">
              <EditAccount
                value={currentAccount.alianName}
                onSave={handleEditAccount}
              />
              <div className="text-[#E1DFF0] font-[400] text-[14px] leading-[20px] w-full block break-all my-[14px]">
                {currentAccount.address}
              </div>
              <div className="flex justify-between">
                <div className="flex">
                  <Tooltip
                    placement="top"
                    title={text[0]}
                    overlayClassName="desc-button text-xs"
                  >
                    <span
                      className="mr-[5px] hover:cursor-pointer hover-overlay h-6 w-6 p-[3px] rounded-md"
                      onClick={openExport}
                    >
                      <UploadIcon />
                    </span>
                  </Tooltip>
                  <Tooltip
                    placement="top"
                    title={text[1]}
                    overlayClassName="desc-button text-xs"
                  >
                    <span
                      className="mr-[5px] hover:cursor-pointer hover-overlay h-6 w-6 p-[3px] rounded-md"
                      onClick={handleCopyCurrentAddress}
                    >
                      <CopyIcon />
                    </span>
                  </Tooltip>
                  {currentNetwork.scanLink && (
                    <a
                      href={
                        currentNetwork.scanLink +
                        '/address/' +
                        currentAccount.address
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="mr-[5px] hover:cursor-pointer hover-overlay h-6 w-6 p-[3px] rounded-md"
                    >
                      <Tooltip
                        placement="top"
                        title={text[2]}
                        overlayClassName="desc-button text-xs"
                      >
                        <ExplorerIcon />
                      </Tooltip>
                    </a>
                  )}
                </div>
                <Tooltip
                  placement="top"
                  title={text[3]}
                  overlayClassName="desc-button text-xs"
                >
                  <span
                    className="mr-[5px] hover:cursor-pointer hover-overlay h-6 w-6 p-[3px] rounded-md"
                    onClick={() => setOpenConfirmDeleteModal((old) => !old)}
                  >
                    <TrashIcon />
                  </span>
                </Tooltip>
              </div>
            </div>
            <div className="">
              <div className="w-[95px] h-[95px] p-[12px] border-[1px] border-[rgba(255, 255, 255, 0.3)] rounded-[12px]">
                <QRCode value={currentAccount.address} size={70} />
              </div>
            </div>
          </div>
          <div className="w-full flex justify-center">
            <div
              className="w-[340px] h-[1px] mt-5 mb-[30px]"
              style={{ background: 'rgba(255, 255, 255, 0.3)' }}
            ></div>
          </div>
          <div className="px-[10px]">
            <ConnectSites />
          </div>
        </div>
      </Drawer>
      {openConfirmDeleteModal && (
        <PasswordModal
          open={openConfirmDeleteModal}
          title="Delete password"
          onSuccess={handleDeleteAccount}
          onClose={() => setOpenConfirmDeleteModal(false)}
        />
      )}
    </>
  );
};

export default AccountInfo;
