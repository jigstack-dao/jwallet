import React from 'react';
import LogoHeader from '@/ui/assets/logo/logo-header.svg';

export default function PrimaryHeader() {
  return (
    <div className="flex items-center space-x-2 px-[12px]">
      <div className="p-1 rounded-md hover-overlay">
        <img src={LogoHeader} alt="" />
      </div>
      <div>
        <p className="font-GilroyExtraBold text-20 text-white">Jwallet</p>
      </div>
    </div>
  );
}
