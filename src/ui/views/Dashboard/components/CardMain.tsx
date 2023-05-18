import React from 'react';
import Tooltip from 'antd/es/tooltip';

interface IProps {
  icon: React.ReactNode;
  text: string;
  rightEl?: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}

const CardMain: React.FC<IProps> = ({
  icon,
  text,
  rightEl = null,
  disabled = false,
  onClick,
}) => {
  return (
    <>
      {disabled && (
        <Tooltip
          placement="top"
          title="Coming soon"
          arrowPointAtCenter={true}
          overlayClassName="arrow"
        >
          <div
            className="rounded-xl text-white flex py-4 cursor-pointer justify-start items-center relative backdrop-blur-[10px] opacity-60 hover:cursor-not-allowed"
            style={{
              background:
                'linear-gradient(154.64deg, rgba(255, 255, 255, 0.35) 6.18%, rgba(255, 255, 255, 0.09) 93.39%)',
            }}
          >
            <div className="flex justify-start items-center ml-4 space-x-1 flex-1">
              <span className="w-[15px]">{icon}</span>
              <span>{text}</span>
            </div>
            {rightEl}
          </div>
        </Tooltip>
      )}
      {!disabled && (
        <div
          className="rounded-xl text-white flex py-4 cursor-pointer justify-start items-center relative backdrop-blur-[10px]"
          style={{
            background:
              'linear-gradient(154.64deg, rgba(255, 255, 255, 0.35) 6.18%, rgba(255, 255, 255, 0.09) 93.39%)',
          }}
          onClick={onClick}
        >
          <div className="flex justify-start items-center ml-4 space-x-1 flex-1">
            <span className="w-[15px]">{icon}</span>
            <span>{text}</span>
          </div>
          {rightEl}
        </div>
      )}
    </>
  );
};

export default CardMain;
