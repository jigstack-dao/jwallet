import { getCurrencySymbol } from '@/utils/format';
import axios from 'axios';
import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import useNetwork from './useNetwork';
import { useAdvancedSetting, useGeneralSetting } from './useWalletSetting';
import networkInfo from '@/constant/networks/networkInfo.json';

const useFiatNativeCurrency = (balance: BigNumber) => {
  const { currentNetwork } = useNetwork();
  const [conversionRate, setConversionRate] = useState(0);
  const { currencyConversion } = useGeneralSetting();
  const { showConversions } = useAdvancedSetting();

  useEffect(() => {
    void (async () => {
      if (showConversions) {
        const network = networkInfo.find(
          (item) => item.chainId === currentNetwork.chainId
        );
        const _currencyConversion = currencyConversion.toUpperCase();
        const api = axios.create({
          baseURL: process.env.REACT_APP_CRYPTOCOMPARE_API,
        });
        const { data } = await api.get(
          `/data/price?fsym=${
            network ? network.nativeCurrency.symbol : currentNetwork.symbol
          }&tsyms=${_currencyConversion}`
        );

        if (_currencyConversion in data) {
          setConversionRate(data[_currencyConversion]);
        }
      }
    })();
  }, [currentNetwork.symbol, currencyConversion]);

  if (!showConversions) return '';

  return `${getCurrencySymbol(currencyConversion)}${(
    Number(formatUnits(balance, currentNetwork.decimals)) * conversionRate
  ).toFixed(2)} ${currencyConversion.toUpperCase()}`;
};

export default useFiatNativeCurrency;
