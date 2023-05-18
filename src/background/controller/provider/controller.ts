import Common, { Hardfork } from '@ethereumjs/common';
import { JsonRpcProvider } from '@ethersproject/providers';
import { TransactionFactory } from '@ethereumjs/tx';
import { BigNumber, ethers } from 'ethers';
import { bufferToHex, isHexString, intToHex } from 'ethereumjs-util';
import { stringToHex } from 'web3-utils';
import { ethErrors } from 'eth-rpc-errors';
import {
  normalize as normalizeAddress,
  recoverPersonalSignature,
} from 'eth-sig-util';
import cloneDeep from 'lodash/cloneDeep';
import {
  keyringService,
  permissionService,
  sessionService,
  openapiService,
  preferenceService,
  transactionHistoryService,
  pageStateCacheService,
  signTextHistoryService,
  i18n,
} from 'background/service';
import { notification } from 'background/webapi';
import { Session } from 'background/service/session';
import { Tx } from 'background/service/openapi';
import RpcCache from 'background/utils/rpcCache';
import Wallet from '../wallet';
import {
  CHAINS,
  CHAINS_ENUM,
  SAFE_RPC_METHODS,
  KEYRING_TYPE,
  AddressZero,
} from 'consts';
import buildinProvider from 'background/utils/buildinProvider';
import BaseController from '../base';
import { Account } from 'background/service/preference';
import { validateGasPriceRange, is1559Tx } from '@/utils/transaction';
import 'reflect-metadata';
import {
  TransactionPendingItem,
  TransactionType,
} from '@/background/service/transactionHistory';

const getRawTransaction = (tx) => {
  function addKey(accum, key) {
    if (tx[key]) {
      accum[key] = tx[key];
    }
    return accum;
  }

  // Extract the relevant parts of the transaction and signature
  const txFields =
    'accessList chainId data gasPrice gasLimit maxFeePerGas maxPriorityFeePerGas nonce to type value'.split(
      ' '
    );
  const sigFields = 'v r s'.split(' ');

  // Seriailze the signed transaction
  const raw = ethers.utils.serializeTransaction(
    txFields.reduce(addKey, {}),
    sigFields.reduce(addKey, {})
  );

  return raw;
};

interface ApprovalRes extends Tx {
  type?: string;
  address?: string;
  uiRequestComponent?: string;
  isSend?: boolean;
  isSpeedUp?: boolean;
  isCancel?: boolean;
  isGnosis?: boolean;
  account?: Account;
  extra?: Record<string, any>;
  traceId?: string;
}

interface Web3WalletPermission {
  // The name of the method corresponding to the permission
  parentCapability: string;

  // The date the permission was granted, in UNIX epoch time
  date?: number;
}

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const v1SignTypedDataVlidation = ({
  data: {
    params: [, from],
  },
}) => {
  const currentAddress = preferenceService
    .getCurrentAccount()
    ?.address.toLowerCase();
  if (from.toLowerCase() !== currentAddress)
    throw ethErrors.rpc.invalidParams('from should be same as current address');
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const signTypedDataVlidation = ({
  data: {
    params: [from],
  },
}) => {
  const currentAddress = preferenceService
    .getCurrentAccount()
    ?.address.toLowerCase();
  if (from.toLowerCase() !== currentAddress)
    throw ethErrors.rpc.invalidParams('from should be same as current address');
};

class ProviderController extends BaseController {
  ethRpc = (req, forceChainServerId?: string) => {
    const {
      data: { method, params },
      session: { origin },
    } = req;

    if (
      !permissionService.hasPermission(origin) &&
      !SAFE_RPC_METHODS.includes(method)
    ) {
      throw ethErrors.provider.unauthorized();
    }

    const site = permissionService.getSite(origin);
    let chainServerId = CHAINS[CHAINS_ENUM.ETH].serverId;
    if (site) {
      chainServerId = ''; // CHAINS[site.chain].serverId
    }
    if (forceChainServerId) {
      chainServerId = forceChainServerId;
    }

    const currentAddress =
      preferenceService.getCurrentAccount()?.address.toLowerCase() || '0x';
    const cache = RpcCache.get(currentAddress, {
      method,
      params,
      chainId: chainServerId,
    });
    if (cache) return cache;

    const promise = openapiService
      .ethRpc({
        origin: encodeURIComponent(origin),
        method,
        params,
      })
      .then((result) => {
        RpcCache.set(currentAddress, {
          method,
          params,
          result,
          chainId: chainServerId,
        });
        return result;
      });
    RpcCache.set(currentAddress, {
      method,
      params,
      result: promise,
      chainId: chainServerId,
    });
    return promise;
  };

  ethRequestAccounts = async ({ session: { origin } }) => {
    if (!permissionService.hasPermission(origin)) {
      throw ethErrors.provider.unauthorized();
    }

    const _account = await this.getCurrentAccount();
    const account = _account ? [_account.address.toLowerCase()] : [];
    sessionService.broadcastEvent('accountsChanged', account);
    const connectSite = permissionService.getConnectedSite(origin);

    if (connectSite) {
      sessionService.broadcastEvent(
        'chainChanged',
        {
          chain: intToHex(+connectSite.chainId),
          networkVersion: String(connectSite.chainId), // chain.network
        },
        origin
      );
    }
    return account;
  };

  ethAccounts = async ({ session: { origin } }) => {
    if (!permissionService.hasPermission(origin)) {
      return [];
    }

    const _account = await this.getCurrentAccount();
    const account = _account ? [_account.address.toLowerCase()] : [];
    return account;
  };

  ethCoinbase = async ({ session: { origin } }) => {
    if (!permissionService.hasPermission(origin)) {
      return null;
    }

    const account = await this.getCurrentAccount();
    return account ? account.address.toLowerCase() : null;
  };

  @Reflect.metadata('SAFE', true)
  ethChainId = ({ session }: { session: Session }) => {
    const origin = session.origin;
    const site = permissionService.getWithoutUpdate(origin);
    return intToHex(+(site?.chainId || 1));
  };

  @Reflect.metadata('APPROVAL', [
    'SignTx',
    ({
      data: {
        params: [tx],
      },
      session,
    }) => {
      const currentAddress = preferenceService
        .getCurrentAccount()
        ?.address.toLowerCase();

      if (tx.from.toLowerCase() !== currentAddress) {
        throw ethErrors.rpc.invalidParams(
          'from should be same as current address'
        );
      }
      if ('chainId' in tx) {
        const chainlist = permissionService.getAllNetworks();
        const currentChain = permissionService.isInternalOrigin(session.origin)
          ? chainlist.find((chain) => +chain.chainId == +tx?.chainId)!.chainId
          : permissionService.getConnectedSite(session.origin)?.chainId;
        if (!currentChain || Number(tx.chainId) !== +currentChain) {
          throw ethErrors.rpc.invalidParams(
            'chainId should be same as current chainId'
          );
        }
      }
    },
  ])
  ethSendTransaction = async (options: {
    data: {
      params: any;
    };
    session: Session;
    approvalRes: ApprovalRes;
    pushed: boolean;
    result: any;
  }) => {
    if (options.pushed) return options.result;
    const {
      data: {
        params: [txParams],
      },
      session: { origin },
      approvalRes,
    } = cloneDeep(options);
    origin;
    const keyring = await this._checkAddress(txParams.from);
    const isSend = !!txParams.isSend;
    const isSpeedUp = !!txParams.isSpeedUp;
    const isCancel = !!txParams.isCancel;
    const extra = approvalRes.extra;
    let signedTransactionSuccess = false;
    delete txParams.isSend;
    delete approvalRes.isSend;
    delete approvalRes.address;
    delete approvalRes.type;
    delete approvalRes.uiRequestComponent;
    delete approvalRes.traceId;
    delete approvalRes.extra;
    let is1559 = is1559Tx(approvalRes);
    if (
      is1559 &&
      approvalRes.maxFeePerGas === approvalRes.maxPriorityFeePerGas
    ) {
      // fallback to legacy transaction if maxFeePerGas is equal to maxPriorityFeePerGas
      approvalRes.gasPrice = approvalRes.maxFeePerGas;
      delete approvalRes.maxFeePerGas;
      delete approvalRes.maxPriorityFeePerGas;
      is1559 = false;
    }
    const common = Common.custom(
      { chainId: approvalRes.chainId },
      { hardfork: Hardfork.London }
    );
    const txData = { ...approvalRes, gasLimit: approvalRes.gas };
    if (is1559) {
      txData.type = '0x2';
    }
    const tx = TransactionFactory.fromTxData(txData, {
      common,
    });
    const currentAccount = preferenceService.getCurrentAccount()!;
    let opts;
    opts = extra;
    if (currentAccount.type === KEYRING_TYPE.GnosisKeyring) {
      buildinProvider.currentProvider.currentAccount =
        approvalRes!.account!.address;
      buildinProvider.currentProvider.currentAccountType =
        approvalRes!.account!.type;
      buildinProvider.currentProvider.currentAccountBrand =
        approvalRes!.account!.brandName;
      try {
        const provider = new ethers.providers.Web3Provider(
          buildinProvider.currentProvider
        );
        opts = {
          provider,
        };
      } catch (e) {
        console.log(e);
      }
    }
    const signedTx = await keyringService.signTransaction(
      keyring,
      tx,
      txParams.from,
      opts
    );
    if (currentAccount.type === KEYRING_TYPE.GnosisKeyring) return;

    const currentNetwork = permissionService.getNetworkByChainId(
      approvalRes?.chainId || 1
    );
    const provider = new JsonRpcProvider(currentNetwork.rpcURL);

    const onTranscationSubmitted = (hash: string) => {
      // const chainId = permissionService.isInternalOrigin(origin)
      //   ? Object.values(CHAINS).find(
      //       (chain) => chain.id === approvalRes.chainId
      //     )!.id
      //   : permissionService.getConnectedSite(origin)!.chainId;
      // const cacheExplain = transactionHistoryService.getExplainCache({
      //   address: txParams.from,
      //   chainId: Number(approvalRes.chainId),
      //   nonce: Number(approvalRes.nonce),
      // });
      if (isSend) {
        pageStateCacheService.clear();
      }

      const payload = transactionHistoryService.getAdditionalPayload();
      const txPending: TransactionPendingItem = {
        from: approvalRes.from,
        to: approvalRes.to,
        data: approvalRes.data || '0x',
        nonce: +approvalRes.nonce,
        chainId: +approvalRes.chainId,
        type: 0,
        hash,
        maxPriorityFeePerGas: BigNumber.from(clampHexNum(approvalRes.gasPrice)),
        maxFeePerGas: BigNumber.from(clampHexNum(approvalRes.gasPrice)),
        gasPrice: BigNumber.from(clampHexNum(approvalRes.gasPrice)),
        gasLimit: BigNumber.from(
          +clampHexNum(approvalRes.gasLimit) ||
            +clampHexNum(approvalRes.gas) ||
            '0'
        ),
        value: BigNumber.from(clampHexNum(approvalRes.value)),
        createdAt: ~~(Date.now() / 1000),
        ...payload, // don't change the order!!!
        amount:
          payload.amount || BigNumber.from(clampHexNum(approvalRes.value)),
        token: payload.token || {
          address: AddressZero,
          decimals: currentNetwork.decimals,
          isNative: true,
          symbol: currentNetwork.symbol,
        },
        transactionType: payload.transactionType || TransactionType.Default,
      };

      if (isCancel || isSpeedUp) {
        transactionHistoryService.replaceTransactionPending({
          ...txPending,
          hash: payload.oldTxHash || hash,
        });
      } else {
        transactionHistoryService.addTransactionPending(txPending);
      }
      transactionHistoryService.clearCachedAdditionalPayload();

      // transactionHistoryService.addTx(
      //   {
      //     rawTx: approvalRes,
      //     createdAt: Date.now(),
      //     isCompleted: false,
      //     hash,
      //     failed: false,
      //   },
      //   cacheExplain
      // );
      // transactionWatchService.addTx(
      //   `${txParams.from}_${approvalRes.nonce}_${chainId}`,
      //   {
      //     nonce: approvalRes.nonce,
      //     hash,
      //     chainId,
      //   }
      // );
    };

    if (typeof signedTx === 'string') {
      onTranscationSubmitted(signedTx);
      return signedTx;
    }

    signedTransactionSuccess = true;
    signedTransactionSuccess;

    // handle send transaction
    try {
      validateGasPriceRange(approvalRes);
      const signedTransaction = signedTx?.serialize
        ? bufferToHex(signedTx.serialize())
        : getRawTransaction({
            ...approvalRes,
            r: bufferToHex(signedTx.r),
            s: bufferToHex(signedTx.s),
            v: +bufferToHex(signedTx.v),
            value: approvalRes.value || '0x0',
            gasLimit: '0x' + (+(approvalRes.gas || '0x0') * 1.2).toString(16),
            type: signedTx.type,
          });
      const txHash = await provider.sendTransaction(signedTransaction);
      onTranscationSubmitted(txHash.hash);
      return txHash.hash;
    } catch (e: any) {
      console.log(e);
      if (!isSpeedUp && !isCancel) {
        const cacheExplain = transactionHistoryService.getExplainCache({
          address: txParams.from,
          chainId: Number(approvalRes.chainId),
          nonce: Number(approvalRes.nonce),
        });
        transactionHistoryService.addSubmitFailedTransaction(
          {
            rawTx: approvalRes,
            createdAt: Date.now(),
            isCompleted: true,
            hash: '',
            failed: false,
            isSubmitFailed: true,
          },
          cacheExplain
        );
      }
      const errMsg = e.message || JSON.stringify(e);
      notification.create(undefined, i18n.t('Transaction push failed'), errMsg);
      throw new Error(errMsg);
    }
  };

  @Reflect.metadata('SAFE', true)
  netVersion = (req) => {
    return this.ethRpc({
      ...req,
      data: { method: 'net_version', params: [] },
    });
  };

  @Reflect.metadata('SAFE', true)
  web3ClientVersion = () => {
    return `Jigstack/${process.env.release}`;
  };

  @Reflect.metadata('APPROVAL', [
    'SignText',
    ({
      data: {
        params: [, from],
      },
    }) => {
      const currentAddress = preferenceService
        .getCurrentAccount()
        ?.address.toLowerCase();
      if (from.toLowerCase() !== currentAddress)
        throw ethErrors.rpc.invalidParams(
          'from should be same as current address'
        );
    },
  ])
  personalSign = async ({ data, approvalRes, session }) => {
    if (!data.params) return;
    const [string, from] = data.params;
    const hex = isHexString(string) ? string : stringToHex(string);
    const keyring = await this._checkAddress(from);
    const result = await keyringService.signPersonalMessage(
      keyring,
      { data: hex, from },
      approvalRes?.extra
    );
    signTextHistoryService.createHistory({
      address: from,
      text: string,
      origin: session.origin,
      type: 'personalSign',
    });
    return result;
  };

  @Reflect.metadata('APPROVAL', [
    'SignText',
    ({
      data: {
        params: [, from],
      },
    }) => {
      const currentAddress = preferenceService
        .getCurrentAccount()
        ?.address.toLowerCase();

      if (from.toLowerCase() !== currentAddress)
        throw ethErrors.rpc.invalidParams(
          'from should be same as current address'
        );
    },
  ])
  ethSign = async ({ data, approvalRes, session }) => {
    if (!data.params) return;
    const [string, from] = data.params;
    const hex = isHexString(string) ? string : stringToHex(string);
    const keyring = await this._checkAddress(from);
    const result = await keyringService.signPersonalMessage(
      keyring,
      { data: hex, from },
      approvalRes?.extra
    );
    signTextHistoryService.createHistory({
      address: from,
      text: string,
      origin: session.origin,
      type: 'ethSign',
    });
    return result;
  };

  private _signTypedData = async (from, data, version, extra?) => {
    const keyring = await this._checkAddress(from);
    let _data = data;
    if (version !== 'V1') {
      if (typeof data === 'string') {
        _data = JSON.parse(data);
      }
    }

    return keyringService.signTypedMessage(
      keyring,
      { from, data: _data },
      { version, ...(extra || {}) }
    );
  };

  @Reflect.metadata('APPROVAL', ['SignTypedData', v1SignTypedDataVlidation])
  ethSignTypedData = async ({
    data: {
      params: [data, from],
    },
    session,
    approvalRes,
  }) => {
    const result = await this._signTypedData(
      from,
      data,
      'V1',
      approvalRes?.extra
    );
    signTextHistoryService.createHistory({
      address: from,
      text: data,
      origin: session.origin,
      type: 'ethSignTypedData',
    });
    return result;
  };

  @Reflect.metadata('APPROVAL', ['SignTypedData', v1SignTypedDataVlidation])
  ethSignTypedDataV1 = async ({
    data: {
      params: [data, from],
    },
    session,
    approvalRes,
  }) => {
    const result = await this._signTypedData(
      from,
      data,
      'V1',
      approvalRes?.extra
    );
    signTextHistoryService.createHistory({
      address: from,
      text: data,
      origin: session.origin,
      type: 'ethSignTypedDataV1',
    });
    return result;
  };

  @Reflect.metadata('APPROVAL', ['SignTypedData', signTypedDataVlidation])
  ethSignTypedDataV3 = async ({
    data: {
      params: [from, data],
    },
    session,
    approvalRes,
  }) => {
    const result = await this._signTypedData(
      from,
      data,
      'V3',
      approvalRes?.extra
    );
    signTextHistoryService.createHistory({
      address: from,
      text: data,
      origin: session.origin,
      type: 'ethSignTypedDataV3',
    });
    return result;
  };

  @Reflect.metadata('APPROVAL', ['SignTypedData', signTypedDataVlidation])
  ethSignTypedDataV4 = async ({
    data: {
      params: [from, data],
    },
    session,
    approvalRes,
  }) => {
    const result = await this._signTypedData(
      from,
      data,
      'V4',
      approvalRes?.extra
    );
    signTextHistoryService.createHistory({
      address: from,
      text: data,
      origin: session.origin,
      type: 'ethSignTypedDataV4',
    });
    return result;
  };

  @Reflect.metadata('APPROVAL', [
    'AddChain',
    ({ data, session }) => {
      const connected = permissionService.getConnectedSite(session.origin);
      if (connected) {
        const { chainId } = data.params[0];
        if (Number(chainId) === connected.chainId) {
          return true;
        }
      }
    },
    { height: 520 },
  ])
  walletAddEthereumChain = ({
    data: {
      params: [chainParams],
    },
    session: { origin },
  }) => {
    let chainId = chainParams.chainId;
    if (typeof chainId === 'number') {
      chainId = intToHex(chainId).toLowerCase();
    } else {
      chainId = chainId.toLowerCase();
    }

    if (!chainId) {
      throw new Error('This chain is not supported by Jigstack yet.');
    }

    console.log({ chainId });

    permissionService.updateConnectSite(
      origin,
      {
        chainId,
      },
      true
    );

    sessionService.broadcastEvent(
      'chainChanged',
      {
        chain: chainId,
        networkVersion: chainId,
      },
      origin
    );
    return null;
  };

  @Reflect.metadata('APPROVAL', [
    'AddChain',
    ({ data, session }) => {
      const connected = permissionService.getConnectedSite(session.origin);
      if (connected) {
        const { chainId } = data.params[0];
        if (Number(chainId) === connected.chainId) {
          return true;
        }
      }
    },
    { height: 520 },
  ])
  walletSwitchEthereumChain = this.walletAddEthereumChain;

  @Reflect.metadata('APPROVAL', ['AddAsset', () => null, { height: 520 }])
  walletWatchAsset = () => {
    throw new Error(
      'Jigstack does not support adding tokens in this way for now.'
    );
  };

  walletRequestPermissions = ({ data: { params: permissions } }) => {
    const result: Web3WalletPermission[] = [];
    if (permissions && 'eth_accounts' in permissions[0]) {
      result.push({ parentCapability: 'eth_accounts' });
    }
    return result;
  };

  @Reflect.metadata('SAFE', true)
  walletGetPermissions = ({ session: { origin } }) => {
    const result: Web3WalletPermission[] = [];
    if (Wallet.isUnlocked() && Wallet.getConnectedSite(origin)) {
      result.push({ parentCapability: 'eth_accounts' });
    }
    return result;
  };

  personalEcRecover = ({
    data: {
      params: [data, sig, extra = {}],
    },
  }) => {
    return recoverPersonalSignature({
      ...extra,
      data,
      sig,
    });
  };

  @Reflect.metadata('SAFE', true)
  netListening = () => {
    return true;
  };

  private _checkAddress = async (address) => {
    // eslint-disable-next-line prefer-const
    let { address: currentAddress, type } =
      (await this.getCurrentAccount()) || {};
    currentAddress = currentAddress?.toLowerCase();
    if (
      !currentAddress ||
      currentAddress !== normalizeAddress(address).toLowerCase()
    ) {
      throw ethErrors.rpc.invalidParams({
        message:
          'Invalid parameters: must use the current user address to sign',
      });
    }
    const keyring = await keyringService.getKeyringForAccount(
      currentAddress,
      type
    );

    return keyring;
  };
}

export default new ProviderController();
