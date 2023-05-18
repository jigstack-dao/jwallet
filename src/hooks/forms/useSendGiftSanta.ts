import jwalletAPI from '@/background/service/jwalletAPI';
import { TransactionType } from '@/background/service/transactionHistory';
import {
  BIG_NUMBER_ZERO,
  MINIMUM_GAS_LIMIT,
  PRIVATE_KEY_TYPE,
  TAB_SANTA_KEYS,
} from '@/constant';
import { ERC20ABI } from '@/constant/abi';
import {
  getEscrowAddress,
  SendGiftFormStep,
  TokenSantaResponse,
} from '@/constant/santa';
import { useAppContext } from '@/context';
import { ActionTypes, RefreshUseHooks } from '@/context/actions';
import { useWallet } from '@/ui/utils';
import { apiConnection } from '@/utils/api';
import { renderAmount } from '@/utils/render-values';
import { validateEmail } from '@/utils/validate-values';
import { uuid4 } from '@sentry/utils';
import { BigNumber, ethers } from 'ethers';
import { parseUnits, formatUnits } from 'ethers/lib/utils';
import { useEffect, useMemo, useRef, useState } from 'react';
import useCurrentAccount from '../wallet/useCurrentAccount';
import useLoadingScreen from '../wallet/useLoadingScreen';
import useNetwork from '../wallet/useNetwork';
import ERC20Service from '@/ui/services/contracts/ERC20';

export interface IRecipient {
  comment: string;
  email: string;
  amount: string;
  errorEmail: string | undefined;
  errorAmount: string | undefined;
}

const recipient = {
  comment: '',
  email: '',
  amount: '',
  errorEmail: undefined,
  errorAmount: undefined,
};

const useSendGiftSanta = (tokenAuth: string) => {
  const [step, setStep] = useState(SendGiftFormStep.Initial);
  const [tokens, setTokens] = useState<TokenSantaResponse[]>([]);
  const [tokenSelectedAddress, setTokenSelectedAddress] = useState<
    string | undefined
  >(undefined);
  const [imgUploaded, setImgUploaded] = useState(false);
  const [imgFile, setImgFile] = useState<File | undefined>(undefined);
  const [balanceOf, setBalanceOf] = useState(BIG_NUMBER_ZERO);
  const [gasLimit, setGasLimit] = useState(BigNumber.from(MINIMUM_GAS_LIMIT));
  const [openConfirm, setOpenConfirm] = useState(false);
  const wallet = useWallet();
  const { currentNetwork } = useNetwork();
  const currentAccount = useCurrentAccount();
  const { updateLoadingScreen } = useLoadingScreen();
  const { dispatch } = useAppContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const [recipients, setRecipients] = useState<IRecipient[]>([
    { ...recipient },
  ]);
  const [title, setTitle] = useState('');
  const decimals =
    tokens.find((x) => x.address === tokenSelectedAddress)?.decimals || 18;

  const onSendGift = async () => {
    setOpenConfirm(false);
    updateLoadingScreen(true);

    const totalAmount = recipients
      .map((x) => parseUnits(x.amount, decimals))
      .reduce((par, e) => par.add(e), BIG_NUMBER_ZERO);
    try {
      const tokenSelected = tokens.find(
        (x) => x.address == tokenSelectedAddress
      );
      if (!tokenSelected) return;
      const isNative =
        tokenSelected.address === '0x0000000000000000000000000000000000001010';
      const erc20Service = new ERC20Service(tokenSelected.address);
      const escrowAddress = getEscrowAddress(currentNetwork.chainId);
      const provider = new ethers.providers.JsonRpcProvider(
        currentNetwork.rpcURL
      );
      const gasPrice = (await provider.getGasPrice()).mul(3).div(2);

      const txParams = {
        from: currentAccount.address,
        to: isNative ? escrowAddress : tokenSelected.address,
        value: isNative ? totalAmount : '0x0',
        data: isNative
          ? '0x'
          : erc20Service.encodeTransfer(escrowAddress, totalAmount),
        gasLimit: gasLimit._hex,
        gasPrice: gasPrice._hex,
        chainId: +currentNetwork.chainId,
      };
      if (!PRIVATE_KEY_TYPE.includes(currentAccount.type)) {
        const imageId = await getURLImage();
        const apiReq = {
          title,
          comment: recipients[0].comment,
          imageId,
          tokenId: tokenSelected.id,
          amount: formatUnits(totalAmount, decimals),
          recipients: recipients.map((x) => ({
            amount: x.amount,
            recipient: x.email,
            tokenId: tokenSelected.id,
          })),
        };
        await wallet.cacheAdditionalPayload({
          token: {
            ...tokenSelected,
            isNative,
          },
          amount: totalAmount,
          transactionType: TransactionType.Santa,
        });
        wallet.SendGift(txParams, apiReq, +currentNetwork.chainId, tokenAuth);
        return;
      } else {
        const privateKey = await wallet.getPrivateKeyInternal(
          currentAccount.address
        );
        const etherWallet = new ethers.Wallet(privateKey);
        const signer = etherWallet.connect(provider);
        const txPending = await signer.sendTransaction(txParams);
        const token = {
          symbol: tokenSelected.symbol,
          decimals: tokenSelected.decimals,
          address: tokenSelected.address,
          isNative,
        };
        let createdAt = new Date().getTime() / 1000;
        try {
          if (txPending?.blockNumber) {
            const block = await provider.getBlock(txPending.blockNumber);
            createdAt = block.timestamp;
          }
        } catch (e) {}
        await wallet.addTransactionPending({
          ...txPending,
          createdAt,
          amount: totalAmount,
          token,
          transactionType: TransactionType.Santa,
          chainId: currentNetwork.chainId,
        });
        const txCompleted = await provider.waitForTransaction(txPending.hash);
        if (txCompleted) {
          const imageId = await getURLImage();
          const apiReq = {
            title,
            comment: recipients[0].comment,
            imageId,
            tokenId: tokenSelected.id,
            amount: formatUnits(totalAmount, decimals),
            txhash: txPending.hash,
            recipients: recipients.map((x) => ({
              amount: x.amount,
              recipient: x.email,
              tokenId: tokenSelected.id,
            })),
          };
          await Promise.all([
            API.post('/gifts', apiReq),
            jwalletAPI.createSantaGift({
              sender: txCompleted.from,
              txhash: txPending.hash,
              chainId: currentNetwork.chainId,
              recipients: recipients.map((x) => ({
                amount: x.amount,
                tokenAddress: tokenSelected.address,
                recipient: x.email,
              })),
            }),
          ]);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      updateLoadingScreen(false);
      dispatch({
        type: ActionTypes.UpdateSantaTab,
        payload: TAB_SANTA_KEYS.Transactions,
      });
      dispatch({
        type: ActionTypes.UpdateRefreshUseHooks,
        payload: [RefreshUseHooks.Account_Balance],
      });
    }
  };

  const getURLImage = async () => {
    try {
      if (!imgFile) return null;
      const formData = new FormData();
      formData.append('image', imgFile);
      const res = await API.post('/gifts/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.status === 200 && res.data.imageUrl ? res.data.id : null;
    } catch {
      return null;
    }
  };

  const API = useMemo(() => {
    const baseURL = process.env.REACT_APP_SANTA_API || '';
    const headers = {
      Authorization: `Bearer ${tokenAuth}`,
    };
    return apiConnection(baseURL, headers);
  }, [tokenAuth]);

  const onSubmit = async () => {
    if (step == SendGiftFormStep.Initial) {
      setStep(SendGiftFormStep.FilledForm);
    } else {
      setOpenConfirm(true);
    }
  };

  const onOpenFile = () => {
    if (!inputRef.current) {
      return;
    }

    inputRef.current.click();
  };

  useEffect(() => {
    void (async () => {
      const _tokens = await API.get(
        `/tokens?network=${currentNetwork.chainId}`
      );
      setTokens(_tokens.data);
      if (_tokens.data.length) {
        setTokenSelectedAddress(_tokens.data[1].address);
      }
    })();
  }, [currentNetwork.chainId]);

  const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!files) {
      return;
    }
    const acceptTypes = ['image/jpeg', 'image/png'];
    if (acceptTypes.includes(files[0].type)) {
      setImgFile(files[0]);
      setImgUploaded(true);
    }
  };

  const validAllReceipients = useMemo(() => {
    let valid = true;
    recipients.forEach((x) => {
      const { email, comment, amount, errorEmail, errorAmount } = x;
      if (
        [email, comment, amount].some((x) => x == '') ||
        [errorAmount, errorEmail].some((x) => x != undefined)
      )
        valid = false;
    });
    return valid;
  }, [recipients]);

  const canSubmit = () => {
    const canSubmitInitial =
      validAllReceipients && !balanceOf.isZero() && title != '';

    if (step == SendGiftFormStep.Initial) {
      return canSubmitInitial;
    }

    return canSubmitInitial && !gasLimit.lt(BigNumber.from(MINIMUM_GAS_LIMIT));
  };

  const validateAmount = (value: string, index: number) => {
    if (isNaN(Number(value)))
      return 'Only numbers without special characters can be entered. Please insert the amount divided by a dot between the units and decimals';
    let isLimit = false;
    try {
      const _recipients = [...recipients];
      _recipients.slice(index, 1);
      const totalAmount = _recipients
        .map((x) => parseUnits(x.amount, decimals))
        .reduce((partialSum, a) => partialSum.add(a), BIG_NUMBER_ZERO);
      isLimit = totalAmount.gt(balanceOf);
    } catch {
      return 'Insufficient balance';
    }
    if (isLimit) return 'Insufficient balance';
    return undefined;
  };

  useEffect(() => {
    void (async () => {
      if (
        currentAccount.address.length == 0 ||
        currentNetwork.rpcURL.length == 0 ||
        !tokenSelectedAddress
      ) {
        setBalanceOf(BIG_NUMBER_ZERO);
      } else {
        const isNative =
          tokenSelectedAddress === '0x0000000000000000000000000000000000001010';
        const provider = new ethers.providers.JsonRpcProvider(
          currentNetwork.rpcURL
        );
        if (isNative) {
          const nativeBalance = await provider.getBalance(
            currentAccount.address
          );
          setBalanceOf(nativeBalance);
        } else {
          const contract = new ethers.Contract(
            tokenSelectedAddress,
            ERC20ABI,
            provider
          );
          setBalanceOf(await contract.balanceOf(currentAccount.address));
        }
      }
    })();
  }, [currentAccount, currentNetwork, tokenSelectedAddress]);

  const onChangeToken = (value: string) => {
    setTokenSelectedAddress(value);
  };

  const clearAll = () => {
    setStep(SendGiftFormStep.Initial);
    setRecipients([{ ...recipient }]);
    setImgUploaded(false);
    setImgFile(undefined);
    setGasLimit(BigNumber.from(MINIMUM_GAS_LIMIT));
    setOpenConfirm(false);
  };

  useEffect(() => {
    void (async () => {
      if (
        validAllReceipients &&
        !balanceOf.isZero() &&
        title != '' &&
        step == SendGiftFormStep.FilledForm
      ) {
        const provider = new ethers.providers.JsonRpcProvider(
          currentNetwork.rpcURL
        );
        const totalAmount = recipients
          .map((x) => parseUnits(x.amount, decimals))
          .reduce((par, e) => par.add(e), BIG_NUMBER_ZERO);

        const isNative =
          tokenSelectedAddress === '0x0000000000000000000000000000000000001010';
        if (isNative) {
          const _gasLimit = await provider.estimateGas({
            from: currentAccount.address,
            to: getEscrowAddress(currentNetwork.chainId),
            data: '0x',
            value: totalAmount,
          });

          setGasLimit(_gasLimit.mul(3).div(2));
        } else if (tokenSelectedAddress) {
          const erc20Service = new ERC20Service(tokenSelectedAddress);
          const _gasLimit = await provider.estimateGas({
            from: currentAccount.address,
            to: isNative
              ? getEscrowAddress(currentNetwork.chainId)
              : tokenSelectedAddress,
            value: isNative ? totalAmount : 0,
            data: isNative
              ? '0x'
              : erc20Service.encodeTransfer(
                  getEscrowAddress(currentNetwork.chainId),
                  totalAmount
                ),
          });
          setGasLimit(_gasLimit.mul(3).div(2));
        }
      }
    })();
  }, [
    recipients,
    currentNetwork,
    validAllReceipients,
    title,
    tokenSelectedAddress,
    step,
  ]);

  const addRecipient = () => {
    setRecipients((prev) => [...prev, { ...recipient, id: uuid4() }]);
  };

  const onRecipientChange = (key: string, value: string, index: number) => {
    const _recipients = [...recipients];
    switch (key) {
      case 'comment':
        _recipients[index].comment = value;
        break;
      case 'email':
        _recipients[index].email = value;
        _recipients[index].errorEmail = validateEmail(value)
          ? undefined
          : 'Invalid email';
        break;
      case 'amount':
        {
          const invalidCharsRegex = new RegExp('^[0-9.]+$');
          if (invalidCharsRegex.test(value) || value.length == 0) {
            _recipients[index].amount = value;
            _recipients[index].errorAmount = validateAmount(value, index);
          }
        }
        break;
      default:
        break;
    }
    setRecipients(_recipients);
  };

  const renderBalanceOf = () => renderAmount(balanceOf, decimals);

  return {
    imgUploaded,
    inputRef,
    imgFile,
    tokenSelectedAddress,
    tokens,
    balanceOf,
    step,
    gasLimit,
    openConfirm,
    recipients,
    decimals,
    title,
    setTitle,
    addRecipient,
    onOpenFile,
    onChangeFile,
    onChangeToken,
    setGasLimit,
    canSubmit,
    onSubmit,
    onSendGift,
    setOpenConfirm,
    clearAll,
    onRecipientChange,
    renderBalanceOf,
  };
};

export default useSendGiftSanta;
