/* eslint-disable no-useless-escape */
import React, { useEffect, useState } from 'react';
import {
  intToHex,
  isHexString,
  isHexPrefixed,
  addHexPrefix,
  unpadHexString,
} from 'ethereumjs-util';
import { Modal, Drawer } from 'antd';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import Safe from '@rabby-wallet/gnosis-sdk';
import { SafeInfo } from '@rabby-wallet/gnosis-sdk/src/api';
import ReactGA from 'react-ga';
import {
  KEYRING_CLASS,
  CHAINS,
  CHAINS_ENUM,
  KEYRING_TYPE,
  INTERNAL_REQUEST_ORIGIN,
  SUPPORT_1559_KEYRING_TYPE,
  HARDWARE_KEYRING_TYPES,
  AddressZero,
} from 'consts';
import { Checkbox } from 'ui/component';
import { JsonRpcProvider } from '@ethersproject/providers';
import AccountCard from './AccountCard';
import LedgerWebHIDAlert from './LedgerWebHIDAlert';
import SecurityCheckBar from './SecurityCheckBar';
import {
  ExplainTxResponse,
  SecurityCheckDecision,
  Tx,
  GasLevel,
} from 'background/service/openapi';
import { hasConnectedLedgerDevice } from '@/utils';
import {
  validateGasPriceRange,
  convertLegacyTo1559,
} from '@/utils/transaction';
import { useWallet, useApproval } from 'ui/utils';
import { ChainGas, Account } from 'background/service/preference';
import GnosisDrawer from './TxComponents/GnosisDrawer';
import Approve from './TxComponents/Approve';
import Cancel from './TxComponents/Cancel';
import CancelNFTCollection from './TxComponents/CancelNFTCollection';
import CancelNFT from './TxComponents/CancelNFT';
import Sign from './TxComponents/Sign';
import CancelTx from './TxComponents/CancelTx';
import Send from './TxComponents/Send';
import Deploy from './TxComponents/Deploy';
import Loading from './TxComponents/Loading';
import GasSelector from './TxComponents/GasSelecter';
import { WaitingSignComponent } from './SignText';
import IconAlert from 'ui/assets/warning-risk.svg';
import ApproveNFTCollection from './TxComponents/ApproveNFTCollection';
import ApproveNFT from './TxComponents/ApproveNFT';
import SendNFT from './TxComponents/sendNFT';
import StrayButtons from '@/ui/component/Buttons/StrayButtons';
import useNetwork from '@/hooks/wallet/useNetwork';
import { explainTxSP } from '@/utils/explainTxSP';
import { checkTxSP } from '@/utils/checkTxSP';
import ContractInteraction from './TxComponents/ContractInteraction';
import { useAdvancedSetting } from '@/hooks/wallet/useWalletSetting';
import { TransactionType } from '@/background/service/transactionHistory';
import { BigNumber } from 'ethers';

const clampHexNum = (hex: string | number | undefined) => {
  if (!hex) {
    return 0;
  }
  if (isNaN(+hex)) {
    return 0;
  } else {
    return hex;
  }
};

const normalizeHex = (value: string | number) => {
  if (typeof value === 'number') {
    return intToHex(Math.floor(value));
  }
  if (typeof value === 'string') {
    if (!isHexPrefixed(value)) {
      return addHexPrefix(value);
    }
    return value;
  }
  return value;
};

const normalizeTxParams = (tx) => {
  const copy = tx;
  try {
    if ('nonce' in copy) {
      copy.nonce = normalizeHex(copy.nonce);
    }
    if ('gas' in copy) {
      copy.gas = normalizeHex(copy.gas);
    }
    if ('gasLimit' in copy) {
      copy.gas = normalizeHex(copy.gasLimit);
    }
    if ('gasPrice' in copy) {
      copy.gasPrice = normalizeHex(copy.gasPrice);
    }
    if ('value' in copy) {
      copy.value = addHexPrefix(
        unpadHexString(addHexPrefix(copy.value) || '0x0')
      );
    }
  } catch (e) {
    console.log('NORMALIZE_TX_ERROR', e.message);
  }
  return copy;
};

export const TxTypeComponent = ({
  txDetail,
  chainName = CHAINS[CHAINS_ENUM.ETH].name,
  isReady,
  raw,
  onChange,
  tx,
  isSpeedUp,
}: {
  txDetail: ExplainTxResponse;
  chainName: string;
  isReady: boolean;
  raw: Record<string, string | number>;
  onChange: (data: Record<string, any>) => void;
  tx: Tx;
  isSpeedUp: boolean;
}) => {
  useEffect(() => {
    console.log({
      txDetail,
      chainName,
      isReady,
      raw,
      tx,
      isSpeedUp,
    });
  }, [txDetail]);
  if (!isReady) return <Loading chainName={chainName} />;
  if (txDetail.type_deploy_contract)
    return (
      <Deploy
        data={txDetail}
        chainName={chainName}
        isSpeedUp={isSpeedUp}
        raw={raw}
      />
    );
  if (txDetail.type_cancel_tx)
    return (
      <CancelTx
        data={txDetail}
        chainName={chainName}
        tx={tx}
        isSpeedUp={isSpeedUp}
        raw={raw}
      />
    );
  if (txDetail.type_cancel_single_nft_approval)
    return (
      <CancelNFT
        data={txDetail}
        chainName={chainName}
        isSpeedUp={isSpeedUp}
        raw={raw}
      />
    );
  if (txDetail.type_cancel_nft_collection_approval)
    return (
      <CancelNFTCollection
        data={txDetail}
        chainName={chainName}
        isSpeedUp={isSpeedUp}
        raw={raw}
      />
    );
  if (txDetail.type_cancel_token_approval)
    return (
      <Cancel
        data={txDetail}
        chainName={chainName}
        isSpeedUp={isSpeedUp}
        raw={raw}
      />
    );
  if (txDetail.type_single_nft_approval)
    return (
      <ApproveNFT
        data={txDetail}
        chainName={chainName}
        isSpeedUp={isSpeedUp}
        raw={raw}
      />
    );
  if (txDetail.type_nft_collection_approval)
    return (
      <ApproveNFTCollection
        data={txDetail}
        chainName={chainName}
        isSpeedUp={isSpeedUp}
        raw={raw}
      />
    );
  if (txDetail.type_nft_send)
    return (
      <SendNFT
        data={txDetail}
        chainName={chainName}
        isSpeedUp={isSpeedUp}
        raw={raw}
      />
    );
  if (txDetail.type_token_approval)
    return (
      <Approve
        data={txDetail}
        chainName={chainName}
        onChange={onChange}
        tx={tx}
        isSpeedUp={isSpeedUp}
        raw={raw}
      />
    );
  if (txDetail.type_send)
    return (
      <Send
        data={txDetail}
        chainName={chainName}
        isSpeedUp={isSpeedUp}
        raw={raw}
      />
    );
  if (txDetail.type_call)
    return (
      <Sign
        data={txDetail}
        raw={raw}
        chainName={chainName}
        isSpeedUp={isSpeedUp}
        tx={tx}
      />
    );
  return (
    <ContractInteraction
      data={txDetail}
      chainName={chainName}
      isSpeedUp={isSpeedUp}
      raw={raw}
    />
  );
};

interface SignTxProps {
  params: {
    session: {
      origin: string;
      icon: string;
      name: string;
    };
    data: any[];
    isGnosis?: boolean;
    account?: Account;
  };
  origin: string;
}

const SignTx = ({ params, origin }: SignTxProps) => {
  const { isGnosis, account } = params;
  const [isReady, setIsReady] = useState(false);
  const [nonceChanged, setNonceChanged] = useState(false);
  const [canProcess, setCanProcess] = useState(true);
  const { currentNetwork } = useNetwork();
  const advancedSetting = useAdvancedSetting();

  const [txDetail, setTxDetail] = useState<ExplainTxResponse | null>({
    balance_change: {
      err_msg: '',
      receive_token_list: [],
      send_token_list: [],
      success: true,
      usd_value_change: 0,
    },
    native_token: {
      amount: 0,
      chain: '',
      decimals: 18,
      display_symbol: '',
      id: '1',
      is_core: true,
      is_verified: true,
      is_wallet: true,
      is_infinity: true,
      logo_url: '',
      name: '',
      optimized_symbol: '',
      price: 0,
      symbol: '',
      time_at: 0,
      usd_value: 0,
    },
    gas: {
      estimated_gas_cost_usd_value: 0,
      estimated_gas_cost_value: 0,
      estimated_gas_used: 0,
      estimated_seconds: 0,
    },
    pre_exec: {
      success: true,
      err_msg: '',
    },
    recommend: {
      gas: '',
      nonce: '',
    },
    support_balance_change: true,
    type_call: {
      action: '',
      contract: '',
      contract_protocol_logo_url: '',
      contract_protocol_name: '',
    },
  });
  const [submitText, setSubmitText] = useState('Proceed');
  const [, setCheckText] = useState('Sign');
  const { t } = useTranslation();
  const [securityCheckStatus, setSecurityCheckStatus] =
    useState<SecurityCheckDecision>('pending');
  const [securityCheckAlert, setSecurityCheckAlert] = useState('Checking...');
  const [preprocessSuccess, setPreprocessSuccess] = useState(true);
  const [chainId] = useState<number>(
    params.data[0].chainId && Number(params.data[0].chainId)
  );
  // const [chain] = useState(
  //   Object.values(CHAINS).find((item) => item.id === chainId)
  // );
  const [inited, setInited] = useState(false);
  const [isHardware, setIsHardware] = useState(false);
  const [selectedGas, setSelectedGas] = useState<GasLevel | null>(null);
  const [gasList, setGasList] = useState<GasLevel[]>([
    {
      level: 'slow',
      front_tx_count: 0,
      price: 0,
      estimated_seconds: 0,
      base_fee: 0,
    },
    {
      level: 'normal',
      front_tx_count: 0,
      price: 0,
      estimated_seconds: 0,
      base_fee: 0,
    },
    {
      level: 'fast',
      front_tx_count: 0,
      price: 0,
      estimated_seconds: 0,
      base_fee: 0,
    },
    {
      level: 'custom',
      price: 0,
      front_tx_count: 0,
      estimated_seconds: 0,
      base_fee: 0,
    },
  ]);
  const [isGnosisAccount, setIsGnosisAccount] = useState(false);
  const [gnosisDrawerVisible, setGnosisDrawerVisble] = useState(false);
  const [, resolveApproval, rejectApproval] = useApproval();
  const wallet = useWallet();
  const [support1559, setSupport1559] = useState(true); // chain.eip['1559']
  const [isLedger, setIsLedger] = useState(false);
  const [useLedgerLive, setUseLedgerLive] = useState(false);
  const [hasConnectedLedgerHID, setHasConnectedLedgerHID] = useState(false);

  const {
    data = '0x',
    from,
    gas,
    gasPrice,
    nonce,
    to,
    value,
    maxFeePerGas,
    isSpeedUp,
    isCancel,
    isSend,
  } = normalizeTxParams(params.data[0]);
  let updateNonce = true;
  if (isCancel || isSpeedUp || (nonce && from === to) || nonceChanged)
    updateNonce = false;

  const getGasPrice = () => {
    let result = '';
    if (maxFeePerGas) {
      result = isHexString(maxFeePerGas)
        ? maxFeePerGas
        : intToHex(maxFeePerGas);
    }
    if (gasPrice) {
      result = isHexString(gasPrice) ? gasPrice : intToHex(parseInt(gasPrice));
    }
    if (Number.isNaN(+result)) {
      result = '';
    }
    return result;
  };
  const [tx, setTx] = useState<Tx>({
    chainId,
    data: data || '0x', // can not execute with empty string, use 0x instead
    from,
    gas: gas || params.data[0].gasLimit,
    gasPrice: getGasPrice(),
    nonce,
    to,
    value,
  });
  const [realNonce, setRealNonce] = useState('');
  const [gasLimit, setGasLimit] = useState<string | undefined>(undefined);
  const [forceProcess, setForceProcess] = useState(false);
  const [safeInfo, setSafeInfo] = useState<SafeInfo | null>(null);
  const [maxPriorityFee, setMaxPriorityFee] = useState(0);

  const checkTx = async (address: string) => {
    try {
      setSecurityCheckStatus('loading');
      const res = await wallet.openapi.checkTx(
        {
          ...tx,
          nonce: tx.nonce || '0x1',
          data: tx.data,
          value: tx.value || '0x0',
          gas: tx.gas || '',
        }, // set a mock nonce for check if dapp not set it
        origin,
        address,
        !(nonce && tx.from === tx.to)
      );
      setSecurityCheckStatus(res.decision);
      setSecurityCheckAlert(res.alert);
      setForceProcess(true);
    } catch (e: any) {
      const res = await checkTxSP(
        {
          ...tx,
          nonce: tx.nonce || '0x1',
          data: tx.data,
          value: tx.value || '0x0',
          gas: tx.gas || '',
        }, // set a mock nonce for check if dapp not set it
        origin,
        address,
        !(nonce && tx.from === tx.to)
      );
      setSecurityCheckStatus(res.decision);
      setSecurityCheckAlert(res.alert);
    }
  };

  const explainTx = async (address: string) => {
    const res = await wallet.openapi.explainTx(
      {
        ...tx,
        nonce: tx.nonce,
        data: tx.data,
        value: tx.value || '0x0',
        gas: tx.gas || '', // set gas limit if dapp not set
      },
      origin,
      address,
      updateNonce
    );
    console.log({ res });
    if (res) {
      if (!gasLimit) {
        // use server response gas limit
        setGasLimit(res.recommend.gas);
      }
      setTxDetail(res);
      const localNonce = (await wallet.getNonceByChain(tx.from, chainId)) || 0;
      if (updateNonce && !isGnosisAccount) {
        setRealNonce(res.recommend.nonce);
      } // do not overwrite nonce if from === to(cancel transaction)
      setPreprocessSuccess(res.pre_exec.success);
      wallet.addTxExplainCache({
        address,
        chainId,
        nonce: updateNonce
          ? Math.max(Number(res.recommend.nonce), localNonce)
          : Number(tx.nonce),
        explain: res,
      });
      return res;
    } else {
      const provider = new JsonRpcProvider(currentNetwork.rpcURL);
      const result = await explainTxSP(
        {
          ...tx,
          nonce: tx.nonce,
          data: tx.data,
          value: tx.value || '0x0',
          gas: tx.gas || '', // set gas limit if dapp not set
        },
        origin,
        address,
        updateNonce,
        provider
      );
      if (!gasLimit) {
        // use server response gas limit
        setGasLimit(result.recommend.gas);
      }
      setTxDetail(result);
      const localNonce = (await wallet.getNonceByChain(tx.from, chainId)) || 0;
      if (updateNonce && !isGnosisAccount) {
        setRealNonce(result.recommend.nonce);
      } // do not overwrite nonce if from === to(cancel transaction)
      setPreprocessSuccess(result.pre_exec.success);
      wallet.addTxExplainCache({
        address,
        chainId,
        nonce: updateNonce
          ? Math.max(Number(result.recommend.nonce), localNonce)
          : Number(tx.nonce),
        explain: result,
      });
      return result;
    }
  };

  const explain = async () => {
    try {
      const currentAccount =
        isGnosis && account ? account : await wallet.getCurrentAccount();
      setIsReady(false);
      const res = await explainTx(currentAccount!.address);
      if (res.pre_exec.success) {
        await checkTx(currentAccount!.address);
      }
      setIsReady(true);
    } catch (e: any) {
      console.log(e);
      setIsReady(true);
      Modal.error({
        title: t('Error'),
        content: e.message || JSON.stringify(e),
      });
    }
  };

  const handleGnosisConfirm = async (account: Account) => {
    if (params.session.origin !== INTERNAL_REQUEST_ORIGIN || isSend) {
      const params: any = {
        from: tx.from,
        to: tx.to,
        data: tx.data,
        value: tx.value,
      };
      if (nonceChanged) {
        params.nonce = realNonce;
      }
      await wallet.buildGnosisTransaction(tx.from, account, params);
    }
    const hash = await wallet.getGnosisTransactionHash();
    resolveApproval({
      data: [hash, account.address],
      session: params.session,
      isGnosis: true,
      account,
      uiRequestComponent: 'SignText',
    });
  };
  const handleAllow = async () => {
    if (!selectedGas) return;
    if (!forceProcess && securityCheckStatus !== 'pass') {
      return;
    }

    const currentAccount =
      isGnosis && account ? account : await wallet.getCurrentAccount();

    try {
      validateGasPriceRange(tx);
    } catch (e) {
      Modal.error({
        title: t('Error'),
        content: e.message || JSON.stringify(e),
      });
      return;
    }
    const selected: ChainGas = {
      lastTimeSelect: selectedGas.level === 'custom' ? 'gasPrice' : 'gasLevel',
    };
    if (selectedGas.level === 'custom') {
      if (support1559) {
        selected.gasPrice = parseInt(tx.maxFeePerGas!);
      } else {
        selected.gasPrice = parseInt(tx.gasPrice!);
      }
    } else {
      selected.gasLevel = selectedGas.level;
    }
    await wallet.updateLastTimeGasSelection(chainId, selected);
    const transaction: Tx = {
      from: tx.from,
      to: tx.to,
      data: tx.data,
      nonce: tx.nonce,
      value: tx.value,
      chainId: tx.chainId || currentNetwork.chainId,
      gas: '',
      gasPrice,
    };
    if (support1559) {
      transaction.maxFeePerGas = tx.maxFeePerGas;
      transaction.maxPriorityFeePerGas = intToHex(maxPriorityFee);
    } else {
      (transaction as Tx).gasPrice = tx.gasPrice;
    }
    if (txDetail?.type_send) {
      await wallet.cacheAdditionalPayload({
        token: {
          symbol: txDetail.type_send.token.symbol,
          decimals: txDetail.type_send.token.decimals,
          address: txDetail.type_send.token.id,
          isNative: txDetail.type_send.token.id === AddressZero,
        },
        amount: BigNumber.from(
          clampHexNum(txDetail.type_send.token.raw_amount_hex_str)
            ? txDetail.type_send.token.raw_amount_hex_str
            : txDetail.type_send.token_amount
        ),
        transactionType: TransactionType.Send,
      });
    }
    if (currentAccount?.type && WaitingSignComponent[currentAccount.type]) {
      resolveApproval({
        ...transaction,
        isSend,
        nonce: realNonce || tx.nonce,
        gasLimit,
        gas: gasLimit,
        uiRequestComponent: WaitingSignComponent[currentAccount.type],
        type: currentAccount.type,
        address: currentAccount.address,
        traceId: undefined,
        extra: {
          brandName: currentAccount.brandName,
        },
      });
      return;
    }
    if (currentAccount.type === KEYRING_TYPE.GnosisKeyring) {
      setGnosisDrawerVisble(true);
      return;
    }

    ReactGA.event({
      category: 'Transaction',
      action: 'Submit',
      label: currentAccount.brandName,
    });
    resolveApproval({
      ...transaction,
      nonce: realNonce || tx.nonce,
      gas: gasLimit,
      gasPrice: intToHex(selectedGas.price),
      isSend,
      traceId: undefined,
    });
  };

  const handleGasChange = (gas) => {
    setSelectedGas({
      level: gas.level,
      front_tx_count: gas.front_tx_count,
      estimated_seconds: gas.estimated_seconds,
      base_fee: gas.base_fee,
      price: gas.price,
    });
    if (gas.level === 'custom') {
      setGasList(
        gasList.map((item) => {
          if (item.level === 'custom') return gas;
          return item;
        })
      );
    }
    const beforeNonce = realNonce || tx.nonce;
    const afterNonce = intToHex(gas.nonce);
    if (support1559) {
      setTx({
        ...tx,
        maxFeePerGas: intToHex(Math.round(gas.price)),
        gas: intToHex(gas.gasLimit),
        nonce: afterNonce,
      });
    } else {
      setTx({
        ...tx,
        gasPrice: intToHex(Math.round(gas.price)),
        gas: intToHex(gas.gasLimit),
        nonce: afterNonce,
      });
    }
    setGasLimit(intToHex(gas.gasLimit));
    if (!isGnosisAccount) {
      setRealNonce(afterNonce);
    } else {
      if (safeInfo && safeInfo.nonce <= gas.nonce) {
        setRealNonce(afterNonce);
      } else {
        safeInfo && setRealNonce(`0x${safeInfo.nonce.toString(16)}`);
      }
    }
    if (beforeNonce !== afterNonce) {
      setNonceChanged(true);
    }
  };

  const handleMaxPriorityFeeChange = (fee: number) => {
    setMaxPriorityFee(fee);
  };

  const handleCancel = () => {
    rejectApproval('User rejected the request.');
  };

  const handleGnosisDrawerCancel = () => {
    setGnosisDrawerVisble(false);
  };

  const handleForceProcessChange = (checked: boolean) => {
    setForceProcess(checked);
  };

  const handleTxChange = (obj: Record<string, any>) => {
    setTx({
      ...tx,
      ...obj,
    });
  };

  const listGasCustom = (gasETA: number, custom: number) => {
    const gasList = [
      {
        level: 'slow',
        front_tx_count: 0,
        price: Math.ceil((gasETA * 0.8) / 10 ** 9) * 10 ** 9,
        estimated_seconds: 0,
        base_fee: 0,
      },
      {
        level: 'normal',
        front_tx_count: 0,
        price: gasETA,
        estimated_seconds: 0,
        base_fee: 0,
      },
      {
        level: 'fast',
        front_tx_count: 0,
        price: Math.ceil((gasETA * 1.2) / 10 ** 9) * 10 ** 9,
        estimated_seconds: 0,
        base_fee: 0,
      },
      {
        level: 'custom',
        price: custom,
        front_tx_count: 0,
        estimated_seconds: 0,
        base_fee: 0,
      },
    ];
    return gasList;
  };

  const loadGasMarket = async (custom?: number): Promise<GasLevel[]> => {
    try {
      const provider = new JsonRpcProvider(currentNetwork.rpcURL);
      const gasPrice = await provider.getGasPrice();
      const lists = listGasCustom(
        Math.ceil(+gasPrice / 10 ** 9) * 10 ** 9,
        custom || 0
      );
      setGasList(lists);
      return lists;
    } catch (error) {
      console.log(error);
      return gasList;
    }
  };

  const checkCanProcess = async () => {
    const session = params.session;
    const currentAccount =
      isGnosis && account ? account : await wallet.getCurrentAccount();
    const site = await wallet.getConnectedSite(session.origin);

    if (currentAccount.type === KEYRING_TYPE.WatchAddressKeyring) {
      setCanProcess(false);
    }
    if (currentAccount.type === KEYRING_TYPE.GnosisKeyring || isGnosis) {
      const networkId = await wallet.getGnosisNetworkId(currentAccount.address);

      if ((chainId || CHAINS[site!.chain].id) !== Number(networkId)) {
        setCanProcess(false);
      }
    }
  };

  const getSafeInfo = async () => {
    const currentAccount = await wallet.getCurrentAccount();
    const networkId = await wallet.getGnosisNetworkId(currentAccount.address);
    const safeInfo = await Safe.getSafeInfo(currentAccount.address, networkId);
    setSafeInfo(safeInfo);
    if (Number(tx.nonce || 0) < safeInfo.nonce) {
      setTx({
        ...tx,
        nonce: `0x${safeInfo.nonce.toString(16)}`,
      });
    }
    if (Number(realNonce || 0) < safeInfo.nonce) {
      setRealNonce(`0x${safeInfo.nonce.toString(16)}`);
    }
  };

  const init = async () => {
    const currentAccount =
      isGnosis && account ? account : await wallet.getCurrentAccount();
    const is1559 =
      support1559 && SUPPORT_1559_KEYRING_TYPE.includes(currentAccount.type);
    setIsLedger(currentAccount?.type === KEYRING_CLASS.HARDWARE.LEDGER);
    setUseLedgerLive(await wallet.isUseLedgerLive());
    setHasConnectedLedgerHID(await hasConnectedLedgerDevice());
    setIsHardware(
      !!Object.values(HARDWARE_KEYRING_TYPES).find(
        (item) => item.type === currentAccount.type
      )
    );
    ReactGA.event({
      category: 'Transaction',
      action: 'init',
      label: currentAccount.brandName,
    });

    if (currentAccount.type === KEYRING_TYPE.GnosisKeyring) {
      setIsGnosisAccount(true);
      await getSafeInfo();
    }
    checkCanProcess();
    const lastTimeGas: ChainGas | null = await wallet.getLastTimeGasSelection(
      chainId
    );
    let customGasPrice = 0;

    if (lastTimeGas?.lastTimeSelect === 'gasPrice' && lastTimeGas.gasPrice) {
      // use cached gasPrice if exist
      customGasPrice = lastTimeGas.gasPrice;
    }
    if (isSpeedUp || isCancel) {
      // use gasPrice set by dapp when it's a speedup or cancel tx
      customGasPrice = parseInt(tx.gasPrice!);
    }
    const gasList = await loadGasMarket(customGasPrice);
    let gas: GasLevel | null = null;

    if (isSpeedUp || isCancel || lastTimeGas?.lastTimeSelect === 'gasPrice') {
      gas = gasList.find((item) => item.level === 'custom')!;
    } else if (
      lastTimeGas?.lastTimeSelect &&
      lastTimeGas?.lastTimeSelect === 'gasLevel'
    ) {
      const target = gasList.find(
        (item) => item.level === lastTimeGas?.gasLevel
      )!;
      gas = target;
    } else {
      // no cache, use the fast level in gasMarket
      gas = gasList.find((item) => item.level === 'fast')!;
    }
    setSelectedGas(gas);
    setSupport1559(is1559);
    if (is1559) {
      setTx(
        convertLegacyTo1559({
          ...tx,
          gasPrice: intToHex(Number(gas.price)),
        })
      );
    } else {
      setTx({
        ...tx,
        gasPrice: intToHex(Number(gas.price)),
      });
    }
    setInited(true);
  };

  const handleIsGnosisAccountChange = async () => {
    if (params.session.origin !== INTERNAL_REQUEST_ORIGIN) {
      await wallet.clearGnosisTransaction();
    }
  };

  useEffect(() => {
    if (!currentNetwork.rpcURL) return;
    init();
  }, [currentNetwork.rpcURL]);

  useEffect(() => {
    if (isGnosisAccount) {
      handleIsGnosisAccountChange();
    }
  }, [isGnosisAccount]);

  useEffect(() => {
    if (!inited) return;
    explain();
  }, [tx, inited]);

  useEffect(() => {
    (async () => {
      const currentAccount = await wallet.getCurrentAccount();
      if (
        [
          KEYRING_CLASS.MNEMONIC,
          KEYRING_CLASS.PRIVATE_KEY,
          KEYRING_CLASS.WATCH,
        ].includes(currentAccount.type)
      ) {
        setSubmitText('Sign');
        setCheckText('Sign');
      } else {
        setSubmitText('Proceed');
        setCheckText('Proceed');
      }
      if (['danger', 'forbidden'].includes(securityCheckStatus)) {
        setSubmitText('Continue');
      }
    })();
  }, [securityCheckStatus]);

  const approvalTxStyle: Record<string, string> = {};
  if (isLedger && !useLedgerLive && !hasConnectedLedgerHID) {
    approvalTxStyle.paddingBottom = '230px';
  }
  return (
    <>
      <div
        className={clsx('approval-tx', {
          'pre-process-failed': !preprocessSuccess,
        })}
        style={approvalTxStyle}
      >
        <AccountCard />
        {txDetail && (
          <>
            {txDetail && (
              <TxTypeComponent
                isReady={isReady}
                txDetail={txDetail}
                chainName={currentNetwork?.name}
                raw={{
                  ...tx,
                  nonce: realNonce || tx.nonce,
                  gas: tx.gas || gasLimit!,
                }}
                onChange={handleTxChange}
                tx={{
                  ...tx,
                  nonce: realNonce || tx.nonce,
                  gas: gasLimit,
                }}
                isSpeedUp={isSpeedUp}
              />
            )}
            <GasSelector
              isReady={isReady}
              tx={tx}
              gasLimit={gasLimit}
              noUpdate={isCancel || isSpeedUp}
              gasList={gasList}
              selectedGas={selectedGas}
              gas={{
                ...(txDetail
                  ? txDetail.gas
                  : {
                    estimated_gas_cost_usd_value: 0,
                    estimated_gas_cost_value: 0,
                    estimated_seconds: 0,
                    estimated_gas_used: 0,
                  }),
                front_tx_count: 0,
                max_gas_cost_usd_value: 0,
                max_gas_cost_value: 0,
              }}
              recommendGasLimit={Number(txDetail.recommend.gas)}
              chainId={chainId}
              onChange={handleGasChange}
              onMaxPriorityFeeChange={handleMaxPriorityFeeChange}
              nonce={realNonce || tx.nonce}
              disableNonce={
                isSpeedUp || isCancel || !advancedSetting.showNonceSelector
              }
              is1559={support1559}
              isHardware={isHardware}
            />
            {/* <InputGas inputGas={inputGas} setInputGas={setInputGas} /> */}
            {isLedger && !useLedgerLive && !hasConnectedLedgerHID && (
              <LedgerWebHIDAlert connected={hasConnectedLedgerHID} />
            )}
            <SecurityCheckBar
              status={securityCheckStatus}
              alert={securityCheckAlert}
              // onClick={() => setShowSecurityCheckDetail(true)}
              onCheck={async () =>
                checkTx(
                  (isGnosis && account
                    ? account
                    : await wallet.getCurrentAccount()
                  ).address
                )
              }
            />
            {isLedger && !useLedgerLive && !hasConnectedLedgerHID && (
              <LedgerWebHIDAlert connected={hasConnectedLedgerHID} />
            )}
            {!(isLedger && !useLedgerLive && !hasConnectedLedgerHID) && (
              <>
                <div className="flex gap-2 items-start">
                  <img src={IconAlert} />
                  <div>
                    <p className="mb-2 text-15 font-medium force-process">
                      {t('Preexecution failed')}
                    </p>
                    <p className="text-14 mb-2 force-process">
                      {txDetail.pre_exec.err_msg}
                    </p>
                  </div>
                </div>
                <div className="force-process">
                  <Checkbox
                    checked={forceProcess}
                    onChange={(e) => handleForceProcessChange(e)}
                  >
                    {t('processAnyway')}
                  </Checkbox>
                </div>
              </>
            )}
            <StrayButtons
              backTitle={t('Cancel')}
              nextTitle={t(submitText)}
              disabledNext={
                txDetail?.pre_exec.success
                  ? !canProcess
                    ? true
                    : !isReady ||
                    (selectedGas ? selectedGas.price < 0 : true) ||
                    (isGnosisAccount ? !safeInfo : false) ||
                    (isLedger && !useLedgerLive && !hasConnectedLedgerHID)
                  : !canProcess
                    ? true
                    : !forceProcess ||
                    (selectedGas ? selectedGas.price < 0 : true) ||
                    (isGnosisAccount ? !safeInfo : false) ||
                    (isLedger && !useLedgerLive && !hasConnectedLedgerHID)
              }
              onNext={handleAllow}
              onBack={handleCancel}
            />
          </>
        )}
        {isGnosisAccount && safeInfo && (
          <Drawer
            placement="bottom"
            height="400px"
            className="gnosis-drawer"
            open={gnosisDrawerVisible}
            onClose={() => setGnosisDrawerVisble(false)}
            maskClosable
          >
            <GnosisDrawer
              safeInfo={safeInfo}
              onCancel={handleGnosisDrawerCancel}
              onConfirm={handleGnosisConfirm}
            />
          </Drawer>
        )}
      </div>
    </>
  );
};

export default SignTx;
