import { AddressZero, Zero, KEYRING_TYPE, MIN_GAS_LIMIT_DEC } from '@/constant';
import Routes from '@/constant/routes';
import { useWallet } from '@/ui/utils';
import { bnToNumber, shortedAmount, stringToBigNumber } from '@/utils/format';
import { BigNumber, ethers } from 'ethers';
import { isAddress, parseUnits } from 'ethers/lib/utils';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import useLoadingScreen from '../wallet/useLoadingScreen';
import useNetwork from '../wallet/useNetwork';
import { TokenSaved } from '@/background/service/permission';
import { getChainLogoById } from '@/constant/chains';
import ERC20Service from '@/ui/services/contracts/ERC20';
import useCurrentAccount from '../wallet/useCurrentAccount';
import { TransactionType } from '@/background/service/transactionHistory';
import useBalanceAccount from '../contracts/useBalanceAccount';
import L1EstimatorService from '@/ui/services/contracts/L1Estimator';
import { ActionTypes, RefreshUseHooks } from '@/context/actions';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '@/context';

export enum StepKeys {
  Send,
  GasFee,
}

export enum AmountMode {
  Input,
  Max,
}

const useSendTransaction = () => {
  const currentAccount = useCurrentAccount();
  const { dispatch } = useAppContext();
  const { currentNetwork } = useNetwork();
  const wallet = useWallet();
  const nativeTokenLogo = getChainLogoById(currentNetwork.chainId);
  const initialToken: TokenSaved = {
    address: AddressZero,
    img: nativeTokenLogo || '',
    decimal: currentNetwork.decimals,
    chainId: currentNetwork.chainId,
    createdAt: 0,
    id: -1,
    name: currentNetwork.symbol,
    symbol: currentNetwork.symbol,
    standard: 'Native token',
  };
  const { state } = useLocation<{
    token?: TokenSaved;
  }>();
  const [token, setToken] = useState(state?.token || initialToken);
  const [firstMount, setFirstMount] = useState(true);
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(BigNumber.from(0));
  const [addressReceiver, setAddressReceiver] = useState('');
  const [errorReceiver, setErrorReceiver] = useState<string | undefined>(
    undefined
  );
  const [steps, setSteps] = useState(StepKeys.Send);
  const [errorAmount, setErrorAmount] = useState<string | undefined>(undefined);
  const [errorGasPrice, setErrorGasPrice] = useState<string | undefined>(
    undefined
  );
  const [errorGasLimit, setErrorGasLimit] = useState<string | undefined>(
    undefined
  );
  const [gasLimit, setGasLimit] = useState(BigNumber.from(MIN_GAS_LIMIT_DEC));
  const [gasPrice, setGasPrice] = useState(BigNumber.from(0));
  const [nonce, setNonce] = useState(0);
  const [gasStandard, setGasStandard] = useState({
    limit: BigNumber.from(0),
    price: BigNumber.from(0),
  });
  const [hexData, setHexData] = useState('');
  const [amountMode, setAmountMode] = useState(AmountMode.Input);
  const firstLoad = useRef(true);
  const history = useHistory();
  const { updateLoadingScreen } = useLoadingScreen();
  const providerNetwork = useMemo(
    () => new ethers.providers.JsonRpcProvider(currentNetwork.rpcURL),
    [currentNetwork.rpcURL]
  );
  const nativeBalance = useBalanceAccount(currentAccount.address);

  useEffect(() => {
    (async () => {
      const _nonce = await providerNetwork.getTransactionCount(
        currentAccount.address,
        'pending'
      );
      setNonce(_nonce);
      if (!firstMount) {
        const initialToken: TokenSaved = {
          address: AddressZero,
          img: nativeTokenLogo || '',
          decimal: currentNetwork.decimals,
          chainId: currentNetwork.chainId,
          createdAt: 0,
          id: -1,
          name: currentNetwork.symbol,
          symbol: currentNetwork.symbol,
          standard: 'Native token',
        };
        setToken(initialToken);
      }
      const _gasPrice = await providerNetwork.getGasPrice();
      setGasPrice(_gasPrice);
      setFirstMount(false);
    })();
  }, [currentNetwork.chainId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setBalance(BigNumber.from(0));
      if (token.address != AddressZero) {
        const erc20Service = new ERC20Service(token.address, providerNetwork);
        const _balance = await erc20Service.getBalanceOf(
          currentAccount.address
        );
        if (!mounted) return;
        setBalance(_balance);
      } else {
        const _nativeBalance = await providerNetwork.getBalance(
          currentAccount.address
        );
        if (!mounted) return;
        // for native token
        setBalance(_nativeBalance);
      }
      setAmount('');
      setAmountMode(AmountMode.Input);
      setSteps(StepKeys.Send);
    })();

    return () => {
      mounted = false;
    };
  }, [
    token.address,
    wallet,
    providerNetwork,
    currentAccount.address,
    // nativeBalance,
  ]);

  useEffect(() => {
    void (async () => {
      if (
        !isAddress(addressReceiver) ||
        !(+amount > 0) ||
        (amountMode == AmountMode.Max && token.address === AddressZero)
      ) {
        return;
      }
      const erc20Service = new ERC20Service(token.address, providerNetwork);
      const _gasLimit = await providerNetwork.estimateGas({
        from: currentAccount.address,
        to: token.address === AddressZero ? addressReceiver : token.address,
        data:
          token.address === AddressZero
            ? '0x'
            : erc20Service.encodeTransfer(
                addressReceiver,
                parseUnits(amount, token.decimal)
              ),
        value:
          token.address === AddressZero ? parseUnits(amount, token.decimal) : 0,
      });
      setGasLimit(_gasLimit);
      setGasStandard({
        limit: _gasLimit,
        price: gasPrice,
      });
    })();
  }, [
    providerNetwork,
    addressReceiver,
    amount,
    // token.address,
    // wallet,
    // currentAccount.address,
    // gasPrice,
  ]);

  useEffect(() => {
    const isFirstLoad = firstLoad.current;
    if (!isFirstLoad) {
      const formatAmount = isNaN(+amount) ? '0' : amount;
      const gas = gasLimit.mul(gasPrice);
      const bnAmount = parseUnits(formatAmount || '0', token.decimal);
      const isNative = token.address === AddressZero;
      const totalPaid = isNative ? bnAmount.add(gas) : gas;
      if (nativeBalance.lt(totalPaid)) {
        setErrorAmount(
          `Insufficient ${currentNetwork.symbol} to execute a transaction`
        );
      } else {
        setErrorAmount(validateAmount(formatAmount));
      }
    }
  }, [gasLimit, gasPrice, amount, nativeBalance]);

  const validateAmount = (value: string) => {
    if (isNaN(Number(value)))
      return 'Only numbers without special characters can be entered. Please insert the amount divided by a dot between the units and decimals';
    if (!value) {
      return 'Please enter amount to send!';
    }
    let isLimit = false;
    try {
      isLimit = stringToBigNumber(value, token.decimal).gt(balance);
    } catch {
      return 'Invalid value';
    }
    if (isLimit) return 'Insufficient balance';
    return undefined;
  };

  // const validateTx = (_amount: string) => {
  //   const gas = gasLimit.mul(gasPrice);
  //   const bnAmount = parseUnits(_amount || '0', token.decimal);
  //   const isNative = token.address === AddressZero;
  //   const totalPaid = isNative ? bnAmount.add(gas) : gas;
  //   if (nativeBalance.lt(totalPaid)) {
  //     setErrorAmount('Insufficient balance');
  //   } else {
  //     setErrorAmount(validateAmount(_amount));
  //   }
  // };

  const changeAmount = (value: string) => {
    const decimal = token?.decimal || 18;
    const invalidCharsRegex = new RegExp(`^[0-9]*\\.?[0-9]{0,${decimal}}$`);
    if (invalidCharsRegex.test(value) || value.length == 0) {
      setAmount(value);
      const isFirstLoad = firstLoad.current;
      if (isFirstLoad) {
        firstLoad.current = false;
      }
    }
    setAmountMode(AmountMode.Input);
  };

  const changeAddressReceiver = (value: string) => {
    setAddressReceiver(value);
    setErrorReceiver(isAddress(value) ? undefined : 'This address is invalid');
  };

  const reloadAllState = () => {
    setAmount('');
    setAddressReceiver('');
    setErrorReceiver(undefined);
    setSteps(StepKeys.Send);
    setErrorAmount(undefined);
  };

  const onSendTransaction = async () => {
    const bnAmount = parseUnits(amount, token.decimal);
    updateLoadingScreen(true);
    const provider = new ethers.providers.JsonRpcProvider(
      currentNetwork.rpcURL
    );
    try {
      const erc20Service = new ERC20Service(token.address, provider);
      const tx = {
        from: currentAccount.address,
        to: token.address === AddressZero ? addressReceiver : token.address,
        value: token.address === AddressZero ? bnAmount : Zero,
        gasLimit,
        gasPrice,
        nonce,
        data:
          token.address === AddressZero
            ? '0x'
            : erc20Service.encodeTransfer(addressReceiver, bnAmount),
        chainId: currentNetwork.chainId,
      };

      // Wallet connect handler
      if (currentAccount.type === KEYRING_TYPE.WalletConnectKeyring) {
        wallet.sendRequest({
          method: 'eth_sendTransaction',
          params: [
            {
              ...tx,
              gasPrice: gasPrice._hex,
              gasLimit: gasLimit._hex,
              value: tx.value._hex,
            },
          ],
        });
        return;
      }

      // others
      const privateKey = await wallet.getPrivateKeyInternal(
        currentAccount.address
      );
      const etherWallet = new ethers.Wallet(privateKey);
      const signer = etherWallet.connect(provider);

      if (hexData && token.address === AddressZero) {
        tx['data'] = hexData;
      }
      const txPending = await signer.sendTransaction(tx);
      let createdAt = ~~(new Date().getTime() / 1000);
      try {
        if (txPending?.blockNumber) {
          const block = await provider.getBlock(txPending.blockNumber);
          createdAt = block.timestamp;
        }
      } catch (e) {}
      const _token = {
        symbol: token.symbol,
        decimals: token.decimal,
        address: token.address === AddressZero ? '' : token.address,
        isNative: token.address === AddressZero,
      };
      await wallet.addTransactionPending({
        ...txPending,
        createdAt,
        token: _token,
        amount: bnAmount,
        transactionType: TransactionType.Send,
        chainId: txPending.chainId,
      });
      history.push({
        pathname: Routes.Dashboard,
        state: {
          tab: 'Activity',
        },
      });
      updateLoadingScreen(false);
      // const txCompleted = await txPending.wait();
      // await wallet.addTransactionCompleted({
      //   ...txCompleted,
      //   createdAt,
      //   token: _token,
      //   value: txPending.value,
      //   amount: bnAmount,
      //   transactionType: TransactionType.Send,
      //   chainId: txPending.chainId,
      // });
    } catch (error) {
      console.log(error);
      updateLoadingScreen(false);
      // if (error?.receipt) {
      //   const _token = {
      //     symbol: token.symbol,
      //     decimals: token.decimal,
      //     address: token.address === AddressZero ? '' : token.address,
      //     isNative: token.address === AddressZero,
      //   };
      //   let createdAt = new Date().getTime() / 1000;
      //   try {
      //     if (error?.receipt?.blockNumber) {
      //       const block = await provider.getBlock(error.receipt.blockNumber);
      //       createdAt = block.timestamp;
      //     }
      //   } catch (e) {}
      //   await wallet.addTransactionCompleted({
      //     ...error.receipt,
      //     createdAt,
      //     token: _token,
      //     value: error?.transaction.value,
      //     amount: bnAmount,
      //     transactionType: TransactionType.Send,
      //     chainId: currentNetwork.chainId,
      //   });
      // } else {
      //   history.push({
      //     pathname: Routes.ScreenFailed,
      //     state: {
      //       title: 'Transaction failed',
      //     },
      //   });
      // }
    } finally {
      // setErrorGasLimit(undefined);
      // setErrorGasPrice(undefined);
      dispatch({
        type: ActionTypes.UpdateActivitySectionRefresh,
        payload: uuidv4(),
      });
      dispatch({
        type: ActionTypes.UpdateRefreshUseHooks,
        payload: [RefreshUseHooks.Account_Balance],
      });
    }
  };

  const validateGasLimit = (value: BigNumber) => {
    if (value.lt(MIN_GAS_LIMIT_DEC)) {
      return 'Minimum of gas limit is 21000';
    }
    if (value.lt(gasStandard.limit)) {
      return 'Gas Limit is low, the transaction may fail';
    }
  };

  const onGasLimitChange = (value: BigNumber) => {
    setGasLimit(value);
    setErrorGasLimit(validateGasLimit(value));
  };

  const onGasPriceChange = (value: BigNumber) => {
    setGasPrice(value);
    setErrorGasPrice(
      value.lt(gasStandard.price)
        ? 'Gas price is low, the transaction may not be confirmed or fail'
        : undefined
    );
  };

  const onChangeHexData = (value: string) => {
    setHexData(value);
  };

  const canNextStep = useMemo(
    () =>
      amount != '0' &&
      amount.length != 0 &&
      addressReceiver.length != 0 &&
      [errorReceiver, errorAmount].every((x) => x == undefined),
    [amount, addressReceiver, errorReceiver, errorAmount]
  );

  const canSubmit = useMemo(
    () =>
      +amount > 0 &&
      addressReceiver.length != 0 &&
      !gasLimit.lt(MIN_GAS_LIMIT_DEC) &&
      !gasPrice.isZero() &&
      [errorReceiver, errorAmount].every((x) => x == undefined),
    [
      amount,
      addressReceiver,
      gasLimit,
      gasPrice,
      errorAmount,
      errorGasLimit,
      errorGasPrice,
      errorReceiver,
    ]
  );

  const handleClickMax = async () => {
    setAmountMode(AmountMode.Max);
    const _gasLimit = BigNumber.from(MIN_GAS_LIMIT_DEC);
    if (token.address === AddressZero) {
      setGasLimit(_gasLimit);
      setGasStandard({
        limit: _gasLimit,
        price: gasPrice,
      });

      const l1Estimator = new L1EstimatorService(
        currentNetwork.chainId,
        providerNetwork
      );
      const l1GasFee = await l1Estimator.estimateL1Gas('0x');
      const balanceSend = bnToNumber(
        balance.sub(gasPrice.mul(_gasLimit)).sub(l1GasFee),
        token.decimal
      );

      if (balanceSend < 0) {
        setAmount('0');
        setErrorAmount(
          `Insufficient ${currentNetwork.symbol} to execute a transaction`
        );
      } else {
        setAmount(shortedAmount(balanceSend.toString()));
      }
    } else {
      setAmount(shortedAmount(bnToNumber(balance, token.decimal).toString()));
    }
    setErrorAmount(undefined);
  };

  const changeGasFeeString = (gasType: string, value: string) => {
    const invalidCharsRegex = new RegExp('^[0-9.]+$');
    if (invalidCharsRegex.test(value) || value.length == 0) {
      if (gasType == 'limit') {
        try {
          onGasLimitChange(BigNumber.from(value || '0'));
        } catch (error) {}
      } else {
        try {
          const customGasPrice = parseUnits(value, 9);
          onGasPriceChange(customGasPrice);
        } catch (error) {}
      }
    }
  };

  return {
    amount,
    addressReceiver,
    errorReceiver,
    steps,
    errorAmount,
    gasLimit,
    gasPrice,
    nonce,
    setNonce,
    errorGasPrice,
    errorGasLimit,
    canSubmit,
    hexData,
    canNextStep,
    token,
    balance,
    canEditHexData: token.address === AddressZero,
    changeAmount,
    changeAddressReceiver,
    setSteps,
    onSendTransaction,
    reloadAllState,
    onGasLimitChange,
    onGasPriceChange,
    onChangeHexData,
    handleClickMax,
    changeGasFeeString,
    setToken,
  };
};

export default useSendTransaction;
