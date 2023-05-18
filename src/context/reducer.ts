import { ActionTypes, AppActions } from './actions';
import { v4 as uuidv4 } from 'uuid';
import { defaultNetwork, TAB_SANTA_KEYS } from '@/constant';
import { NetworkChain } from '@/background/service/permission';
import { HooksWallet } from '@/hooks/types';
import { BigNumber } from 'ethers';

export interface InitialAppState {
  isOpenModalCreateAccount: boolean;
  isOpenAccountDropdown: boolean;
  refreshUseHooks: {
    Wallet_CurrentAccount: string;
    Wallet_Accounts: string;
    Wallet_Network: string;
    Account_Balance: string;
    Connected_Site: string;
  };
  loadingScreen: boolean;
  santa: {
    tab: TAB_SANTA_KEYS;
  };
  activitySection: {
    refresh: string;
  };
  autoLockTimeLimit: number;
  currentNetwork: NetworkChain;
  currentAccount: HooksWallet.CurrentAccount;
  accountBalance: BigNumber;
}
export const initialState: InitialAppState = {
  isOpenModalCreateAccount: false,
  isOpenAccountDropdown: false,
  refreshUseHooks: {
    Wallet_CurrentAccount: uuidv4(),
    Wallet_Accounts: uuidv4(),
    Wallet_Network: uuidv4(),
    Account_Balance: uuidv4(),
    Connected_Site: uuidv4(),
  },
  loadingScreen: false,
  santa: {
    tab: TAB_SANTA_KEYS.SendGift,
  },
  activitySection: {
    refresh: uuidv4(),
  },
  autoLockTimeLimit: 5, // unit minutes
  currentNetwork: {
    ...defaultNetwork,
    rpcURL: '',
  },
  currentAccount: {
    address: '',
    alianName: '',
    type: '',
    brandName: '',
    shortAddress: '',
    originalAddress: '',
  },
  accountBalance: BigNumber.from(0),
};

export const rootReducer = (state: InitialAppState, action: AppActions) => {
  switch (action.type) {
    case ActionTypes.UpdateIsOpenModalCreateAccount:
      return {
        ...state,
        isOpenModalCreateAccount: action.payload,
      };
    case ActionTypes.UpdateIsOpenDropdownAccount:
      return {
        ...state,
        isOpenAccountDropdown: action.payload,
      };

    case ActionTypes.UpdateRefreshUseHooks: {
      const keys = action.payload;
      const { refreshUseHooks } = state;
      keys.forEach((key) => {
        if (key in refreshUseHooks) {
          refreshUseHooks[key] = uuidv4();
        }
      });
      return {
        ...state,
        refreshUseHooks,
      };
    }
    case ActionTypes.UpdateLoadingScreen: {
      return { ...state, loadingScreen: action.payload };
    }
    case ActionTypes.UpdateSantaTab: {
      return {
        ...state,
        santa: {
          ...state.santa,
          tab: action.payload,
        },
      };
    }
    case ActionTypes.UpdateActivitySectionRefresh: {
      return {
        ...state,
        activitySection: {
          ...state.activitySection,
          refresh: action.payload,
        },
      };
    }
    case ActionTypes.UpdateAutoLockTimeLimit: {
      return {
        ...state,
        autoLockTimeLimit: action.payload,
      };
    }
    case ActionTypes.UpdateAccount: {
      return {
        ...state,
        currentAccount: action.payload,
      };
    }
    case ActionTypes.UpdateNetwork: {
      return {
        ...state,
        currentNetwork: action.payload,
      };
    }
    case ActionTypes.UpdateBalance: {
      return {
        ...state,
        accountBalance: action.payload,
      };
    }
    default:
      return { ...state };
  }
};
