import Routes from '@/constant/routes';
import SearchField from '@/ui/component/SearchField';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import './style.less';
import { ReactComponent as ArrowLeft } from '@/ui/assets/jwallet/arrow-left.svg';
import useNetwork from '@/hooks/wallet/useNetwork';
import { useDebounce } from 'react-use';
import useLoadingScreen from '@/hooks/wallet/useLoadingScreen';
import PrimaryButton from '@/ui/component/Buttons/PrimaryButton';
import { useWallet } from '@/ui/utils';
import TokenCard from './components/TokenCard';
import NotFoundToken from './components/NotFoundToken';
import usePageStateCache from '@/hooks/wallet/usePageStateCache';
import { ReactComponent as PlusIcon } from '@/ui/assets/jwallet/plusWhite.svg';
import { TokenSaved } from '@/background/service/permission';
import { useLifiTokens } from '@/hooks/lifi';
import { AddressZero } from '@/constant';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

const loadingIndicator = (
  <LoadingOutlined
    style={{ fontSize: 48, color: 'white', opacity: '.5' }}
    spin
  />
);

const SearchToken = () => {
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isNotFound, setIsNotFound] = useState(false);
  useDebounce(
    () => {
      setIsNotFound(false);
      setDebouncedSearch(searchText.toLowerCase());
    },
    500,
    [searchText]
  );
  const [tokens, setTokens] = useState<TokenSaved[]>([]);
  const [searched, setSearched] = useState(false);
  const [selectedAddressToken, setSelectedAddressToken] = useState<string[]>(
    []
  );
  const { updateLoadingScreen } = useLoadingScreen();
  const history = useHistory();
  const { currentNetwork } = useNetwork();
  const wallet = useWallet();
  const [tokenSavedAddress, setTokenSavedAddress] = useState<string[]>([]);
  const { saveCachePatch, clearCachePage } = usePageStateCache();
  const tokenQuery = useLifiTokens(currentNetwork.chainId);

  const onBack = () => {
    clearCachePage();
    history.push(Routes.Dashboard);
  };

  useEffect(() => {
    saveCachePatch();
  }, []);

  useEffect(() => {
    void (async () => {
      const tokenSaved = await wallet.getTokensByChainId(
        currentNetwork.chainId
      );
      const _tokenSavedAddress = tokenSaved.map((x) => x.address);
      setTokenSavedAddress(_tokenSavedAddress);
    })();
  }, [currentNetwork]);

  useEffect(() => {
    void (async () => {
      try {
        updateLoadingScreen(true);
        if (!searched) {
          setSearched(true);
        }
        const rawTokens = tokenQuery.data || [];
        const _tokens = rawTokens.reduce((prev: any, x) => {
          if (
            (!tokenSavedAddress.includes(x.address) ||
              x.address != AddressZero) &&
            (x.address.toLowerCase().includes(debouncedSearch) ||
              x.name.toLowerCase().includes(debouncedSearch) ||
              x.symbol.toLowerCase().includes(debouncedSearch))
          ) {
            return [...prev, x];
          }
          return prev;
        }, []) as any as TokenSaved[];
        setTokens(_tokens);
        setIsNotFound(_tokens.length == 0 && debouncedSearch.length > 0);
      } catch (error) {
        console.log(error);
        setTokens([]);
      } finally {
        updateLoadingScreen(false);
      }
    })();
  }, [debouncedSearch, currentNetwork, tokenSavedAddress]);

  const handleSelectToken = (address: string) => {
    const _selectedAddressToken = [...selectedAddressToken];
    if (_selectedAddressToken.includes(address)) {
      setSelectedAddressToken(
        _selectedAddressToken.filter((x) => x != address)
      );
    } else {
      setSelectedAddressToken([..._selectedAddressToken, address]);
    }
  };

  const handleImportToken = async () => {
    const tokensImport = tokens.filter((x: any) =>
      selectedAddressToken.includes(x.address)
    );
    await wallet.importTokens(tokensImport);
    history.push(Routes.Dashboard);
  };

  return (
    <div id="search-token-container">
      <div className="title">
        <div onClick={onBack} className="back hover-overlay rounded-lg">
          <ArrowLeft />
        </div>
        <div className="text">Add Token</div>
      </div>
      <div className="mb-6">
        <SearchField
          value={searchText}
          onChange={(value) => setSearchText(value)}
          placeholder="Search Token"
        />
      </div>
      {searched && tokens.length > 0 && (
        <>
          <div className="search-results">Search results</div>
          <div className="tokens thin-scrollbar">
            {tokenQuery.isLoading && (
              <div className="flex w-full h-full justify-center items-center">
                <Spin indicator={loadingIndicator} />
              </div>
            )}
            {!tokenQuery.isLoading &&
              tokens.map((x: any) => (
                <TokenCard
                  key={x.address}
                  img={x.img}
                  name={x.name}
                  symbol={x.symbol}
                  checked={selectedAddressToken.includes(x.address)}
                  handleSelectToken={() => handleSelectToken(x.address)}
                />
              ))}
          </div>
        </>
      )}

      {isNotFound && <NotFoundToken />}
      {searched && tokens.length > 0 && (
        <PrimaryButton
          text="IMPORT TOKEN"
          onClick={handleImportToken}
          disabled={selectedAddressToken.length == 0}
        />
      )}
      {((searched && tokens.length === 0) || !searched) && (
        <div className="add-custom-btn flex justify-center font-[600] text-[14px] text-[#fff] mt-[10px]">
          <div
            className="flex justify-center cursor-pointer items-center hover-overlay w-fit p-2 rounded-lg"
            onClick={() => history.push(Routes.AddCustomToken)}
          >
            <PlusIcon className="fill-white mr-[10px]" /> Add custom
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchToken;
