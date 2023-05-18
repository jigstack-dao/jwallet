import React, { useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import QRCode from 'qrcode.react';
import { Input, message } from 'antd';
import { useHover } from 'ui/utils';
import { useCopyToClipboard } from 'react-use';
import WalletConnectBridgeModal from './WalletConnectBridgeModal';
import { ReactComponent as ReloadIcon } from '@/ui/assets/jwallet/reload.svg';
import { ReactComponent as CopyIcon } from '@/ui/assets/jwallet/copy.svg';
import IconSuccess from 'ui/assets/success.svg';
import IconBridgeChange from 'ui/assets/bridgechange.svg';
import IconQRCodeRefresh from 'ui/assets/qrcoderefresh.svg';

interface Props {
  showURL: boolean;
  changeShowURL: (active: boolean) => void;
  refreshFun: () => void;
  qrcodeURL: string;
  onBridgeChange: (val: string) => void;
  bridgeURL: string;
  defaultBridge: string;
  canChangeBridge?: boolean;
}
const ScanCopyQRCode: React.FC<Props> = ({
  showURL = false,
  changeShowURL,
  qrcodeURL,
  refreshFun,
  onBridgeChange,
  bridgeURL,
  defaultBridge,
  canChangeBridge = true,
}) => {
  const [isHovering, hoverProps] = useHover();
  const { t } = useTranslation();
  const [copySuccess, setCopySuccess] = useState(false);
  const [showOpenApiModal, setShowOpenApiModal] = useState(false);
  const [, copyToClipboard] = useCopyToClipboard();

  const handleCopyURI = () => {
    copyToClipboard(qrcodeURL);
    setCopySuccess(true);
    message.success({
      icon: <img src={IconSuccess} className="icon icon-success" />,
      content: t('Copied'),
      duration: 0.5,
    });
  };

  const onRefresh = () => {
    refreshFun();
    setCopySuccess(false);
  };

  const handleBridgeServerChange = (val: string) => {
    onBridgeChange(val);
    setShowOpenApiModal(false);
  };

  return (
    <div>
      <div className="button-container">
        <div
          className={clsx('cursor-pointer', { active: !showURL })}
          onClick={() => changeShowURL(false)}
        >
          {t('QR code')}
        </div>
        <div
          className={clsx('cursor-pointer', { active: showURL })}
          onClick={() => changeShowURL(true)}
        >
          {t('URL')}
        </div>
      </div>
      {!showURL && (
        <div className="qrcode cursor-pointer" {...hoverProps}>
          <QRCode value={qrcodeURL} size={170} />
          {isHovering && (
            <div className="refresh-container">
              <div className="refresh-wrapper">
                <img
                  className="qrcode-refresh"
                  src={IconQRCodeRefresh}
                  onClick={onRefresh}
                />
              </div>
            </div>
          )}
        </div>
      )}
      {showURL && (
        <div className="url-container mx-auto w-[336px] mt-0 mb-4">
          <Input.TextArea
            className="h-[200px] w-[336px] p-4 block border-none rounded-[12px]"
            spellCheck={false}
            value={qrcodeURL}
            disabled={true}
          />
          <ReloadIcon
            onClick={onRefresh}
            className="icon-refresh-wallet cursor-pointer"
          />
          <CopyIcon
            onClick={handleCopyURI}
            className={clsx('icon-copy-wallet cursor-pointer', {
              success: copySuccess,
            })}
          />
        </div>
      )}
      {canChangeBridge && (
        <div
          className="change-bridge"
          onClick={() => setShowOpenApiModal(true)}
        >
          <img src={IconBridgeChange} />
          {t('Change bridge server')}
        </div>
      )}
      <WalletConnectBridgeModal
        defaultValue={defaultBridge}
        value={bridgeURL}
        visible={showOpenApiModal}
        onChange={handleBridgeServerChange}
        onCancel={() => setShowOpenApiModal(false)}
      />
    </div>
  );
};
export default ScanCopyQRCode;
