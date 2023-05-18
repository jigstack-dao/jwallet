import { useWallet } from '@/ui/utils';
import { isValidDotComURL, isValidPrefixURL } from '@/utils/validate-values';
import { ethers } from 'ethers';
import { isEqual, omit } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { numberToHex } from 'web3-utils';
import safeChainsList from '@/constant/networks/networkInfo.json';
import { useLocation } from 'react-router-dom';
import { NetworkChain } from '@/background/service/permission';
import { decodeQs } from '@/ui/utils/qs';

export const defaultFormAddCustomNetwork = {
  networkName: '',
  rpcURL: '',
  chainId: '',
  symbol: '',
  explorerURL: '',
};

const defaultError = {
  networkName: undefined,
  rpcURL: undefined,
  chainId: undefined,
  symbol: undefined,
  explorerURL: undefined,
};

interface ErrorForm {
  networkName: undefined | string;
  rpcURL: undefined | string;
  chainId: undefined | string;
  symbol: undefined | string;
  explorerURL: undefined | string;
}

export const useAddCustomNetwork = () => {
  const [form, setForm] = useState(defaultFormAddCustomNetwork);
  const [errors, setErrors] = useState<ErrorForm>(defaultError);
  const [validNetwork, setValidNetwork] = useState(defaultFormAddCustomNetwork);
  const [listChainId, setListChainId] = useState<number[]>([]);
  const [old, setOld] = useState(0);
  const wallet = useWallet();
  const location = useLocation();
  const query = useMemo(() => {
    return decodeQs(location.search);
  }, [location.search]);

  useEffect(() => {
    void (async () => {
      try {
        const _old = query?.old || 0;
        const _listChains: NetworkChain[] = await wallet.getAllNetworks();
        const _listChainId = _listChains.reduce((prev: number[], curr) => {
          if (curr.chainId != +_old) {
            return [...prev, curr.chainId];
          }
          setForm({
            chainId: curr.chainId.toString(),
            explorerURL: curr.scanLink,
            networkName: curr.name,
            rpcURL: curr.rpcURL,
            symbol: curr.symbol,
          });
          setOld(+_old);
          return prev;
        }, []);
        setListChainId(_listChainId);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [query]);

  const mapValidNetwork = (chainId: string, rpc: string) => {
    const item = safeChainsList.find((x) => x.chainId.toString() == chainId);
    if (item) {
      return {
        networkName: item.name,
        rpcURL: rpc,
        chainId,
        symbol: item.nativeCurrency.symbol,
        explorerURL: item.explorers?.[0]?.url || '',
      };
    }
    return defaultFormAddCustomNetwork;
  };

  const validateChainId = async (chainId: string, fetchedChainId?: string) => {
    if (chainId == '') return undefined;
    let correctChain: string;
    if (fetchedChainId) {
      correctChain = fetchedChainId;
    } else {
      const network = await provider.getNetwork();
      correctChain = network.chainId.toString();
    }
    let hexStrChain = '';
    const isHexStr = chainId.startsWith('0x');
    if (!isHexStr) {
      if (chainId.startsWith('0'))
        return 'Invalid number. Remove any leading zeros.';
      try {
        hexStrChain = numberToHex(`${chainId}`);
      } catch (error) {
        return 'Invalid hexadecimal number.';
      }
    } else {
      hexStrChain = chainId;
    }

    if (listChainId.includes(Number(hexStrChain))) {
      return 'The Chain ID currently exists in the wallet';
    }

    const validUpdated = !isEqual(validNetwork, defaultFormAddCustomNetwork);
    if (validUpdated) {
      return hexStrChain
        ? undefined
        : 'Chain ID could not be obtained. Is the RPC URL correct?';
    }
    if (correctChain !== chainId) {
      return 'The Chain ID not correct';
    }
    return undefined;
  };

  const checkValidURL = (url: string, errorMsg: string) => {
    if (!isValidPrefixURL(url)) return 'URIs require an HTTP/HTTPS prefix.';
    if (!isValidDotComURL(url)) return errorMsg;
    return undefined;
  };

  const onChangeForm = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (!(name in form)) return;
    setForm((old) => ({ ...old, [name]: value }));

    if (value.length == 0) {
      setErrors({ ...errors, [name]: undefined });
      return;
    }

    // handle validate Form
    switch (name) {
      case 'rpcURL': {
        const isError = checkValidURL(value, 'Invalid RPC URL');
        setErrors((old) => ({ ...old, rpcURL: isError }));
        if (isError != undefined) break;

        const provider = new ethers.providers.JsonRpcProvider(value);
        if (provider) {
          try {
            const network = await provider.getNetwork();
            const correctChain = network.chainId.toString();
            correctChain &&
              setForm((old) => ({
                ...old,
                chainId: correctChain,
                rpcURL: value.trim(),
              }));
            const validNetwork = mapValidNetwork(
              network.chainId.toString(),
              value.trim()
            );
            setValidNetwork(validNetwork);
            setForm(validNetwork);
            const chainErr = await validateChainId(
              network.chainId.toString(),
              network.chainId.toString()
            );
            setErrors((old) => ({ ...old, chainId: chainErr }));
          } catch (err) {
            setErrors((old) => ({
              ...old,
              chainId:
                'Chain ID could not be obtained. Is the RPC URL correct?',
            }));
            setForm((old) => ({ ...old, chainId: '' }));
          }
        }
        break;
      }

      case 'chainId': {
        setErrors({ ...errors, chainId: await validateChainId(value) });
        break;
      }

      case 'symbol': {
        setErrors({ ...errors, chainId: await validateChainId(value) });
        break;
      }

      case 'explorerURL': {
        setErrors({
          ...errors,
          explorerURL: checkValidURL(value, 'Invalid explorer URL'),
        });
        break;
      }

      default:
        break;
    }
  };

  const provider = useMemo(() => {
    return new ethers.providers.JsonRpcProvider(form.rpcURL);
  }, [form.rpcURL]);

  const validForm = useMemo(() => {
    return (
      Object.values(errors).every((x) => x == undefined) &&
      Object.values(omit(form, ['explorerURL'])).every((x) => x != '')
    );
  }, [form, errors]);

  return { form, errors, onChangeForm, validForm, setForm, old };
};
