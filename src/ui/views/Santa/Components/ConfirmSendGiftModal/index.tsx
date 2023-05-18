import './index.less';
import { Modal } from 'antd';
import { ReactComponent as CloseModalIcon } from '@/ui/assets/jwallet/close-modal.svg';
import StrayButtons from '@/ui/component/Buttons/StrayButtons';
import InputText from '@/ui/component/Inputs/InputText';
import React from 'react';
import TokenDropdown from '../TokenDropdown';
import { TokenSantaResponse } from '@/constant/santa';
import { IRecipient } from '@/hooks/forms/useSendGiftSanta';

const ConfirmSendGiftModal: React.FC<{
  onClose: () => void;
  onConfirm: () => void;
  imgURL: string;
  tokenSelectedAddress: string;
  tokens: TokenSantaResponse[];
  recipients: IRecipient[];
  title: string;
}> = ({
  onClose,
  onConfirm,
  imgURL,
  tokenSelectedAddress,
  tokens,
  recipients,
  title,
}) => {
  return (
    <Modal
      title={null}
      open={true}
      footer={null}
      closable={false}
      width={368}
      centered
    >
      <div className="px-4 pb-[30px]" id="confirm-send-gift">
        <div
          className="w-full flex justify-end pt-5 cursor-pointer"
          onClick={close}
        >
          <CloseModalIcon />
        </div>
        <div className="font-GilroyExtraBold text-18 text-white text-center w-full -mt-[5px] mb-[28px]">
          Confirmation
        </div>
        <div className="w-full flex justify-center">
          {imgURL && (
            <img src={imgURL} alt="" width={113} height={80} className="mb-4" />
          )}
        </div>
        <div className="mb-4 font-GilroyExtraBold text-center w-full h-max text-white">
          {title}
        </div>
        {recipients.map((x, index) => (
          <div key={x.email}>
            <div className="info text-white">
              <div className="mb-4 text-center w-full h-max">{x.comment}</div>
            </div>
            <div className="mb-4">
              <TokenDropdown
                addressSelected={tokenSelectedAddress}
                tokens={tokens}
                amount={x.amount}
                onChangeToken={() => undefined}
                onChangeAmount={() => undefined}
                disabledChange={true}
              />
            </div>
            <div className="mb-5">
              <InputText placeHolder="" value={x.email} />
            </div>
            {index != recipients.length && <div className="line-border"></div>}
          </div>
        ))}

        <StrayButtons
          backTitle="CANCEL"
          nextTitle="CONFIRM"
          onBack={onClose}
          onNext={onConfirm}
        />
      </div>
    </Modal>
  );
};

export default ConfirmSendGiftModal;
