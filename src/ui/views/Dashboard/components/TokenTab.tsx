import React from 'react';

const TokenTab = (props) => {
  const { setActiveTab, activeTab } = props;
  return (
    <div className="flex justify-center items-center text-14">
      <span
        className="border-[1px] border-white rounded-lg px-[23px] py-[6px] mx-[8px] cursor-pointer"
        style={{
          background: activeTab === 'Tokens' ? '#FFF' : 'transparent',
          color: activeTab === 'Tokens' ? '#5957D5' : '#FFF',
        }}
        onClick={() => setActiveTab('Tokens')}
      >
        Tokens
      </span>
      <span
        className="border-[1px] border-white rounded-lg px-[23px] py-[6px] mx-[8px] cursor-pointer"
        style={{
          background: activeTab === 'Tokens' ? 'transparent' : '#FFF',
          color: activeTab === 'Tokens' ? '#FFF' : '#5957D5',
        }}
        onClick={() => setActiveTab('Activity')}
      >
        Activity
      </span>
    </div>
  );
};
export default TokenTab;
