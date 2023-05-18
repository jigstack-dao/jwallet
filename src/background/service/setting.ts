import { createPersistStore } from 'background/utils';

export interface GeneralSetting {
  primary: string;
  currencyConversion: string;
  hideCurrency: boolean;
}

export interface AdvancedSetting {
  gasFee: boolean;
  showConversions: boolean;
  showHexData: boolean;
  showNonceSelector: boolean;
  lockTimer: number;
}

interface SettingStore {
  general: GeneralSetting;
  advanced: AdvancedSetting;
}

export const DEFAULT_SETTING_STORE = {
  general: {
    primary: 'Crypto',
    currencyConversion: 'USD',
    hideCurrency: false,
  },
  advanced: {
    gasFee: false,
    showConversions: true,
    showHexData: false,
    showNonceSelector: false,
    lockTimer: 5, // unit minutes
  },
};

class SettingService {
  store!: SettingStore;

  async init() {
    this.store = await createPersistStore<SettingStore>({
      name: 'setting',
      template: { ...DEFAULT_SETTING_STORE },
    });
    if (!this.store.general)
      this.store.general = { ...DEFAULT_SETTING_STORE.general };
    if (!this.store.advanced)
      this.store.advanced = { ...DEFAULT_SETTING_STORE.advanced };
  }

  updateGeneraSetting(general: GeneralSetting) {
    this.store.general = general;
  }

  updateAdvancedSetting(advanced: AdvancedSetting) {
    this.store.advanced = advanced;
  }

  getStore() {
    return this.store;
  }
}

export default new SettingService();
