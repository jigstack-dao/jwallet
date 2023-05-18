import React from 'react';
import { ReactComponent as InfoIcon } from '@/ui/assets/jwallet/info.svg';
import { ReactComponent as ScanIcon } from '@/ui/assets/jwallet/link.svg';
import './style.less';
interface IProps {
  data: {
    imageURL: string | null;
    status: string;
    to: string;
    scanLink: string;
    createdDate: string;
    amount: string;
  };
  onClick: () => void;
}
const TransactionCard: React.FC<IProps> = ({ data, onClick }) => {
  const openScanLink = () => {
    window.open(data.scanLink, '_blank');
  };
  return (
    <div className="transaction-card hover:cursor-pointer" onClick={onClick}>
      <div className="gift-image">
        {data.imageURL && <img src={data.imageURL} alt="" />}
      </div>
      <div className="info-tx">
        <div className="status">{data.status.toUpperCase()}</div>
        <div className="send-to">
          <span className="to">To: </span>
          <span className="receiver">{data.to}</span>
          <span className="scan" onClick={openScanLink}>
            <ScanIcon />
          </span>
        </div>
      </div>
      <div className="balance">
        <div className="amount">{data.amount}</div>
        <div className="date-send">{data.createdDate}</div>
      </div>
      <div className="info">
        <InfoIcon />
      </div>
    </div>
  );
};

export default TransactionCard;
