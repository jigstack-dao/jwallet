import PrimaryButton from '@/ui/component/Buttons/PrimaryButton';
import './style.less';
import JwalletIcon from '@/ui/assets/jwallet/jwallet-icon.svg';
import Vectors from '@/ui/assets/jwallet/group-vector-fetching-quotes.svg';
import React, { FC, useEffect, useState } from 'react';

interface IFetchingQuotes {
  cancelFetching: (...params) => any;
}

const FetchingQuotes: FC<IFetchingQuotes> = ({ cancelFetching }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => prev + 25);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fetching-quote">
      <div className="fetching-quote__title">Fetching Quotes</div>
      <div className="fetching-quote__progress">
        <div
          className="fetching-quote__progress-line"
          style={{ width: `${progress >= 100 ? 100 : progress}%` }}
        ></div>
      </div>
      {/* <div className="fetching-quote__counter">Quote 1 of 4</div> */}
      <div className="fetching-quote__images">
        <img src={JwalletIcon} alt="" />
        <img src={Vectors} alt="" />
      </div>
      <PrimaryButton onClick={cancelFetching} text="CANCEL" />
    </div>
  );
};

export default FetchingQuotes;
