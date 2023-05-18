import PrimaryButton from '@/ui/component/Buttons/PrimaryButton';
import InputText from '@/ui/component/Inputs/InputText';
import './style.less';
import Routes from '@/constant/routes';
import { ReactComponent as ArrowLeft } from '@/ui/assets/jwallet/arrow-left.svg';
import { useHistory } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { isAddress } from 'web3-utils';
import { apiConnection } from '@/utils/api';
import useNetwork from '@/hooks/wallet/useNetwork';
import { useWallet } from '@/ui/utils';
import useLoadingScreen from '@/hooks/wallet/useLoadingScreen';
import usePageStateCache from '@/hooks/wallet/usePageStateCache';
import { JsonRpcProvider } from '@ethersproject/providers';
import ERC20Service from '@/ui/services/contracts/ERC20';
import { useDebounce } from 'react-use';

const AddCustomToken = () => {
  const [form, setForm] = useState({
    address: '',
    decimal: '',
    symbol: '',
  });
  const [metaData, setMetaData] = useState({
    id: 0,
    img: '',
    name: '',
    standard: '',
    createdAt: new Date().getTime(),
  });
  const [errors, setErrors] = useState<{
    address: undefined | string;
    decimal: undefined | string;
    symbol: undefined | string;
  }>({
    address: undefined,
    decimal: undefined,
    symbol: undefined,
  });
  const [tokenSavedAddress, setTokenSavedAddress] = useState<string[]>([]);
  const history = useHistory();
  const { currentNetwork } = useNetwork();
  const wallet = useWallet();
  const { saveCachePatch, clearCachePage } = usePageStateCache();
  // const currentProvider = useMemo(
  //   () => new JsonRpcProvider(currentNetwork.rpcURL),
  //   [currentNetwork.rpcURL]
  // );

  useEffect(() => {
    saveCachePatch();
    return () => {
      clearCachePage();
    };
  }, []);

  const onBack = () => {
    clearCachePage();
    history.push(Routes.Dashboard);
  };
  const { updateLoadingScreen } = useLoadingScreen();
  const validateAddressToken = (address: string) => {
    if (!isAddress(address)) return 'This address is invalid';
    if (
      tokenSavedAddress
        .map((x) => x.toLowerCase())
        .includes(address.toLowerCase())
    )
      return 'Token has already been added.';
    return undefined;
  };
  const onFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const _errors = { ...errors };
    switch (name) {
      case 'address':
        _errors.address = validateAddressToken(value);
        setForm({ ...form, address: value });
        break;
      case 'decimal':
        if (new RegExp('^[0-9]+$').test(value) || value == '') {
          setForm({ ...form, decimal: value });
        }
        break;
      case 'symbol':
        setForm({ ...form, symbol: value });
        break;
      default:
        break;
    }
    setErrors(_errors);
  };

  useEffect(() => {
    void (async () => {
      const tokenSaved = await wallet.getTokensByChainId(
        currentNetwork.chainId
      );
      const _tokenSavedAddress = tokenSaved.map((x) => x.address);
      setTokenSavedAddress(_tokenSavedAddress);
    })();
  }, [currentNetwork.chainId]);

  useDebounce(
    () => {
      void (async () => {
        if (!isAddress(form.address) || errors.address != undefined) return;

        const params = {
          search: form.address,
          chainId: currentNetwork.chainId.toString(),
          pageSize: '10',
          pageIndex: '1',
        };
        const API = apiConnection(process.env.REACT_APP_JWALLET_API || '', {});
        try {
          const { data } = await API.get(
            `/token?${new URLSearchParams(params).toString()}`
          );
          if (data.data.data.length > 0) {
            setForm((prev) => ({
              ...prev,
              decimal: data.data.data[0].decimal.toString(),
              symbol: data.data.data[0].symbol,
            }));
            setMetaData({
              id: data.data.data[0].id,
              img: data.data.data[0].img,
              name: data.data.data[0].name,
              standard: data.data.data[0].standard,
              createdAt: data.data.data[0].createdAt,
            });
          } else {
            throw new Error('api failed');
          }
        } catch (err) {
          const provider = new JsonRpcProvider(currentNetwork.rpcURL);
          const erc20Service = new ERC20Service(form.address, provider);
          const metadata = await erc20Service.getMetadata();
          setForm((prev) => ({
            ...prev,
            decimal: metadata.decimals.toString(),
            symbol: metadata.symbol,
          }));
        }
      })();
    },
    500,
    [form.address, currentNetwork.chainId, currentNetwork.rpcURL]
  );

  const disabledSubmit = () => {
    return (
      Object.values(form).some((x) => x.length == 0) ||
      Object.values(errors).some((x) => x != undefined)
    );
  };

  const onSubmit = async () => {
    try {
      updateLoadingScreen(true);
      await wallet.importTokens([
        {
          id: metaData.id,
          address: form.address,
          name: metaData.name != '' ? metaData.name : form.symbol,
          symbol: form.symbol,
          decimal: Number(form.decimal),
          img: metaData.img,
          standard: metaData.standard,
          chainId: currentNetwork.chainId,
          createdAt: metaData.createdAt,
        },
      ]);
      history.push(Routes.Dashboard);
    } catch (error) {
      console.log(error);
    } finally {
      updateLoadingScreen(false);
    }
  };

  return (
    <div id="add-custom-token">
      <div className="title">
        <div onClick={onBack} className="back hover-overlay rounded-lg">
          <ArrowLeft />
        </div>
        <div className="text">Add Token</div>
      </div>
      <div className="main">
        <div className="mb-4">
          <InputText
            name="address"
            value={form.address}
            errorMsg={errors.address}
            placeHolder="Token Contract Address"
            onChange={onFormChange}
          />
        </div>
        <div className="mb-4">
          <InputText
            name="symbol"
            value={form.symbol}
            placeHolder="Token Symbol"
            onChange={onFormChange}
          />
        </div>
        <div>
          <InputText
            name="decimal"
            value={form.decimal}
            placeHolder="Token Decimal"
            onChange={onFormChange}
          />
        </div>
      </div>
      <PrimaryButton
        text="ADD TOKEN"
        disabled={disabledSubmit()}
        onClick={onSubmit}
      />
    </div>
  );
};

export default AddCustomToken;
