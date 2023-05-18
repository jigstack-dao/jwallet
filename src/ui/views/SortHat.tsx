import React, { useEffect, useState } from 'react';

import { Redirect } from 'react-router-dom';
import { useWallet, getUiType, useApproval } from 'ui/utils';
import { Spin } from 'ui/component';
import Routes from '@/constant/routes';

const SortHat = () => {
  const wallet = useWallet();
  const [to, setTo] = useState('');
  // eslint-disable-next-line prefer-const
  let [getApproval, , rejectApproval] = useApproval();

  const loadView = async () => {
    const UIType = getUiType();
    const isInNotification = UIType.isNotification;
    const isInTab = UIType.isTab;
    let approval = await getApproval();

    if (isInNotification && !approval) {
      setTo('/dashboard');
      window.resizeTo(400, 600);
      return;
    }

    if (!isInNotification) {
      // chrome.window.windowFocusChange won't fire when
      // click popup in the meanwhile notification is present
      await rejectApproval();
      approval = undefined;
    }

    if (!(await wallet.isBooted())) {
      setTo(Routes.Welcome);
      return;
    }

    if (!(await wallet.isUnlocked())) {
      setTo(Routes.Unlock);
      return;
    }

    if ((await wallet.hasPageStateCache()) && !isInNotification && !isInTab) {
      const cache = await wallet.getPageStateCache()!;
      setTo(cache.path);
      return;
    }

    if ((await wallet.getPreMnemonics()) && !isInNotification && !isInTab) {
      setTo(Routes.CreateMnemonics);
      return;
    }

    const currentAccount = await wallet.getCurrentAccount();

    if (!currentAccount) {
      setTo(Routes.NoAddress);
    } else if (approval) {
      setTo('/approval');
    } else {
      setTo('/dashboard');
    }
  };

  useEffect(() => {
    loadView();
  }, []);

  return <Spin spinning={!to}>{to && <Redirect to={to} />}</Spin>;
};

export default SortHat;
