import React from 'react';

interface IProps {
  icon: React.ReactNode;
  text: string;
  rightEl?: React.ReactNode;
}

const CardFeature: React.FC<IProps> = ({ icon, text, rightEl = null }) => {
  return (
    <div
      className="rounded-xl text-white flex py-4 cursor-pointer justify-start items-center relative backdrop-blur-[10px]"
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
  );
};

export default CardFeature;
