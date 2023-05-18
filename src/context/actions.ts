import { NetworkChain } from '@/background/service/permission';
import { TAB_SANTA_KEYS } from '@/constant';
import { HooksWallet } from '@/hooks/types';
import { BigNumber } from 'ethers';

type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

export enum ActionTypes {
  UpdateIsOpenModalCreateAccount = 'UPDATE_IS_OPEN_MODAL_CREATE_ACCOUNT',
  UpdateIsOpenDropdownAccount = 'UPDATE_IS_OPEN_DROPDOWN_ACCOUNT',
  UpdateRefreshUseHooks = 'UPDATE_REFRESH_USE_HOOKS',
  UpdateLoadingScreen = 'UPDATE_LOADING_SCREEN',
  UpdateSantaTab = 'UPDATE_SANTA_TAB',
  UpdateActivitySectionRefresh = 'UpdateActivitySectionRefresh',
  UpdateAutoLockTimeLimit = 'UpdateAutoLockTimeLimit',
  UpdateNetwork = 'UpdateNetwork',
  UpdateAccount = 'UpdateAccount',
  UpdateBalance = 'UpdateBalance',
}
export enum RefreshUseHooks {
  Wallet_CurrentAccount = 'Wallet_CurrentAccount',
  Wallet_Accounts = 'Wallet_Accounts',
  Wallet_Network = 'Wallet_Network',
  Account_Balance = 'Account_Balance',
  Connected_Site = 'Connected_Site',
}

interface ActionPayload {
  [ActionTypes.UpdateIsOpenModalCreateAccount]: boolean;
  [ActionTypes.UpdateIsOpenDropdownAccount]: boolean;
  [ActionTypes.UpdateRefreshUseHooks]: RefreshUseHooks[];
  [ActionTypes.UpdateLoadingScreen]: boolean;
  [ActionTypes.UpdateSantaTab]: TAB_SANTA_KEYS;
  [ActionTypes.UpdateActivitySectionRefresh]: string;
  [ActionTypes.UpdateAutoLockTimeLimit]: number;
  [ActionTypes.UpdateNetwork]: NetworkChain;
  [ActionTypes.UpdateAccount]: HooksWallet.CurrentAccount;
  [ActionTypes.UpdateBalance]: BigNumber;
}

export type AppActions =
  ActionMap<ActionPayload>[keyof ActionMap<ActionPayload>];
