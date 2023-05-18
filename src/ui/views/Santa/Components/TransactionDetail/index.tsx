import React from 'react';
import { Modal } from 'antd';
import './style.less';
import { ReactComponent as CloseModalIcon } from '@/ui/assets/jwallet/close-modal.svg';
import { TransactionItem } from '@/constant/santa';

const TransactionDetail: React.FC<{
  data: TransactionItem;
  onClose: () => void;
}> = ({ data, onClose }) => {
  return (
    <Modal
      title={null}
      open={true}
      footer={null}
      closable={false}
      width={368}
      centered
    >
      <div className="px-4 pb-[30px]" id="transaction-detail">
        <div
          className="w-full flex justify-end pt-5 cursor-pointer"
          onClick={onClose}
        >
          <CloseModalIcon />
        </div>
        <div className="font-GilroyExtraBold text-18 text-white text-center w-full -mt-[5px] mb-[28px]">
          Transaction Info
        </div>
        <div className="transaction-detail-info">
          {data.imageURL && <img src={data.imageURL} />}
          <div className="transaction-detail-content">
            <div className="transaction-detail-title">{data.title}</div>
            <div className="transaction-detail-comment">{data.comment}</div>
          </div>
        </div>
        <div className="token-info">
          <div className="logo">
            {data.imageToken && <img src={data.imageToken} />}
          </div>
          <div className="name">
            <div>
              {data.nameToken} ({data.symbolToken})
            </div>
            <div>{data.to}</div>
          </div>
          <div className="amount">
            <div>{data.amount}</div>
            <div>{data.status}</div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TransactionDetail;
