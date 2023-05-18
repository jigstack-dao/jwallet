import React, { useEffect, useState } from 'react';
import InputText from '@/ui/component/Inputs/InputText';
import { ReactComponent as DollarIcon } from '@/ui/assets/jwallet/dollar.svg';
import GasDropdown from './GasDropdown';
import { BigNumber } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { MIN_GWEI_UNIT } from '@/constant';
import { useAdvancedSetting } from '@/hooks/wallet/useWalletSetting';

interface IProps {
  gasPrice: BigNumber;
  gasLimit: BigNumber;
  nonce: number;
  setNonce: (nonce) => void;
  errorGasPrice: string | undefined;
  errorGasLimit: string | undefined;
  hexData: string;
  canEditHexData: boolean;
  onGasLimitChange: (value: BigNumber) => void;
  onGasPriceChange: (value: BigNumber) => void;
  onChangeHexData: (value: string) => void;
  changeGasFeeString: (type: string, value: string) => void;
}

const GasFeeStep: React.FC<IProps> = ({
  gasLimit,
  gasPrice,
  nonce,
  setNonce,
  hexData,
  errorGasPrice,
  errorGasLimit,
  canEditHexData,
  onGasLimitChange,
  onGasPriceChange,
  onChangeHexData,
  changeGasFeeString,
}) => {
  const advancedSetting = useAdvancedSetting();
  const [gasPriceText, setGasPriceText] = useState(formatUnits(gasPrice, 9));

  const handleGasPriceChange = (e) => {
    if (!e.target.value) {
      setGasPriceText('');
      changeGasFeeString('price', '0');
    } else {
      try {
        parseUnits(e.target.value, 9);
        setGasPriceText(e.target.value);
        changeGasFeeString('price', e.target.value);
      } catch (error) {}
    }
  };

  const handleNonceChange = (e) => {
    if (!e.target.value) {
      setNonce(0);
    } else {
      try {
        parseUnits(e.target.value, 9);
        setNonce(+e.target.value);
      } catch (error) {}
    }
  };

  const onIncreaseNonce = () => {
    setNonce((prevNonce) => Number(prevNonce) + 1);
  };

  const onDecreaseNonce = () => {
    if (!nonce || Number(nonce) === 0) return;
    setNonce((prevNonce) => Number(prevNonce) - 1);
  };
  useEffect(() => {
    setNonce(nonce);
  }, [nonce]);
  return (
    <div id="gas-fee-step">
      <div className="top-line"></div>
      <div className="header">
        <div className="dollar">
          <DollarIcon />
        </div>
        <div className="text">Estimated gas fee</div>
      </div>
      <div className="gas-fee-dropdonws">
        <div>
          <GasDropdown
            title="Gas limit"
            value={gasLimit.toString()}
            increase={() => onGasLimitChange(gasLimit.add(1))}
            decrease={() => onGasLimitChange(gasLimit.sub(1))}
            onChange={(e) => changeGasFeeString('limit', e.target.value)}
            tooltip="Gas limit is the maximum units of gas you are willing to use."
            disabled={advancedSetting.gasFee}
          />
          {errorGasLimit && (
            <span className="text-14 text-[#FFA877]">{errorGasLimit}</span>
          )}
        </div>
        <div>
          <GasDropdown
            title="Gas price (GWEI)"
            value={gasPriceText}
            increase={() => onGasPriceChange(gasPrice.add(MIN_GWEI_UNIT))}
            decrease={() => onGasPriceChange(gasPrice.sub(MIN_GWEI_UNIT))}
            onChange={handleGasPriceChange}
            tooltip="Gas price fee is the fee for your transaction. You’ll most often pay your max setting"
            disabled={advancedSetting.gasFee}
          />
          {errorGasPrice && (
            <span className="text-14 text-[#FFA877]">{errorGasPrice}</span>
          )}
        </div>
      </div>
      {advancedSetting.showNonceSelector && (
        <div className="mb-4">
          <GasDropdown
            title="Custom Nonce"
            value={String(nonce)}
            increase={onIncreaseNonce}
            decrease={onDecreaseNonce}
            onChange={handleNonceChange}
            tooltip=""
            disabled={true}
          />
        </div>
      )}
      {advancedSetting.showHexData && canEditHexData && (
        <InputText
          placeHolder="Hex data (optional)"
          value={hexData}
          onChange={(e) => onChangeHexData(e.target.value)}
        />
      )}
    </div>
  );
};

export default GasFeeStep;
