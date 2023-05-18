import { renderBalanceToken, stringToBigNumber } from '@/utils/format';
import useCurrentAccount from '@/hooks/wallet/useCurrentAccount';
import useNetwork from '@/hooks/wallet/useNetwork';
import { ReactComponent as SwapIcon } from '@/ui/assets/jwallet/swap.svg';
import Header from '@/ui/component/Layouts/Header';
import TitleFeatureDashboard from '@/ui/component/Layouts/TitleFeatureDashboard';
import { useWallet } from '@/ui/utils';
import LIFI, {
  Chain,
  Order,
  Orders,
  Process,
  Route,
  RouteOptions,
  RoutesRequest,
  Step,
  Token,
  TokenAmount,
  ToolsResponse,
} from '@lifi/sdk';
import { ContractTransaction, ethers, Signer } from 'ethers';
import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import SelectTokenFrom from './Components/SelectTokenFrom';
import './style.less';
import useLoadingScreen from '@/hooks/wallet/useLoadingScreen';
import {
  AddressZero,
  BIG_NUMBER_ZERO,
  KEYRING_TYPE,
  MaxUint256,
} from '@/constant';
import Routes from '@/constant/routes';
import { useHistory } from 'react-router-dom';
import SelectChain from './Components/SelectChain';
import PrimaryButton from '@/ui/component/Buttons/PrimaryButton';
import SelectTokenTo from './Components/SelectTokenTo';
import { NetworkChain } from '@/background/service/permission';
import { isAddress } from 'web3-utils';
import FetchingQuotes from './Components/FetchingQuotes';
import ConfirmStep from './Components/Confirm';
import { ERC20ABI } from '@/constant/abi';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import Dropdown, { IDropdownItem } from '@/ui/component/Dropdown';
import InputText from '@/ui/component/Inputs/InputText';
import MultiDropdown from '@/ui/component/MultiDropdown';
import Checkbox from '@/ui/component/CheckboxV2';
import { ReactComponent as PlusIcon } from '@/ui/assets/jwallet/plusWhite.svg';
import { ReactComponent as MinusIcon } from '@/ui/assets/jwallet/minusWhite.svg';
import ERC20Service from '@/ui/services/contracts/ERC20';
import { BigNumber } from '@ethersproject/bignumber';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { TransactionType } from '@/background/service/transactionHistory';
import { isNativeCoin } from 'utils';
import { AbortWrapper } from '@/ui/utils/abortable';
import Accordion from '@/ui/component/Accordion';
import { getNetworkInfo } from '@/constant/networks';

export interface TokenSwap {
  chainId: number;
  address: string;
  symbol: string;
  decimals: number;
  logoURI: string;
}

const NATIVE_ADDRESS_TOKEN = '0x0000000000000000000000000000000000000000';

enum SwapBridgeSteps {
  SelectToken,
  FetchingQuote,
  Confirm,
  Execution,
  QRConfirm,
}

export interface LifiRouteStep {
  executionDuration: number;
  amountUSD: string;
  priceImpact: string;
}

const defaultTokenSelected = {
  address: '',
  symbol: '',
  decimals: 0,
  chainId: 0,
  name: '',
  priceUSD: '',
  logoURI: '',
};

const WrapMessage = ({ children }) => {
  return <div className="text-orange text-14 p-4 mb-4 bg-err">{children}</div>;
};

const MAX_PROCESS = 20;

const Swap = () => {
  const [amountFrom, setAmountFrom] = useState('0');
  const [amountTo, setAmountTo] = useState('0');
  const [balanceFrom, setBalanceFrom] = useState(BIG_NUMBER_ZERO);
  const wallet = useWallet();
  const { currentNetwork } = useNetwork();
  const currentAccount = useCurrentAccount();
  const [errorAmount, setErrorAmount] = useState<string | undefined>(undefined);
  const [errorToAddress, setErrorToAddress] = useState<string | undefined>(
    undefined
  );
  const { updateLoadingScreen, loadingScreen } = useLoadingScreen();
  const [chains, setChains] = useState<NetworkChain[]>([]);
  const [chainFromId, setChainFromId] = useState<number>(0);
  const [chainToId, setChainToId] = useState<number>(0);
  const [tokensFrom, setTokensFrom] = useState<TokenAmount[]>([]);
  const [tokensTo, setTokensTo] = useState<TokenAmount[]>([]);
  const [tokenFromSelected, setTokenFromSelected] = useState<Token>({
    ...defaultTokenSelected,
  });
  const [tokenToSelected, setTokenToSelected] = useState<Token>({
    ...defaultTokenSelected,
  });
  const [balanceFromStr, setBlanceFromStr] = useState('0');
  const [balanceToStr, setBalanceToStr] = useState('0');
  const [step, setStep] = useState(SwapBridgeSteps.SelectToken);
  const [metaData, setMetaData] = useState<LifiRouteStep>({
    executionDuration: 0,
    amountUSD: '',
    priceImpact: '0.03',
  });
  const [routeSwap, setRoutSwap] = useState<Route | undefined>(undefined);
  const [lifiChains, setLifiChains] = useState<Chain[]>([]);
  const history = useHistory();
  const [tools, setTools] = useState<ToolsResponse>();

  const [openOptions, setOpenOptions] = useState(false);
  const [isMax, setIsMax] = useState(false);
  const [bridgeSelected, setBridgeSelected] = useState<IDropdownItem[]>();
  const [exchangeSelected, setExchangeSelected] = useState<IDropdownItem[]>();
  const [orderSelected, setOrderSelected] = useState<IDropdownItem>();
  const [toAddress, setToAddress] = useState(currentAccount.address);
  const [splippage, setSplippage] = useState('0.03');
  const [infiniteApproval, setInfiniteApproval] = useState(false);
  const [customGasPrice, setCustomGasPrice] = useState('');
  const [error, setError] = useState<ReactNode>();
  const [pendingProcess, setPendingProcess] = useState<Process>();
  const [nativeBalance, setNativeBalane] = useState<BigNumber>(BIG_NUMBER_ZERO);
  const [loadingProcess, setLoadingProcess] = useState(MAX_PROCESS);
  const [accordionRefresh, setAccordionRefresh] = useState(false);
  const cancelRef = useRef(false);
  const processRef = useRef<Process>();
  const cachedAddressToRef = useRef<string>('');
  const advancedRef = useRef<HTMLSpanElement>(null);
  const mounted = useRef(true);

  const currentProvider = useMemo(() => {
    const selectedChain = chains.find(
      (network) => +network.chainId === +chainFromId
    );

    if (selectedChain) {
      return new ethers.providers.JsonRpcProvider(selectedChain.rpcURL);
    } else {
      return new ethers.providers.JsonRpcProvider(currentNetwork.rpcURL);
    }
  }, [chains, chainFromId]);

  const updateCallback = (updatedRoute: Route) => {
    const step = updatedRoute.steps[0];
    if (step?.execution) {
      const { execution } = step;
      const savedProcess = processRef.current;
      if (!savedProcess) {
        const _pendingProcess = execution.process.find(
          (process) => process?.txHash && process.type === 'CROSS_CHAIN'
        );
        if (_pendingProcess?.txHash) {
          const tx = currentProvider
            .getTransaction(_pendingProcess.txHash)
            .then((txDetail) => {
              if (txDetail) {
                processRef.current = _pendingProcess;
                setPendingProcess(_pendingProcess);
                wallet.addTransactionPending({
                  ...tx,
                  ...txDetail,
                  createdAt: Math.ceil(_pendingProcess.startedAt / 1000),
                  token: {
                    ...updatedRoute.fromToken,
                    isNative: updatedRoute.fromToken.address === AddressZero,
                  },
                  tokenTo: {
                    ...updatedRoute.toToken,
                    isNative: updatedRoute.toToken.address === AddressZero,
                  },
                  amount: BigNumber.from(updatedRoute.fromAmount),
                  amountTo: BigNumber.from(updatedRoute.toAmount),
                  transactionType: TransactionType.Swap,
                });
              }
            });
        }
      }
    }
  };

  const validateAmount = (value: string) => {
    if (value.trim() === '') return undefined;
    if (isNaN(Number(value)))
      return 'Only numbers without special characters can be entered. Please insert the amount divided by a dot between the units and decimals';
    let isLimit = false;
    try {
      isLimit = stringToBigNumber(value, tokenFromSelected.decimals).gt(
        balanceFrom
      );
    } catch {
      return 'Insufficient balance';
    }
    if (isLimit) return 'Insufficient balance';
    return undefined;
  };

  const onChangeAmountTo = () => {
    try {
      const _amountTo =
        (Number(tokenFromSelected.priceUSD) /
          Number(tokenToSelected.priceUSD)) *
        Number(amountFrom);
      setAmountTo(_amountTo.toString());
    } catch (error) {
      setAmountTo('');
    }
  };

  const onChangeAmount = (value: string) => {
    if (loadingScreen) return;
    const pattern = `^\\d*\\.?\\d{0,${tokenFromSelected.decimals}}$`;
    const validCharsRegex = new RegExp(pattern);
    if (validCharsRegex.test(value) || value.length == 0) {
      setIsMax(false);
      setAmountFrom(value);
      setErrorAmount(validateAmount(value));
    }
  };

  const onChangeSwap = () => {
    if (chainFromId != chainToId) {
      const temp = chainToId;
      setChainToId(chainFromId);
      setChainFromId(temp);
    }

    const temp = { ...tokenToSelected };
    setTokenToSelected(tokenFromSelected);
    setTokenFromSelected(temp);
    setAmountFrom('');
    setAmountTo('');
    setErrorAmount(undefined);
  };

  useEffect(() => {
    void (async () => {
      setLoadingProcess((old) => --old);
      const lifi = new LIFI();
      try {
        const _lifiChains = await lifi.getChains();
        const chainsSafe = _lifiChains.map((x) => x.id);
        let _chains = await wallet.getAllNetworks();
        _chains = _chains.filter((x) => chainsSafe.includes(x.chainId));
        setChains(_chains);
        setChainFromId(_chains[0].chainId);
        setChainToId(_chains[0].chainId);
        setLifiChains(_lifiChains);
        const _tools = await lifi.getTools();
        setTools(_tools);
        setBridgeSelected(
          _tools.bridges.map((bridge) => ({
            value: bridge.key?.toLowerCase(),
            label: bridge.name?.toLowerCase(),
            id: bridge.key?.toLowerCase(),
          }))
        );
        setExchangeSelected(
          _tools.exchanges.map((exchange) => ({
            value: exchange.key,
            label: exchange.name,
            id: exchange.key,
          }))
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingProcess((old) => ++old);
      }
    })();
  }, []);

  useEffect(() => {
    if (loadingProcess >= MAX_PROCESS) {
      updateLoadingScreen(false);
    } else {
      updateLoadingScreen(true);
    }
  }, [loadingProcess]);

  useEffect(() => {
    if (cachedAddressToRef.current.toLowerCase() === toAddress.toLowerCase()) {
      setToAddress(currentAccount.address);
      setErrorToAddress(undefined);
    }
    cachedAddressToRef.current = currentAccount.address;
  }, [currentAccount.address]);

  useEffect(() => {
    const signal = new AbortController();
    AbortWrapper(async () => {
      if (chainFromId == 0) return;
      setLoadingProcess((old) => --old);
      const lifi = new LIFI();
      try {
        const [_gasPrice, _tokens] = await Promise.all([
          currentProvider.getGasPrice(),
          lifi.getTokens({ chains: [chainFromId] }),
        ]);
        setCustomGasPrice(formatUnits(_gasPrice, 9));
        const balances = await lifi.getTokenBalancesForChains(
          currentAccount.address,
          _tokens.tokens
        );
        const sorted = balances[chainFromId].sort(
          (a, b) => +b.amount - +a.amount
        );
        setTokensFrom(sorted);
        const token =
          sorted.find((x) => x.address == NATIVE_ADDRESS_TOKEN) || sorted[0];
        setTokenFromSelected(token);
      } catch (e: any) {
        console.log({ e });
      } finally {
        setLoadingProcess((old) => ++old);
      }
    }, signal.signal);
    return () => {
      signal.abort();
    };
  }, [chainFromId, currentProvider, currentAccount.address]);

  useEffect(() => {
    void (async () => {
      const signal = new AbortController();
      AbortWrapper(async () => {
        setLoadingProcess((old) => --old);
        try {
          if (chainToId == 0) return;
          const lifi = new LIFI();
          const _tokens = await lifi.getTokens(
            { chains: [chainToId] },
            { signal: signal.signal }
          );
          const balances = await lifi.getTokenBalancesForChains(
            currentAccount.address,
            _tokens.tokens
          );
          const sorted = balances[chainToId].sort(
            (a, b) => +b.amount - +a.amount
          );
          const stakToken = sorted.find((x) =>
            x.name.toLowerCase().includes('jigstack')
          );
          setTokensTo(sorted);
          setTokenToSelected(stakToken || sorted[0]);
        } catch (e: any) {
          console.log({ e });
        } finally {
          setLoadingProcess((old) => ++old);
        }
      }, signal.signal);
      return () => {
        signal.abort();
      };
    })();
  }, [chainToId, currentAccount.address]);

  const onToggleOption = (active: boolean) => {
    setOpenOptions(active);

    if (!advancedRef.current) {
      return;
    }
    if (typeof document == 'undefined') {
      return;
    }
    const extension = document.getElementById('extension');
    if (!extension) {
      return;
    }
    const offset = active
      ? advancedRef.current.getBoundingClientRect().top + window.scrollY - 80
      : 0;

    setTimeout(() => {
      extension.scrollTo({
        top: offset,
        behavior: 'smooth',
      });
    }, 350);
  };

  const fetchQuotes = async () => {
    cancelRef.current = false;
    try {
      setStep(SwapBridgeSteps.FetchingQuote);
      onChangeAmountTo();
      const LiFi = new LIFI();
      const routeOptions: RouteOptions = {
        order: orderSelected ? (orderSelected.label as Order) : Orders[0],
        slippage: Number(splippage),
        infiniteApproval,
        bridges: {
          allow:
            bridgeSelected && bridgeSelected.length != 0
              ? bridgeSelected.map((x) => x.label as string)
              : tools?.bridges.map((x) => x.key.toLowerCase()),
        },
        exchanges: {
          allow:
            exchangeSelected && exchangeSelected.length != 0
              ? exchangeSelected.map((x) => x.label as string)
              : tools?.exchanges.map((x) => x.key.toLowerCase()),
        },
        integrator: 'jwallet',
        fee: 0.005,
      };

      const routesRequest: RoutesRequest = {
        fromAddress: currentAccount.address,
        fromChainId: chainFromId,
        fromAmount: isMax
          ? balanceFrom._hex
          : stringToBigNumber(amountFrom, tokenFromSelected.decimals)._hex,
        fromTokenAddress: tokenFromSelected.address,
        toChainId: chainToId,
        toTokenAddress: tokenToSelected.address,
        options: routeOptions,
        toAddress,
      };
      const result = await LiFi.getRoutes(routesRequest);
      const route = result.routes.find((route) => !route.containsSwitchChain);
      console.log({ route });
      if (!route) {
        if (
          chainFromId === chainToId &&
          tokenFromSelected.address === tokenToSelected.address
        ) {
          setError(
            <WrapMessage>
              Source and destination assets are identical
            </WrapMessage>
          );
        } else if (!Number(amountFrom)) {
          setError(
            <WrapMessage>Please input amount of source asset</WrapMessage>
          );
        } else if (result.routes.length == 0) {
          setError(<WrapMessage>Not found any route</WrapMessage>);
        } else if (result.routes.length) {
          history.replace({
            pathname: Routes.Redirect,
            state: {
              message: (
                <WrapMessage>
                  <div className="text-center">Transaction not available</div>
                  <a
                    href="https://wallet.jigstack.org/s&b"
                    target="_blank"
                    className="underline hover:cursor-pointer text-center block text-24 py-4"
                    rel="noreferrer"
                  >
                    Visit S&B WebApp
                  </a>
                  <div className="text-12">
                    Momentarily for your security JWallet does not support this
                    type of swap and bridge
                  </div>
                </WrapMessage>
              ),
            },
          });
        }
        setStep(SwapBridgeSteps.SelectToken);
      } else {
        const { executionDuration, gasCosts } = route.steps[0].estimate;
        let _amountUSD = '';
        const estiGas = route.steps.reduce(
          (num, item) =>
            item.estimate.gasCosts
              ? num.add(BigNumber.from(item.estimate.gasCosts[0].amount))
              : num.add(BIG_NUMBER_ZERO),
          BIG_NUMBER_ZERO
        );
        if (gasCosts) {
          _amountUSD = gasCosts[0].amountUSD || '';
        }

        if (
          (isNativeCoin(tokenFromSelected.address) &&
            nativeBalance
              .sub(stringToBigNumber(amountFrom, tokenFromSelected.decimals))
              .lt(estiGas)) ||
          (!isNativeCoin(tokenFromSelected.address) &&
            nativeBalance.lt(estiGas))
        ) {
          const fromChain = chains.find(
            (chain) => chain.chainId === chainFromId
          );
          const offset = estiGas.sub(
            isNativeCoin(tokenFromSelected.address)
              ? nativeBalance.sub(parseUnits(amountFrom, fromChain?.decimals))
              : nativeBalance
          );
          const offSetAmount = (+formatUnits(
            offset,
            fromChain?.decimals
          )).toFixed(6);
          const networkInfo = getNetworkInfo(fromChain?.chainId || 0);
          setError(
            <WrapMessage>
              <div>You need to add at least:</div>
              <div>
                {offSetAmount}{' '}
                {networkInfo?.nativeCurrency?.symbol || fromChain?.symbol} on{' '}
                {fromChain?.name}
              </div>
            </WrapMessage>
          );
          setStep(SwapBridgeSteps.SelectToken);
        } else {
          setMetaData({
            executionDuration,
            amountUSD: _amountUSD,
            priceImpact: splippage,
          });
          if (!cancelRef.current) {
            setRoutSwap(route);
            setError('');
            setStep(SwapBridgeSteps.Confirm);
          }
        }
      }
    } catch (error) {
      console.log({ error });
    }
  };

  const cancelFetching = () => {
    cancelRef.current = true;
    setStep(SwapBridgeSteps.SelectToken);
  };

  const getBalanceToken = async (
    rpcURL: string,
    address: string,
    token: string
  ) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(rpcURL);
      if (token == NATIVE_ADDRESS_TOKEN) {
        return await provider.getBalance(address);
      }
      const contract = new ethers.Contract(token, ERC20ABI, provider);
      return await contract.balanceOf(address);
    } catch {
      return BIG_NUMBER_ZERO;
    }
  };

  useEffect(() => {
    void (async () => {
      setBalanceFrom(BIG_NUMBER_ZERO);
      try {
        const network = chains.find((x) => x.chainId == chainFromId);
        if (
          !network ||
          !isAddress(currentAccount.address) ||
          !isAddress(tokenFromSelected.address)
        )
          return;
        const balance = await getBalanceToken(
          network.rpcURL,
          currentAccount.address,
          tokenFromSelected.address
        );
        if (tokenFromSelected.address === NATIVE_ADDRESS_TOKEN) {
          setNativeBalane(balance);
        }
        setBlanceFromStr(
          renderBalanceToken(balance, tokenFromSelected.decimals, '')
        );
        setBalanceFrom(balance);
      } catch (error) {
        setBalanceFrom(BIG_NUMBER_ZERO);
      }
    })();
  }, [chains, chainFromId, currentAccount.address, tokenFromSelected]);

  useEffect(() => {
    void (async () => {
      try {
        const network = chains.find((x) => x.chainId == chainToId);
        if (
          !network ||
          !isAddress(currentAccount.address) ||
          !isAddress(tokenToSelected.address)
        )
          return;
        const balance = await getBalanceToken(
          network.rpcURL,
          currentAccount.address,
          tokenToSelected.address
        );
        setBalanceToStr(
          renderBalanceToken(balance, tokenToSelected.decimals, '')
        );
      } catch (error) {
        setBalanceToStr('0');
      }
    })();
  }, [chains, chainToId, currentAccount.address, tokenToSelected]);

  const getNeccessaryApproval = async (steps: Step[], signer: Signer) => {
    const promises: Array<Promise<ContractTransaction>> = [];
    for (const step of steps) {
      if (
        !isAddress(step.action.fromToken.address) ||
        step.action.fromToken.address === AddressZero
      ) {
        continue;
      }
      const lifiAddress = step.estimate.approvalAddress;
      const erc20Service = new ERC20Service(
        step.action.fromToken.address,
        signer
      );

      const allowance = await erc20Service.getAllowance(
        currentAccount.address,
        lifiAddress
      );

      const gasPrice = customGasPrice
        ? parseUnits(customGasPrice, 9)
        : await signer.provider?.getGasPrice();
      if (allowance.lt(step.action.fromAmount)) {
        promises.push(
          erc20Service.approve(lifiAddress, MaxUint256, {
            gasPrice,
          })
        );
      }
    }
    return promises;
  };

  const onQRConfirm = () => {
    if (!routeSwap) return;
    wallet.Swap(routeSwap);
  };

  const onConfirm = async () => {
    if (!routeSwap) return;
    try {
      setStep(SwapBridgeSteps.Execution);
      const LiFi = new LIFI();

      const signer = new ethers.Wallet(
        await wallet.getPrivateKeyInternal(currentAccount.address),
        currentProvider
      );

      const approvals = await getNeccessaryApproval(routeSwap.steps, signer);
      const txList = await Promise.all(approvals);
      const waitList = txList.map((tx) => tx.wait());
      await Promise.all(waitList);

      await LiFi.executeRoute(signer as any, routeSwap, {
        updateCallback,
      });

      const isMounted = mounted.current;
      if (isMounted) {
        history.replace({
          pathname: Routes.ScreenSuccess,
          state: {
            title: 'Successfully swap',
          },
        });
      }
    } catch (err) {
      const isMounted = mounted.current;
      const savedProcess = processRef.current;
      if (!isMounted) {
        return;
      }
      if (savedProcess) {
        history.replace({
          pathname: Routes.ScreenFailed,
          state: {
            title: 'Transaction failed',
          },
        });
      } else if (chainFromId !== routeSwap.fromChainId) {
        const chainFrom = lifiChains.find((x) => x.id == routeSwap.fromChainId);
        setError(
          <WrapMessage>Please change network to {chainFrom?.name}</WrapMessage>
        );
      } else {
        setError(
          <WrapMessage>Something wrong, please try again later</WrapMessage>
        );
      }
      setStep(SwapBridgeSteps.Confirm);
      console.log({ err });
    }
  };

  const resetAmount = () => {
    setErrorAmount(undefined);
    setAmountFrom('0');
    setAmountTo('0');
  };

  const onMaxAmount = () => {
    try {
      if (balanceFrom.isZero()) return;
      const numb = ethers.utils
        .formatUnits(balanceFrom, tokenFromSelected.decimals)
        .substring(0, 8);
      // const minimumRate = (numb * 15) / 100;
      // const availableAmount = numb - minimumRate;
      // console.log(numb, minimumRate);
      setAmountFrom(numb);
      setIsMax(true);
      setErrorAmount(undefined);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChangeSplippage = (value: string) => {
    const invalidCharsRegex = new RegExp('^[0-9.]+$');
    if (invalidCharsRegex.test(value) || value.length == 0) {
      setSplippage(value);
    }
  };

  const onInputGasPrice = (value: string) => {
    if (loadingScreen) return;
    const validCharsRegex = new RegExp('^\\d*\\.?\\d{0,9}$');
    if (validCharsRegex.test(value) || value.length == 0) {
      setCustomGasPrice(value);
    }
  };

  const onInputToAddress = (value: string) => {
    setToAddress(value);
    if (!isAddress(value)) {
      setErrorToAddress('Invalid EVM address');
    }
  };

  if (step == SwapBridgeSteps.SelectToken) {
    return (
      <div id="swap-container">
        <TitleFeatureDashboard title="Swap & Bridge" />

        {error}
        <div>
          <div className="header-balance">
            <div>From</div>
            <div>Balance: {balanceFromStr}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SelectChain
              chains={chains}
              selected={chainFromId}
              onChange={(id) => {
                setChainFromId(id);
                resetAmount();
              }}
            />
            <SelectTokenFrom
              token={tokenFromSelected}
              tokens={tokensFrom}
              amount={amountFrom}
              readonly={false}
              onChangeAmount={(value) => onChangeAmount(value)}
              onChangeToken={(tk) => {
                setTokenFromSelected(tk);
                resetAmount();
              }}
            />
          </div>
          {errorAmount && (
            <div className="text-orange text-14 text-right mt-2">
              {errorAmount}
            </div>
          )}
          <div className="max-button">
            <button onClick={onMaxAmount}>Max</button>
          </div>
        </div>
        <div className="swap-icon py-1">
          <button onClick={onChangeSwap}>
            <SwapIcon />
          </button>
        </div>
        <div>
          <div className="header-balance">
            <div>To</div>
            <div>Balance: {balanceToStr}</div>
          </div>
          <div className="mb-3">
            <SelectChain
              chains={chains}
              selected={chainToId}
              onChange={(id) => {
                setChainToId(id);
              }}
            />
          </div>
          <SelectTokenTo
            tokens={tokensTo}
            selected={tokenToSelected}
            onChange={(tk) => {
              setTokenToSelected(tk);
            }}
          />
        </div>
        <div className="my-3">
          <PrimaryButton
            text="GET QUOTE"
            onClick={fetchQuotes}
            disabled={
              loadingScreen ||
              !!errorToAddress ||
              !(+amountFrom > 0) ||
              !!errorAmount
            }
          />
        </div>
        <div id="advanced-options">
          <Accordion
            onToggle={onToggleOption}
            active={openOptions}
            header={
              <div
                className="flex items-center advanced-option-button hover-overlay w-fit p-1 rounded-md"
                // onClick={() => onToggleOption(!openOptions)}
              >
                <span className="mr-1">
                  {openOptions ? <MinusIcon /> : <PlusIcon />}
                </span>
                <span ref={advancedRef}>Advanced options</span>
              </div>
            }
            refresh={accordionRefresh}
            content={
              <>
                <div className="mb-2 mt-4">Send to:</div>
                <div className="mb-4">
                  <InputText
                    placeHolder="to"
                    value={toAddress}
                    onChange={(e) => onInputToAddress(e.target.value)}
                  />
                </div>
                {errorToAddress && (
                  <div className="text-orange text-14 text-right mt-2">
                    {errorToAddress}
                  </div>
                )}

                <div className="mb-2 mt-4">Gas price:</div>
                <div className="mb-4">
                  <InputText
                    placeHolder="Gas price (GWEI)"
                    value={customGasPrice}
                    onChange={(e) => onInputGasPrice(e.target.value)}
                  />
                </div>

                <div className="mb-2">Slippage:</div>
                <div className="mb-4">
                  <InputText
                    placeHolder="Slippage"
                    value={splippage}
                    onChange={(e) => handleChangeSplippage(e.target.value)}
                  />
                </div>

                <Dropdown
                  placeHolder="Bridge Prioritization"
                  selected={orderSelected}
                  options={Orders.map((x, index) => ({
                    value: index,
                    label: x,
                    id: index,
                  }))}
                  styles={{ marginBottom: 16 }}
                  onChange={(item) => setOrderSelected(item)}
                  scrollOnToggle
                />
                <MultiDropdown
                  placeHolder="Bridges"
                  selected={bridgeSelected}
                  options={tools?.bridges.map((x) => ({
                    value: x.key,
                    label: x.name,
                    id: x.key,
                  }))}
                  styles={{ marginBottom: 16 }}
                  onChange={(items) => setBridgeSelected(items)}
                  selectedRender={`Bridges ${
                    bridgeSelected?.length ? `(${bridgeSelected.length})` : ''
                  }`}
                  onToggleOpen={() =>
                    setTimeout(() => setAccordionRefresh((old) => !old), 500)
                  }
                />
                <MultiDropdown
                  placeHolder="Exchanges"
                  selected={exchangeSelected}
                  options={tools?.exchanges.map((x) => ({
                    value: x.key,
                    label: x.name,
                    id: x.key,
                  }))}
                  styles={{ marginBottom: 16 }}
                  onChange={(items) => setExchangeSelected(items)}
                  selectedRender={`Exchanges ${
                    exchangeSelected?.length
                      ? `(${exchangeSelected.length})`
                      : ''
                  }`}
                  onToggleOpen={() =>
                    setTimeout(() => setAccordionRefresh((old) => !old), 500)
                  }
                />
                <div className="mb-10">
                  <Checkbox
                    checked={infiniteApproval}
                    onChange={(value) => setInfiniteApproval(value)}
                  >
                    <span className="text-white hover:cursor-pointer">
                      Activate Infinite Approval
                    </span>
                  </Checkbox>
                </div>
              </>
            }
          />
        </div>
      </div>
    );
  }

  if (step == SwapBridgeSteps.FetchingQuote) {
    return (
      <div id="swap-container">
        <FetchingQuotes cancelFetching={cancelFetching} />
      </div>
    );
  }

  if (step == SwapBridgeSteps.Confirm) {
    return (
      <div id="swap-container">
        <Header />
        <TitleFeatureDashboard
          title="Swap & Bridge"
          onBack={() => {
            setStep(SwapBridgeSteps.SelectToken);
          }}
        />
        {error}
        <ConfirmStep
          tokenFrom={tokenFromSelected}
          tokenTo={tokenToSelected}
          amountFrom={amountFrom}
          amountTo={amountTo}
          step={metaData}
          onConfirm={() => {
            if (currentAccount.type === KEYRING_TYPE.WalletConnectKeyring) {
              setStep(SwapBridgeSteps.QRConfirm);
            } else {
              onConfirm();
            }
          }}
          chainFrom={lifiChains.find((x) => x.id == chainFromId)}
          chainTo={lifiChains.find((x) => x.id == chainToId)}
        />
      </div>
    );
  }

  if (step == SwapBridgeSteps.QRConfirm) {
    return (
      <div id="swap-container" className="h-full">
        <Header />
        <div className="flex-col flex h-full">
          <TitleFeatureDashboard
            title=""
            onBack={() => {
              setStep(SwapBridgeSteps.SelectToken);
            }}
          />
          <p className="italic font-bold p-6 rounded-lg bg-text m-auto">
            Your wallet will receive one or more transactions, please wait until
            they are opened. It will take a while
          </p>
          <div className="mt-auto">
            <PrimaryButton text="Accept" onClick={onQRConfirm} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="swap-container">
      <Header />
      <div className="execution">
        <div className="execution-title">Executing</div>
        <div className="execution-loading">
          <Spin
            indicator={
              <LoadingOutlined
                style={{ fontSize: 48, color: 'white', opacity: '.5' }}
                spin
              />
            }
          />
        </div>
      </div>
      {pendingProcess?.txHash && (
        <div className="w-full py-2">
          <PrimaryButton
            onClick={() => {
              mounted.current = false;
              history.replace({
                pathname: Routes.Dashboard,
                state: {
                  tab: 'Activity',
                },
              });
            }}
            text="See transaction"
          />
        </div>
      )}
    </div>
  );
};

export default Swap;
