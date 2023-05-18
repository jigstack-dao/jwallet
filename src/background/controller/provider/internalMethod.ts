import {
  permissionService,
  keyringService,
  preferenceService,
  widgetService,
} from 'background/service';
import providerController from './controller';

const tabCheckin = ({
  data: {
    params: { origin, name, icon },
  },
  session,
}) => {
  session.setProp({ origin, name, icon });
};

const getProviderState = async (req) => {
  const {
    session: { origin },
  } = req;

  const chainId = permissionService.getWithoutUpdate(origin)?.chainId;
  const isUnlocked = keyringService.memStore.getState().isUnlocked;
  return {
    chainId,
    isUnlocked,
    accounts: isUnlocked ? await providerController.ethAccounts(req) : [],
    networkVersion: await providerController.netVersion(req),
  };
};

const providerOverwrite = ({
  data: {
    params: [val],
  },
}) => {
  preferenceService.setHasOtherProvider(val);
  return true;
};

const hasOtherProvider = () => {
  preferenceService.setHasOtherProvider(true);
  return true;
};

const isDefaultWallet = () => {
  return preferenceService.getIsDefaultWallet();
};

const isWidgetDisabled = ({
  data: {
    params: [name],
  },
}) => {
  return widgetService.isWidgetDisabled(name);
};

export default {
  tabCheckin,
  getProviderState,
  providerOverwrite,
  hasOtherProvider,
  isDefaultWallet,
  isWidgetDisabled,
};
