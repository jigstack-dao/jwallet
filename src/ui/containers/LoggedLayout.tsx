import React, { FC, PropsWithChildren } from 'react';
import Header from '../component/Layouts/Header';

const LoggedLayout: FC<PropsWithChildren> = (props) => {
  const { children } = props;

  return (
    <div
      className="px-3 py-4 text-white w-full h-full relative overflow-auto pt-[70px] flex justify-center"
      id="extension"
    >
      <div className="w-[400px]">
        <Header />
        {children}
      </div>
    </div>
  );
};

export default LoggedLayout;
