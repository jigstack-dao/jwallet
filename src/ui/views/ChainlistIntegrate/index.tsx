/* eslint-disable no-template-curly-in-string */
import React, {
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Dropdown, { IDropdownItem } from '@/ui/component/Dropdown';
import Networks from '@/constant/networks/networkInfo.json';
import { debounce } from 'lodash';
import InputText from '@/ui/component/Inputs/InputText';
import { getChainIcon, getNetworkInfo } from '@/constant/networks';
import RpcsDropdown, { RPCInfo } from '@/ui/component/RpcsDropdown';
import allExtraRpcs, { RPC } from '@/constant/networks/extraRpcs';
import { removeEndingSlashObject } from '@/utils/misc';
import useRPCQueries from '@/hooks/queries/useRPCQueries';
import StrayButtons from '@/ui/component/Buttons/StrayButtons';
import { useWallet } from '@/ui/utils';
import { decodeQs } from '@/ui/utils/qs';
import { NetworkChain } from '@/background/service/permission';
import { useAppContext } from '@/context';
import { ActionTypes, RefreshUseHooks } from '@/context/actions';
import Routes from '@/constant/routes';

import './style.less';
// import { ReactComponent as AttentionIcon } from '@/ui/assets/jwallet/attention.svg';
import { ReactComponent as ChainlistLogo } from 'ui/assets/jwallet/chainlist.svg';
import { ReactComponent as ArrowLeft } from '@/ui/assets/jwallet/arrow-left.svg';

export interface NetworkInfo {
  chainId: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  explorers: string[];
  rpc: string[];
}

const defaultForm = {
  symbol: '',
  explorerURL: '',
};

const ChainLabel: FC<{ name: string; img: string; chainId: number }> = memo(
  function ChainLabel({ name, img, chainId }) {
    return (
      <div className="flex items-center">
        <div className="w-6 h-6 rounded-full mr-2 overflow-hidden">
          <img src={img} alt="" />
        </div>
        <div>
          <div>{name}</div>
          <div className="text-12"> chain ID: {chainId}</div>
        </div>
      </div>
    );
  }
);

const chains: Array<IDropdownItem<NetworkInfo>> = Networks.map(
  ({ name, rpc, explorers, chainId, nativeCurrency }) => ({
    id: chainId,
    label: (
      <ChainLabel chainId={chainId} name={name} img={getChainIcon(chainId)} />
    ),
    value: {
      chainId,
      nativeCurrency,
      name,
      rpc,
      explorers: explorers?.map(({ url }) => url) || [],
    },
  })
);

const Chainlist: FC = (props) => {
  const [selected, setSelected] = useState<NetworkInfo>();
  const [searchText, setSearchText] = useState('');
  const [filteredChains, setFilteredChains] = useState(chains);
  const [form, setForm] = useState(defaultForm);
  const [rpcs, setRpcs] = useState<RPC[]>([]);
  const [selectedRPC, setSelectedRPC] = useState<RPCInfo>();
  const [listChainId, setListChainId] = useState<number[]>([]);
  const [old, setOld] = useState(0);
  const { search } = useLocation();
  const wallet = useWallet();
  const history = useHistory();
  const { dispatch } = useAppContext();
  const pathQuery = useMemo(() => {
    return decodeQs(search);
  }, [search]);

  const fetchRpcs = (chain: NetworkInfo) => {
    const extraRpcs = allExtraRpcs[chain.chainId]?.rpcs;
    if (extraRpcs) {
      const _rpcs: RPC[] = chain.rpc
        .filter((rpc) => !rpc.includes('${INFURA_API_KEY}'))
        .map(removeEndingSlashObject);
      const cloned = [..._rpcs];
      extraRpcs.forEach((rpc) => {
        const rpcObj = removeEndingSlashObject(rpc);
        if (rpcObj.url.includes('${INFURA_API_KEY}')) {
          return;
        }
        if (cloned.find((r) => r.url === rpcObj.url) === undefined) {
          _rpcs.push(rpcObj);
        }
      });
      setRpcs(_rpcs);
    } else {
      setRpcs(
        chain.rpc
          .filter((rpc) => !rpc.includes('${INFURA_API_KEY}'))
          .map(removeEndingSlashObject)
      );
    }
  };

  const fetchNetworkAsync = async (old: NetworkChain) => {
    setForm({
      explorerURL: old.scanLink,
      symbol: old.symbol,
    });
    const networkInfo = getNetworkInfo(old.chainId);
    const chain = {
      chainId: +old.chainId,
      explorers: [old.scanLink],
      name: old.name,
      nativeCurrency: {
        decimals: old.decimals,
        name: old.name,
        symbol: old.symbol,
      },
      rpc: networkInfo?.rpc || [],
    };
    setSelected(chain);
    fetchRpcs(chain);
    // only need rpc URL for initial state
    setSelectedRPC({
      height: 0,
      latency: 0,
      url: old.rpcURL,
    });
  };

  const onBack = () => {
    history.goBack();
  };

  const queries = useRPCQueries(rpcs);
  const sortedData = useMemo(() => {
    return queries
      ?.sort((a, b) => {
        if (a.isLoading) {
          return 1;
        }

        const h1 = a?.data?.height || 0;
        const h2 = b?.data?.height;
        const l1 = a?.data?.latency || 0;
        const l2 = b?.data?.latency || 0;

        if (!h2) {
          return -1;
        }

        if (h2 - h1 > 0) {
          return 1;
        }
        if (h2 - h1 < 0) {
          return -1;
        }
        if (l1 - l2 < 0) {
          return -1;
        } else {
          return 1;
        }
      })
      .map((query) => ({
        url: query.data?.rpc.url || '',
        tracking: query.data?.rpc.tracking,
        trackingDetails: query.data?.rpc.trackingDetails,
        latency: query.data?.latency || null,
        height: query.data?.height || null,
      }));
  }, [queries]);

  const chainErr = useMemo(() => {
    if (listChainId.includes(selected?.chainId || -1)) {
      return 'This Chain ID currently exists in the wallet';
    }
    return '';
  }, [selected?.chainId]);

  const handleFilterChains = useCallback(
    debounce((search) => {
      const filtered = chains.filter(({ value: network }) => {
        const _search = search.trim().toLowerCase();
        return (
          network.chainId.toString().includes(_search) ||
          network.name.toLowerCase().includes(_search) ||
          network.nativeCurrency.symbol.toLowerCase().includes(_search)
        );
      });
      setFilteredChains(filtered);
    }, 500),
    []
  );

  const onSearchChange = useCallback((search: string) => {
    setSearchText(search);
    handleFilterChains(search);
  }, []);

  const onSelect = (item: NetworkInfo) => {
    setSelected(item);
    setForm({
      explorerURL: item.explorers[0] || '',
      symbol: item.nativeCurrency.symbol,
    });
    if (item.chainId != selected?.chainId) {
      setSelectedRPC(undefined);
    }
    fetchRpcs(item);
  };

  const onSubmit = async () => {
    if (!selected) return;
    await wallet.upsertNetwork(
      {
        chainId: selected.chainId,
        name: selected.name,
        symbol: form.symbol,
        decimals: selected.nativeCurrency.decimals,
        scanLink: form.explorerURL,
        rpcURL: selectedRPC?.url || '',
      },
      old
    );
    dispatch({
      type: ActionTypes.UpdateRefreshUseHooks,
      payload: [RefreshUseHooks.Wallet_Network],
    });
    history.replace({
      pathname: Routes.Dashboard,
    });
  };

  useEffect(() => {
    void (async () => {
      try {
        const _old = pathQuery?.old || 0;
        const _listChains: NetworkChain[] = await wallet.getAllNetworks();
        const _listChainId = _listChains.reduce((prev: number[], curr) => {
          if (curr.chainId != +_old) {
            return [...prev, curr.chainId];
          }
          setOld(+_old);
          fetchNetworkAsync(curr);
          return prev;
        }, []);
        setListChainId(_listChainId);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  return (
    <div>
      <div className="w-full flex items-center mb-[30px] relative justify-between h-8">
        <div
          onClick={onBack}
          className="hover-overlay rounded-md hover:cursor-pointer"
        >
          <ArrowLeft />
        </div>
        <div className="absolute left-0 right-0 top-0 bottom-0 m-auto w-32 h-8">
          <ChainlistLogo className="w-full h-full" />
        </div>
      </div>
      <div className="mb-4">
        <Dropdown
          placeHolder="Select EVM network"
          isValid={!!selected}
          options={filteredChains || []}
          allowSearch
          searchText={searchText}
          onSearchChange={onSearchChange}
          onChange={(item) => onSelect(item.value)}
          selected={
            selected && {
              label: selected.name,
              value: selected,
              id: selected.chainId,
            }
          }
        />
      </div>
      {selected && (
        <>
          <div className="mb-4">
            <RpcsDropdown
              options={sortedData}
              onChange={setSelectedRPC}
              selected={selectedRPC}
              placeHolder="Select RPC"
              isValid={!!selectedRPC}
            />
          </div>
          <div className="mb-4">
            <InputText
              placeHolder="Chain ID"
              name="chainId"
              value={selected.chainId.toString()}
              onChange={() => {}}
              errorMsg={chainErr}
            />
          </div>
          <div className="mb-4">
            <InputText
              placeHolder="Currency symbol"
              name="symbol"
              value={form.symbol}
              onChange={(e) =>
                setForm((old) => ({ ...old, symbol: e.target.value }))
              }
            />
          </div>
          <div className="mb-4">
            <InputText
              placeHolder="Block explorer URL (optional)"
              name="explorerURL"
              value={form.explorerURL}
              onChange={(e) =>
                setForm((old) => ({ ...old, explorerURL: e.target.value }))
              }
            />
          </div>
          {/* <div className="flex mb-[50px]">
            <div className="mr-[10px]">
              <AttentionIcon />
            </div>
            <div className="text-[#FFA877]">
              Warning: A malicious network provider can lie about the state of
              the blockchain and record your network activity. Only add custom
              networks you trust.
            </div>
          </div> */}
          <div>
            <StrayButtons
              nextTitle="SAVE"
              disabledNext={!!chainErr || !selected || !selectedRPC}
              onNext={onSubmit}
              onBack={onBack}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Chainlist;
