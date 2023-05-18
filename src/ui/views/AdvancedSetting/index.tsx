import {
  AdvancedSetting,
  DEFAULT_SETTING_STORE,
} from '@/background/service/setting';
import { useAppContext } from '@/context';
import { ActionTypes } from '@/context/actions';
import InputText from '@/ui/component/Inputs/InputText';
import PageContainer from '@/ui/component/PageContainer';
import { useWallet } from '@/ui/utils';
import React, { useEffect, useState } from 'react';
import SwitchSetting from '../../component/SwitchSetting';
import './style.less';

const AnvancedSetting = () => {
  const wallet = useWallet();
  const [setting, setSetting] = useState({ ...DEFAULT_SETTING_STORE.advanced });
  const { dispatch } = useAppContext();

  const loadSetting = async () => {
    const _setting = await wallet.getAdvancedSetting();
    setSetting(_setting);
  };

  const onUpdate = async (payload: AdvancedSetting) => {
    await wallet.updateAdvancedSetting(payload);
    await loadSetting();
  };

  useEffect(() => {
    void (async () => {
      await loadSetting();
    })();
  }, []);

  const changeLockTime = (value: string) => {
    if (!new RegExp('^[0-9]+$').test(value)) return;
    const numbTime = Number(value);
    if (numbTime >= 1) {
      onUpdate({ ...setting, lockTimer: numbTime });
      dispatch({
        type: ActionTypes.UpdateAutoLockTimeLimit,
        payload: numbTime,
      });
    }
  };

  return (
    <PageContainer title="Advanced">
      <div className="setting-advanced-container">
        <div className="setting-advanced__field">
          <div className="setting-advanced__field__title">Advanced Gas Fee</div>
          <SwitchSetting
            checked={setting.gasFee}
            onChange={() => onUpdate({ ...setting, gasFee: !setting.gasFee })}
          />
        </div>
        <div className="setting-advanced__field">
          <div className="setting-advanced__field__title">Show Conversions</div>
          <SwitchSetting
            checked={setting.showConversions}
            onChange={() =>
              onUpdate({
                ...setting,
                showConversions: !setting.showConversions,
              })
            }
          />
        </div>
        <div className="setting-advanced__field">
          <div className="setting-advanced__field__title">Nonce Selector</div>
          <SwitchSetting
            checked={setting.showNonceSelector}
            onChange={() =>
              onUpdate({
                ...setting,
                showNonceSelector: !setting.showNonceSelector,
              })
            }
          />
        </div>
        <div className="setting-advanced__field">
          <div className="setting-advanced__field__title">Show Hex Data</div>
          <SwitchSetting
            checked={setting.showHexData}
            onChange={() =>
              onUpdate({ ...setting, showHexData: !setting.showHexData })
            }
          />
        </div>
        <div className="setting-advanced__field">
          <div className="setting-advanced__field__title">
            Auto-Lock Timer (min)
          </div>
          <InputText
            value={setting.lockTimer.toString()}
            onChange={(e) => changeLockTime(e.target.value)}
          />
        </div>
      </div>
    </PageContainer>
  );
};

export default AnvancedSetting;
