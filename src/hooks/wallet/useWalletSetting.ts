import {
  AdvancedSetting,
  DEFAULT_SETTING_STORE,
  GeneralSetting,
} from '@/background/service/setting';
import { useWallet } from '@/ui/utils';
import { useEffect, useState } from 'react';

export const useGeneralSetting = (): GeneralSetting => {
  const [general, setGeneral] = useState<GeneralSetting>({
    ...DEFAULT_SETTING_STORE.general,
  });
  const wallet = useWallet();
  useEffect(() => {
    void (async () => {
      setGeneral(await wallet.getGeneralSetting());
    })();
  }, []);
  return general;
};

export const useAdvancedSetting = (): AdvancedSetting => {
  const [advanced, setAdvanced] = useState<AdvancedSetting>({
    ...DEFAULT_SETTING_STORE.advanced,
  });
  const wallet = useWallet();
  useEffect(() => {
    void (async () => {
      setAdvanced(await wallet.getAdvancedSetting());
    })();
  }, []);
  return advanced;
};
