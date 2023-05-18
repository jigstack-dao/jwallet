import React, { useEffect, useMemo, useState } from 'react';
import './style.less';
import { ReactComponent as RadioIcon } from '@/ui/assets/jwallet/radio-button.svg';
import { ReactComponent as RadioCheckedIcon } from '@/ui/assets/jwallet/radio-button-checked.svg';
import { ReactComponent as ArrowDownIcon } from '@/ui/assets/jwallet/arrow-down.svg';
import SwitchSetting from '@/ui/component/SwitchSetting';
import { useWallet } from '@/ui/utils';
import {
  DEFAULT_SETTING_STORE,
  GeneralSetting as IGeneralSetting,
} from '@/background/service/setting';
import availableCurrencies from '@/constant/available-conversions';
import PageContainer from '@/ui/component/PageContainer';

const sortedCurrencies = availableCurrencies.sort((a, b) => {
  return a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase());
});

const currencyOptions = sortedCurrencies.map(({ code, name }) => {
  return {
    name: `${code.toUpperCase()} - ${name}`,
    value: code,
  };
});

const GeneralSetting = () => {
  const wallet = useWallet();
  const [setting, setSetting] = useState({ ...DEFAULT_SETTING_STORE.general });
  const [openDropdown, setOpenDropdown] = useState(false);

  const loadGeneralSetting = async () => {
    const _setting = await wallet.getGeneralSetting();
    setSetting(_setting);
  };

  const onUpdate = async (payload: IGeneralSetting) => {
    await wallet.updateGeneralSetting(payload);
    await loadGeneralSetting();
  };

  useEffect(() => {
    void (async () => {
      await loadGeneralSetting();
    })();
  }, []);

  const selectedCurrency = useMemo(() => {
    const data = currencyOptions.find(
      (x) => x.value.toLowerCase() == setting.currencyConversion.toLowerCase()
    );
    return data ? data.name : '';
  }, [setting.currencyConversion, currencyOptions]);

  return (
    <PageContainer title="General">
      <div id="setting-general">
        <div className="currency-group-checkbox">
          <div className="currency-group-checkbox__title">Primary Currency</div>
          <div className="currency-group-checkbox__radios">
            <Checkbox
              text="Crypto"
              checked={setting.primary == 'Crypto'}
              onClick={() => onUpdate({ ...setting, primary: 'Crypto' })}
            />
            <Checkbox
              text="Fiat"
              checked={setting.primary == 'Fiat'}
              onClick={() => onUpdate({ ...setting, primary: 'Fiat' })}
            />
          </div>
        </div>
        <div className="dropdown-currency">
          <div className="dropdown-currency__title">
            Primary Currency Conversion
          </div>
          <div
            className="dropdown-currency__content"
            onClick={() => setOpenDropdown(!openDropdown)}
          >
            <div>{selectedCurrency}</div>
            <div>
              <ArrowDownIcon />
            </div>
          </div>
          {openDropdown && (
            <div className="dropdown-currency__menu">
              {currencyOptions
                .filter(
                  (x) => x.value.toLowerCase() != setting.currencyConversion
                )
                .map((x) => (
                  <div
                    key={x.value}
                    className="dropdown-currency__menu__item"
                    onClick={() => {
                      onUpdate({ ...setting, currencyConversion: x.value });
                      setOpenDropdown(false);
                    }}
                  >
                    {x.name}
                  </div>
                ))}
            </div>
          )}
        </div>
        <div>
          <div className="mb-4">Hide Currencies Without Balance</div>
          <SwitchSetting
            checked={setting.hideCurrency}
            onChange={() =>
              onUpdate({ ...setting, hideCurrency: !setting.hideCurrency })
            }
          />
        </div>
      </div>
    </PageContainer>
  );
};

const Checkbox: React.FC<{
  text: string;
  checked: boolean;
  onClick: () => void;
}> = ({ text, checked, onClick }) => {
  return (
    <div className="currency-checkbox" onClick={onClick}>
      <div className="currency-checkbox__icon">
        {checked ? <RadioCheckedIcon /> : <RadioIcon />}
      </div>
      <div className="currency-checkbox__text">{text}</div>
    </div>
  );
};

export default GeneralSetting;
