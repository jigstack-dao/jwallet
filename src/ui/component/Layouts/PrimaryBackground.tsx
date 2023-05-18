import React from 'react';
import PrimaryHeader from '../Headers/PrimaryHeader';

export default function PrimaryLayout({ children, showHeader = true }) {
  return (
    <div className="w-full h-full text-white relative pt-[15px] pb-[35px] px-[30px] flex justify-center">
      <div className="w-[400px]">
        {showHeader && (
          <div className="ml-[-30px]">
            <PrimaryHeader />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
