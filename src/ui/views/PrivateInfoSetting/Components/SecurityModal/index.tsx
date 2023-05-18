import React from 'react';
import { Modal } from 'antd';
import './style.less';
import { ReactComponent as CloseModalIcon } from '@/ui/assets/jwallet/close-modal.svg';
import { ReactComponent as WarningIcon } from '@/ui/assets/jwallet/warning.svg';
import StrayButtons from '@/ui/component/Buttons/StrayButtons';

const SecurityModal: React.FC<{
  onContinue: () => void;
  onClose: () => void;
}> = ({ onContinue, onClose }) => {
  return (
    <Modal
      title={null}
      open={true}
      footer={null}
      closable={false}
      width={368}
      centered
    >
      <div id="warning-modal" className="text-white">
        <div
          className="w-full flex justify-end cursor-pointer"
          onClick={onClose}
        >
          <CloseModalIcon />
        </div>
        <div className="font-GilroyExtraBold text-18 text-white text-center w-full -mt-[5px] mb-[28px]">
          Warning
        </div>
        <div className="flex items-center justify-center">
          <WarningIcon width="100" height="100" />
        </div>
        <div className="mb-5 text-[#E1DFF0]">
          Hold on, this action is too dangerous! Make sure no one could get your
          secret file!
        </div>
        <StrayButtons
          backTitle="Back"
          nextTitle="Download"
          onBack={onClose}
          onNext={onContinue}
        />
      </div>
    </Modal>
  );
};

export default SecurityModal;
