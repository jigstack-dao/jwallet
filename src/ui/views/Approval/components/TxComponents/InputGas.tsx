import React, { useEffect, useState, useMemo } from 'react';
import { InputNumber } from 'antd';
import { BigNumber as BgNumber, ethers } from 'ethers';
import useNetwork from '@/hooks/wallet/useNetwork';
import { bnToNumber } from '@/utils/format';
import { TokenSaved } from '@/background/service/permission';
import { getChainLogoById } from '@/constant/chains';
import { t } from 'utils';
import { AddressZero, MIN_GAS_LIMIT_DEC } from '@/constant';

export const InputGas = ({ inputGas, setInputGas }) => {
  const { currentNetwork } = useNetwork();
  const nativeTokenLogo = getChainLogoById(currentNetwork.chainId);
  const [gasPrice, setGasPrice] = useState(BgNumber.from(0));
  const initialToken: TokenSaved = {
    address: AddressZero,
    img: nativeTokenLogo || '',
    decimal: currentNetwork.decimals,
    chainId: currentNetwork.chainId,
    createdAt: 0,
    id: -1,
    name: currentNetwork.symbol,
    symbol: currentNetwork.symbol,
    standard: 'Native token',
  };
  const [token, setToken] = useState(initialToken);
  // const [inputGas, setInputGas] = useState(
  //   bnToNumber(gasPrice, token.decimal).toString()
  // );
  const _gasLimit = BgNumber.from(MIN_GAS_LIMIT_DEC);

  const providerNetwork = useMemo(
    () => new ethers.providers.JsonRpcProvider(currentNetwork.rpcURL),
    [currentNetwork.rpcURL]
  );
  useEffect(() => {
    setInputGas(bnToNumber(gasPrice, token.decimal).toString());
  }, [gasPrice]);

  useEffect(() => {
    const initialToken: TokenSaved = {
      address: AddressZero,
      img: nativeTokenLogo || '',
      decimal: currentNetwork.decimals,
      chainId: currentNetwork.chainId,
      createdAt: 0,
      id: -1,
      name: currentNetwork.symbol,
      symbol: currentNetwork.symbol,
      standard: 'Native token',
    };
    setToken(initialToken);
  }, [currentNetwork]);
  const handleChangGas = (value) => {
    // if (Number(e.target.value) >= 0) {
    setInputGas(value);
    // }
  };
  useEffect(() => {
    void (async () => {
      const _gasPrice = await providerNetwork.getGasPrice();
      setGasPrice(_gasPrice);
    })();
  }, [providerNetwork, token.address]);

  return (
    <>
      <p className="section-title">{t('gasCostTitle')}</p>
      <div className="gas-selector gray-section-block">
        <div className="gas-info">
          <InputNumber
            placeholder="Please enter gas fee"
            defaultValue={bnToNumber(gasPrice.mul(_gasLimit), token.decimal)}
            onChange={handleChangGas}
            value={inputGas}
            controls={false}
            min={0}
          />
        </div>
      </div>
    </>
  );
};
