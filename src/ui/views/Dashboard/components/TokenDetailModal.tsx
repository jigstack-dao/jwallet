import React, { FC, useMemo } from 'react';
import { Modal, message } from 'antd';
import { TokenSaved } from '@/background/service/permission';
import useNetwork from '@/hooks/wallet/useNetwork';
import { getNetworkInfo } from '@/constant/networks';
import PrimaryButton from '@/ui/component/Buttons/PrimaryButton';
import { useCopyToClipboard } from 'react-use';
import { shortenAddress } from '@/utils/format';
import { ReactComponent as Scan } from '@/ui/assets/jwallet/resize-link.svg';
import { ReactComponent as Copy } from '@/ui/assets/jwallet/copy.svg';
import { ReactComponent as CloseModalIcon } from '@/ui/assets/jwallet/close-modal.svg';
import IconSuccess from 'ui/assets/success.svg';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import Routes from '@/constant/routes';
import { useWallet } from '@/ui/utils';
import { AddressZero } from '@/constant';

interface IProps {
  onClose: () => void;
  token: TokenSaved;
}

export const TokenDetailModal: FC<IProps> = (props) => {
  const { onClose, token } = props;
  const { currentNetwork } = useNetwork();
  const [, copy] = useCopyToClipboard();
  const { t } = useTranslation();
  const history = useHistory();
  const wallet = useWallet();
  const networkInfo = useMemo(
    () => getNetworkInfo(currentNetwork.chainId),
    [currentNetwork.chainId]
  );

  const isNative = AddressZero === token.address;
  const scanLink =
    currentNetwork.scanLink &&
    `${currentNetwork.scanLink}/token/${token.address}`.replace(
      /([^:]\/)\/+/g,
      '$1'
    );

  const copyAddress = () => {
    copy(token.address);
    message.success({
      icon: <img src={IconSuccess} className="icon icon-success" />,
      content: t('Copied'),
      duration: 0.5,
    });
  };

  const send = () => {
    if (isNative) {
      history.push({
        pathname: Routes.SendToken,
      });
    } else {
      history.push({
        pathname: Routes.SendToken,
        state: { token },
      });
    }
  };

  const remove = async () => {
    await wallet.removeToken(token);
    message.success({
      icon: <img src={IconSuccess} className="icon icon-success" />,
      content: `Hide ${token.symbol} successfully`,
      duration: 0.5,
    });
    history.replace('/');
  };

  return (
    <Modal
      title={null}
      open={true}
      footer={null}
      closable={false}
      width={368}
      centered
    >
      <div id="tx-detail-modal" className="text-white">
        <div
          className="w-full flex justify-end cursor-pointer"
          onClick={onClose}
        >
          <CloseModalIcon />
        </div>
        <div className="font-GilroyExtraBold text-18 text-white text-center w-full -mt-[5px]">
          Token Info
        </div>
        <div className="flex items-center justify-center my-4">
          {token.img && (
            <div className="mr-1 w-8 h-8 rounded-full overflow-hidden">
              <img
                src={token.img}
                alt=""
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <span className="text-18 font-GilroyExtraBold">{token.name}</span>
        </div>
        {!isNative && (
          <>
            {scanLink ? (
              <div className="py-2">
                <div className="text-16 font-GilroyExtraBold">
                  Token contract
                </div>
                <div className="flex items-center">
                  <a
                    href={scanLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-12 flex hover:underline hover:text-white items-center"
                  >
                    <span className="mr-0.5 p-0.5 w-6 h-6">
                      <Scan className="w-full h-full" />
                    </span>

                    {shortenAddress(token.address)}
                  </a>
                  <span className="ml-0.5 p-0.5 w-6 h-6 hover:cursor-pointer hover-overlay rounded-lg">
                    <Copy onClick={copyAddress} />
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-2">
                <div className="text-16 font-GilroyExtraBold">
                  Token address
                </div>
                <div className="flex items-center">
                  <div className="text-12">{shortenAddress(token.address)}</div>
                  <span className="ml-0.5 p-0.5 w-6 h-6 hover:cursor-pointer hover-overlay rounded-lg">
                    <Copy onClick={copyAddress} />
                  </span>
                </div>
              </div>
            )}
          </>
        )}
        <div className="py-2">
          <div className="text-16 font-GilroyExtraBold">Token decimals</div>
          <div className="text-12">{token.decimal}</div>
        </div>
        <div className="py-2">
          <div className="text-16 font-GilroyExtraBold">Network</div>
          <div className="text-12">
            {networkInfo?.name || currentNetwork.name}
          </div>
        </div>

        <div className="w-[200px] m-auto py-4">
          <PrimaryButton text="Send" onClick={send} />
        </div>
        {!isNative && (
          <button
            className="w-fit m-auto p-1 px-2 rounded-md block underline hover-overlay"
            onClick={remove}
          >
            Hide token
          </button>
        )}
      </div>
    </Modal>
  );
};
