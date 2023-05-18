import React, { FC } from 'react';

import { Modal, Spin } from 'antd';
import { ReactComponent as CloseModalIcon } from '@/ui/assets/jwallet/close-modal.svg';
import { LoadingOutlined } from '@ant-design/icons';

interface IProps {
  open?: boolean;
  isClosable?: boolean;
  onClose?: () => any;
}

const icon = (
  <LoadingOutlined
    style={{ fontSize: 48, color: 'white', opacity: '.5' }}
    spin
  />
);

export const LoadingModal: FC<IProps> = (props) => {
  const { open, onClose, isClosable = true } = props;

  return (
    <Modal
      title={null}
      open={open}
      footer={null}
      closable={false}
      width={368}
      centered
    >
      <div className="px-4 pt-5 pb-[30px] text-white relative">
        {isClosable && (
          <div
            className="right-3 mt-1 p-1 pt-1 cursor-pointer absolute hover-overlay rounded-md"
            onClick={onClose}
          >
            <CloseModalIcon />
          </div>
        )}
        <div className="font-GilroyExtraBold text-18 text-center w-full mb-[28px]">
          Please wait
        </div>
        <div className="mb-[60px]">
          <div className="flex w-full h-full justify-center items-center">
            <Spin indicator={icon} />
          </div>
        </div>
      </div>
    </Modal>
  );
};
