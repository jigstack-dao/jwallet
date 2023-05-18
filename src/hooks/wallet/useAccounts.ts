import { KEYRING_TYPE } from '@/constant';
import { useAppContext } from '@/context';
import { useWallet } from '@/ui/utils';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { HooksWallet } from '../types';

const useAccounts = () => {
  const wallet = useWallet();
  const [accounts, setAccounts] = useState<HooksWallet.Accounts[]>([]);
  const { appState } = useAppContext();

  useEffect(() => {
    void (async () => {
      let _accounts = await wallet.getAllVisibleAccountsArray();
      const allNames = await wallet.getAllAlianName();

      _accounts = _accounts.filter(
        (item) => item.type !== KEYRING_TYPE.GnosisKeyring
      );

      const accMapping = _accounts.map((x) => {
        const n = _.find(allNames, { address: x.address });
        return {
          type: x.type,
          brandName: x.brandName,
          address: x.address,
          alianName: n ? n.name : '',
        };
      });
      setAccounts(accMapping);
    })();
  }, [appState.refreshUseHooks.Wallet_Accounts]);

  return accounts;
};

export default useAccounts;
