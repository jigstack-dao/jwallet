import React from 'react';
import PrimaryButton from '@/ui/component/Buttons/PrimaryButton';
import './style.less';
import ArrowDown from '@/ui/assets/jwallet/arrow-down.svg';
import { Chain, Token } from '@lifi/sdk';
import { LifiRouteStep } from '../..';

interface IProps {
  tokenFrom: Token;
  tokenTo: Token;
  amountFrom: string;
  amountTo: string;
  step: LifiRouteStep;
  onConfirm: () => void;

  chainFrom: Chain | undefined;
  chainTo: Chain | undefined;
}

function secondsToTime(e: number) {
  const m = Math.floor((e % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.floor(e % 60)
    .toString()
    .padStart(2, '0');

  return m + ':' + s;
}

const ConfirmStep: React.FC<IProps> = ({
  tokenFrom,
  tokenTo,
  amountFrom,
  amountTo,
  step,
  chainFrom,
  chainTo,
  onConfirm,
}) => {
  return (
    <div>
      <div className="mb-3">From</div>
      <div className="from-card mb-4">
        <div className="from-card__left">
          <span>
            <img src={chainFrom?.logoURI} alt="" className="rounded-full" />
          </span>
          <span>{chainFrom?.name} </span>
        </div>
        <div className="from-card__right">
          <span>{amountFrom}</span>
          <span>
            <img
              src={tokenFrom.logoURI}
              alt=""
              width={28}
              className="rounded-full"
            />
          </span>
          <span className="opacity-60">{tokenFrom.symbol}</span>
        </div>
      </div>
      <div className="w-full flex justify-center mb-2">
        <img src={ArrowDown} alt="" />
      </div>
      <div className="w-full flex justify-center mb-[10px]">
        <span className="my-auto">
          <img src={chainTo?.logoURI} alt="" className="rounded-full" />
        </span>
        <span className="text-12 text-[#E1E0E6] my-auto ml-2">
          {chainTo?.name}
        </span>
      </div>
      <div className="swap-value">{amountTo}</div>
      <div className="w-full flex justify-center mb-[10px]">
        <span className="my-auto">
          <img
            src={tokenTo.logoURI}
            alt=""
            width={28}
            className="rounded-full"
          />
        </span>
        <span className="text-12 text-[#E1E0E6] my-auto ml-2">
          {tokenTo.symbol}
        </span>
      </div>
      <div className="converted-value ml-2 mb-6">
        1 {tokenFrom.symbol} ={' '}
        {(Number(amountTo) / Number(amountFrom)).toFixed(6)} {tokenTo.symbol}
      </div>
      <div className="w-full text-center mb-2">
        <span>Best of 3 quotes. </span>
        <span className="opacity-60">Includes a 0,5% jWallet fee</span>
      </div>
      <PrimaryButton text="Accept" onClick={onConfirm} />
      <div className="swap-fee mt-3">
        <div className="swap-fee__item">
          <span className="text-14">Estimated Cost</span>
          <span>$ {step.amountUSD}</span>
        </div>
        <div className="swap-fee__item">
          <span className="text-14">Price Impact</span>
          <span>% {step.priceImpact}</span>
        </div>
        <div className="swap-fee__item">
          <span className="text-14">ESTIMATION DURATION</span>
          <span>{secondsToTime(step.executionDuration)} min</span>
        </div>
      </div>
    </div>
  );
};

export default ConfirmStep;
