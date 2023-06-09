import { NFTItem } from '@/background/service/openapi';
import { Modal } from 'antd';
import clsx from 'clsx';
import React, { useState } from 'react';
import { useHover } from 'ui/utils';
import NFTAvatar from './NFTAvatar';
import NFTModal from './NFTModal';
import './style.less';

export interface NFTListRowProps {
  data: NFTItem[];
  index: number;
  style: React.CSSProperties;
}
const NFTListRow = (props: NFTListRowProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { data, index, style } = props;
  const item = data[index];
  const [isHovering, hoverProps] = useHover();

  const handleToggleModal = () => {
    setModalVisible(!modalVisible);
  };

  return (
    <div
      className={clsx('nft-list-row pointer', isHovering && 'hover')}
      style={style}
      {...hoverProps}
      onClick={handleToggleModal}
    >
      <div className="nft-list-row-avatar">
        <NFTAvatar
          type={item.content_type}
          content={item.content}
          chain={item.chain}
          className="w-32 h-32"
        ></NFTAvatar>
      </div>
      <div className="nft-list-row-content">
        <div className="nft-list-row-title">{item.name || '-'}</div>
        <div className="nft-list-row-description">
          {item?.collection?.name || '-'}
        </div>
      </div>
      <div className="nft-list-row-extra">
        {item.amount > 1 && <div className="tag">x{item.amount}</div>}
      </div>
      <Modal
        open={modalVisible}
        centered
        width={336}
        cancelText={null}
        closable={false}
        okText={null}
        footer={null}
        className="nft-modal"
        onCancel={handleToggleModal}
      >
        <NFTModal data={item} />
      </Modal>
    </div>
  );
};

export default NFTListRow;
