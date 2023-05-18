import { createPersistStore, wait } from 'background/utils';
import maxBy from 'lodash/maxBy';
import openapiService, { Tx, ExplainTxResponse } from './openapi';
import { CHAINS, EVENTS } from 'consts';
import { BigNumber } from 'ethers';
import eventBus from '@/eventBus';
import { minBy } from 'lodash';

export interface TxToken {
  symbol: string;
  decimals: number;
  address: string;
  isNative: boolean;
}
export interface TransactionHistoryItem {
  rawTx: Tx;
  createdAt: number;
  isCompleted: boolean;
  hash: string;
  failed: boolean;
  gasUsed?: number;
  isSubmitFailed?: boolean;
}

export interface TransactionGroup {
  chainId: number;
  nonce: number;
  txs: TransactionHistoryItem[];
  isPending: boolean;
  createdAt: number;
  explain: ExplainTxResponse;
  isFailed: boolean;
  isSubmitFailed?: boolean;
}

export enum TransactionType {
  Default = 'Default',
  Santa = 'Santa',
  Swap = 'Swap',
  Send = 'Send',
  Buy = 'Buy',
}

export interface TransactionPendingItem {
  blockHash?: string;
  blockNumber?: number;
  type: number;
  chainId: number;
  nonce: number;
  maxPriorityFeePerGas: BigNumber;
  maxFeePerGas: BigNumber;
  gasPrice: BigNumber | null;
  gasLimit: BigNumber;
  to: string;
  value: BigNumber;
  data: string;
  hash: string;
  from: string;
  createdAt: number;
  amount: BigNumber;
  token: TxToken;
  tokenTo?: TxToken;
  amountTo?: BigNumber;
  transactionType: TransactionType;
}

export interface TransactionsCompletedItem {
  blockHash?: string;
  blockNumber?: number;
  chainId: number;
  byzantium?: boolean;
  confirmations?: number;
  contractAddress?: any;
  cumulativeGasUsed?: BigNumber;
  effectiveGasPrice?: BigNumber;
  from: string;
  gasUsed: BigNumber;
  logsBloom: string;
  status: number;
  to: string;
  transactionHash: string;
  transactionIndex: number;
  type: number;
  value: BigNumber;
  amount: BigNumber;
  createdAt: number;
  token: TxToken;
  tokenTo?: TxToken;
  amountTo?: BigNumber;
  transactionType: TransactionType;
}

export interface AdditionalPayload {
  token?: TxToken;
  tokenTo?: TxToken;
  amount?: BigNumber;
  amountTo?: BigNumber;
  transactionType?: TransactionType;
  oldTxHash?: string;
}

export interface TransactionSwap {
  isSwap: boolean;
  from: string;
  fromToken: {
    symbol: string;
    amount: string;
    decimals: number;
    address: string;
  };
  toToken: {
    symbol: string;
    amount: string;
    decimals: number;
    address: string;
  };
  createdAt: number;
  txHash: string;
}

interface TxHistoryStore {
  transactions: {
    [key: string]: Record<string, TransactionGroup>;
  };
  cacheExplain: {
    [key: string]: TransactionGroup['explain'];
  };
  cachedAdditionalPayload: AdditionalPayload;
  transactionsPending: TransactionPendingItem[];
  transactionsCompleted: TransactionsCompletedItem[];
  transactionsFailed: any;
}

const QUERY_FREQUENCY = [
  [60 * 1000, 2 * 1000],
  [10 * 60 * 1000, 5 * 1000],
  [60 * 60 * 1000, 30 * 1000],
  [24 * 60 * 60 * 1000, 30 * 1000],
];

const _findFrequency = (createdTime) => {
  const now = +new Date();

  return QUERY_FREQUENCY.find(
    ([sinceCreate]) => now - createdTime < sinceCreate
  )?.[1];
};

class TxHistory {
  store!: TxHistoryStore;
  timers = {};

  async init() {
    this.store = await createPersistStore<TxHistoryStore>({
      name: 'txHistory',
      template: {
        transactions: {},
        cacheExplain: {},
        cachedAdditionalPayload: {},
        transactionsPending: [],
        transactionsCompleted: [],
        transactionsFailed: [],
      },
    });
    if (!this.store.transactions) this.store.transactions = {};
    if (!this.store.cacheExplain) this.store.cacheExplain = {};
    if (!this.store.cachedAdditionalPayload)
      this.store.cachedAdditionalPayload = {};
    if (!this.store.transactionsPending) this.store.transactionsPending = [];
    if (!this.store.transactionsCompleted)
      this.store.transactionsCompleted = [];
  }

  getPendingCount(address: string) {
    const normalizedAddress = address.toLowerCase();
    return Object.values(
      this.store.transactions[normalizedAddress] || {}
    ).filter((item) => item.isPending && !item.isSubmitFailed).length;
  }

  addSubmitFailedTransaction(
    tx: TransactionHistoryItem,
    explain: TransactionGroup['explain']
  ) {
    const nonce = Number(tx.rawTx.nonce);
    const chainId = tx.rawTx.chainId;
    const key = `${chainId}-${nonce}`;
    const from = tx.rawTx.from.toLowerCase();

    if (!this.store.transactions[from]) {
      this.store.transactions[from] = {};
    }
    if (this.store.transactions[from][key]) {
      const group = this.store.transactions[from][key];
      group.txs.push(tx);
      this.store.transactions = {
        ...this.store.transactions,
        [from]: {
          ...this.store.transactions[from],
          [key]: group,
        },
      };
    } else {
      this.store.transactions = {
        ...this.store.transactions,
        [from]: {
          ...this.store.transactions[from],
          [key]: {
            chainId: tx.rawTx.chainId,
            nonce,
            txs: [tx],
            createdAt: tx.createdAt,
            isPending: true,
            explain,
            isFailed: false,
            isSubmitFailed: true,
          },
        },
      };
    }

    this.removeExplainCache(`${from.toLowerCase()}-${chainId}-${nonce}`);
  }

  addTx(tx: TransactionHistoryItem, explain: TransactionGroup['explain']) {
    const nonce = Number(tx.rawTx.nonce);
    const chainId = tx.rawTx.chainId;
    const key = `${chainId}-${nonce}`;
    const from = tx.rawTx.from.toLowerCase();

    if (!this.store.transactions[from]) {
      this.store.transactions[from] = {};
    }
    if (this.store.transactions[from][key]) {
      const group = this.store.transactions[from][key];
      group.txs.push(tx);
      if (group.isSubmitFailed) {
        group.isSubmitFailed = false;
      }
      this.store.transactions = {
        ...this.store.transactions,
        [from]: {
          ...this.store.transactions[from],
          [key]: group,
        },
      };
    } else {
      this.store.transactions = {
        ...this.store.transactions,
        [from]: {
          ...this.store.transactions[from],
          [key]: {
            chainId: tx.rawTx.chainId,
            nonce,
            txs: [tx],
            createdAt: tx.createdAt,
            isPending: true,
            explain,
            isFailed: false,
          },
        },
      };
    }

    this.removeExplainCache(`${from.toLowerCase()}-${chainId}-${nonce}`);
  }

  updateSingleTx(tx: TransactionHistoryItem) {
    const nonce = Number(tx.rawTx.nonce);
    const chainId = tx.rawTx.chainId;
    const key = `${chainId}-${nonce}`;
    const from = tx.rawTx.from.toLowerCase();
    const target = this.store.transactions[from][key];
    if (!this.store.transactions[from] || !target) return;
    const index = target.txs.findIndex((t) => t.hash === tx.hash);
    target.txs[index] = tx;
    this.store.transactions = {
      ...this.store.transactions,
      [from]: {
        ...this.store.transactions[from],
        [key]: target,
      },
    };
  }

  async reloadTx(
    {
      address,
      chainId,
      nonce,
    }: {
      address: string;
      chainId: number;
      nonce: number;
    },
    duration = 0
  ) {
    const key = `${chainId}-${nonce}`;
    const from = address.toLowerCase();
    const target = this.store.transactions[from][key];
    const chain = Object.values(CHAINS).find((c) => c.id === chainId)!;
    if (!target) return;
    const { txs } = target;
    try {
      const results = await Promise.all(
        txs.map((tx) =>
          openapiService.getTx(
            chain.serverId,
            tx.hash,
            Number(tx.rawTx.gasPrice)
          )
        )
      );
      const completed = results.find(
        (result) => result.code === 0 && result.status !== 0
      );
      if (!completed) {
        if (duration < 1000 * 15) {
          // maximum retry 15 times;
          setTimeout(() => {
            this.reloadTx({ address, chainId, nonce });
          }, duration + 1000);
        }
        return;
      }
      const completedTx = txs.find((tx) => tx.hash === completed.hash)!;
      this.updateSingleTx({
        ...completedTx,
        gasUsed: completed.gas_used,
      });
      this.completeTx({
        address,
        chainId,
        nonce,
        hash: completedTx.hash,
        success: completed.status === 1,
      });
    } catch (e) {
      if (duration < 1000 * 15) {
        // maximum retry 15 times;
        setTimeout(() => {
          this.reloadTx({ address, chainId, nonce });
        }, duration + 1000);
      }
    }
  }

  getList(address: string) {
    const list = Object.values(
      this.store.transactions[address.toLowerCase()] || {}
    );
    const pendings: TransactionGroup[] = [];
    const completeds: TransactionGroup[] = [];
    if (!list) return { pendings: [], completeds: [] };
    for (let i = 0; i < list.length; i++) {
      if (list[i].isPending && !list[i].isSubmitFailed) {
        pendings.push(list[i]);
      } else {
        completeds.push(list[i]);
      }
    }
    return {
      pendings: pendings.sort((a, b) => {
        if (a.chainId === b.chainId) {
          return b.nonce - a.nonce;
        } else {
          return a.chainId - b.chainId;
        }
      }),
      completeds: completeds
        .sort((a, b) => {
          return b.createdAt - a.createdAt;
        })
        .slice(0, 10),
    };
  }

  completeTx({
    address,
    chainId,
    nonce,
    hash,
    success = true,
    gasUsed,
  }: {
    address: string;
    chainId: number;
    nonce: number;
    hash: string;
    success?: boolean;
    gasUsed?: number;
  }) {
    const key = `${chainId}-${nonce}`;
    const normalizedAddress = address.toLowerCase();
    const target = this.store.transactions[normalizedAddress][key];
    target.isPending = false;
    target.isFailed = !success;
    const index = target.txs.findIndex((tx) => tx.hash === hash);
    if (index !== -1) {
      target.txs[index].isCompleted = true;
      target.txs[index].failed = !success;
      if (gasUsed) {
        target.txs[index].gasUsed = gasUsed;
      }
    }
    this.store.transactions = {
      ...this.store.transactions,
      [normalizedAddress]: {
        ...this.store.transactions[normalizedAddress],
        [key]: target,
      },
    };
    this.clearBefore({ address, chainId, nonce });
    this.clearExpiredTxs(address);
  }

  clearExpiredTxs(address: string) {
    // maximum keep 20 transactions in storage each address since chrome storage maximum useage 5MB
    const normalizedAddress = address.toLowerCase();
    if (this.store.transactions[normalizedAddress]) {
      const txs = Object.values(this.store.transactions[normalizedAddress]);
      if (txs.length <= 20) return;
      txs.sort((a, b) => {
        return a.createdAt - b.createdAt > 0 ? -1 : 1;
      });
      this.store.transactions[normalizedAddress] = txs
        .slice(0, 20)
        .reduce((res, current) => {
          return {
            ...res,
            [`${current.chainId}-${current.nonce}`]: current,
          };
        }, {});
    }
  }

  clearBefore({
    address,
    chainId,
    nonce,
  }: {
    address: string;
    chainId: number;
    nonce: number;
  }) {
    const normalizedAddress = address.toLowerCase();
    const copyHistory = this.store.transactions[normalizedAddress];
    const copyExplain = this.store.cacheExplain;
    for (const k in copyHistory) {
      const t = copyHistory[k];
      if (t.chainId === chainId && t.nonce < nonce && t.isPending) {
        delete copyHistory[k];
      }
    }
    for (const k in copyExplain) {
      const [addr, cacheChainId, cacheNonce] = k.split('-');
      if (
        addr.toLowerCase() === normalizedAddress &&
        Number(cacheChainId) === chainId &&
        Number(cacheNonce) < nonce
      ) {
        delete copyExplain[k];
      }
    }
    this.store.transactions = {
      ...this.store.transactions,
      [normalizedAddress]: copyHistory,
    };
    this.store.cacheExplain = copyExplain;
  }

  addExplainCache({
    address,
    chainId,
    nonce,
    explain,
  }: {
    address: string;
    chainId: number;
    nonce: number;
    explain: ExplainTxResponse;
  }) {
    const key = `${address.toLowerCase()}-${chainId}-${nonce}`;
    this.store.cacheExplain = {
      ...this.store.cacheExplain,
      [key]: explain,
    };
  }

  getExplainCache({
    address,
    chainId,
    nonce,
  }: {
    address: string;
    chainId: number;
    nonce: number;
  }) {
    const key = `${address.toLowerCase()}-${chainId}-${nonce}`;
    return this.store.cacheExplain[key];
  }

  removeExplainCache(key: string) {
    const { cacheExplain } = this.store;
    if (cacheExplain[key]) {
      delete cacheExplain[key];
      this.store.cacheExplain = cacheExplain;
    }
  }

  cacheAdditionalPayload(cache: AdditionalPayload) {
    this.store.cachedAdditionalPayload = cache;
  }

  getAdditionalPayload() {
    return this.store.cachedAdditionalPayload;
  }

  clearCachedAdditionalPayload() {
    this.store.cachedAdditionalPayload = {};
  }

  clearPendingTransactions(address: string) {
    const transactions = this.store.transactions[address.toLowerCase()];
    if (!transactions) return;
    this.store.transactions = {
      ...this.store.transactions,
      [address.toLowerCase()]: Object.values(transactions)
        .filter((transaction) => !transaction.isPending)
        .reduce((res, current) => {
          return {
            ...res,
            [`${current.chainId}-${current.nonce}`]: current,
          };
        }, {}),
    };
  }

  getNonceByChain(address: string, chainId: number) {
    const list = Object.values(
      this.store.transactions[address.toLowerCase()] || {}
    );
    const maxNonceTx = maxBy(
      list.filter((item) => item.chainId === chainId && !item.isSubmitFailed),
      (item) => item.nonce
    );

    if (!maxNonceTx) return null;

    return maxNonceTx.nonce + 1;
  }

  getPendingNonce(address: string, chainId: number) {
    const maxNonceTx = maxBy(
      this.store.transactionsPending.filter(
        (tx) =>
          tx.from.toLowerCase() === address.toLowerCase() &&
          tx.chainId === chainId
      ),
      (item) => item.nonce
    );

    if (!maxNonceTx) {
      return null;
    }

    return maxNonceTx.nonce + 1;
  }

  getMinPendingNonce(address: string, chainId: number) {
    const minNonceTx = minBy(
      this.store.transactionsPending.filter(
        (tx) =>
          tx.from.toLowerCase() === address.toLowerCase() &&
          tx.chainId === chainId
      ),
      (item) => +item.nonce
    );

    if (!minNonceTx) {
      return null;
    }

    return +minNonceTx.nonce;
  }

  private async _getTxInfo(address: string, chainId: number, hash: string) {
    const [nonce, tx] = await Promise.all([
      openapiService.ethRpc({
        method: 'eth_getTransactionCount',
        params: [address.toLowerCase(), 'latest'],
      }),
      openapiService.ethRpc(
        {
          method: 'eth_getTransactionReceipt',
          params: [hash],
        },
        chainId
      ),
    ]);
    return [nonce, tx];
  }

  checkStatus = async (address: string, chainId: number, hash: string) => {
    const pendingTx = this.store.transactionsPending.find(
      (tx) =>
        tx.chainId === chainId &&
        tx.from.toLowerCase() === address.toLowerCase() &&
        tx.hash.toLowerCase() === hash.toLowerCase()
    );

    if (!pendingTx) {
      return;
    }

    try {
      const [nonce, tx] = await this._getTxInfo(address, chainId, hash);

      if (pendingTx.nonce < +nonce && !tx) {
        // wait 5s to wait newTx updated on rpc
        await wait(() => {}, 5000);
        const newTx = await openapiService.ethRpc(
          {
            method: 'eth_getTransactionReceipt',
            params: [hash],
          },
          chainId
        );

        if (!newTx) {
          return {
            ...pendingTx,
            transactionHash: hash,
            status: -1,
          };
        }

        return newTx;
      }

      return tx;
    } catch (err) {
      return null;
    }
  };

  roll = () => {
    // make a copy
    const pendingList = [...this.store.transactionsPending];

    pendingList.forEach((tx) =>
      this._scheduleQuerying(tx.from.toLowerCase(), tx.chainId, tx.hash)
    );
  };

  _scheduleQuerying = (address: string, chainId: number, hash: string) => {
    const tx = this.store.transactionsPending.find(
      (tx) =>
        tx.chainId === chainId &&
        tx.from.toLowerCase() === address.toLowerCase() &&
        tx.hash.toLowerCase() === hash.toLowerCase()
    );

    if (!tx) {
      return;
    }
    const id = `${address}-${chainId}-${tx.nonce}-${tx.hash}`;

    if (this.timers[id] !== null && typeof this.timers[id] !== 'undefined') {
      clearTimeout(this.timers[id]);
      this.timers[id] = null;
    }

    const nextTimeout = tx.createdAt && _findFrequency(tx.createdAt * 1000);

    if (nextTimeout) {
      this.timers[id] = setTimeout(() => {
        this.checkStatus(tx.from, chainId, hash).then((txReceipt) => {
          if (txReceipt) {
            eventBus.emit(EVENTS.broadcastToUI, {
              method: EVENTS.TX_HISTORY.SUCCESS,
              params: tx,
            });
            this.addTransactionCompleted({
              ...tx,
              ...txReceipt,
              transactionHash: tx.hash,
            });
          } else {
            this.timers[id] = null;
            this._scheduleQuerying(tx.from, chainId, hash);
          }
        });
      }, nextTimeout);
    } else {
      // this.timers[id] = null;
      // clearTimeout(this.timers[id]);
    }
  };

  replaceTransactionPending(tx: TransactionPendingItem) {
    if (!tx.transactionType) {
      tx.transactionType = TransactionType.Default;
    }
    const { nonce, chainId, from } = tx;

    const pendings = this.store.transactionsPending.filter((x) => {
      if (
        +x.nonce == nonce &&
        +x.chainId == chainId &&
        from.toLowerCase() === x.from.toLowerCase()
      ) {
        const id = `${x.from}-${x.chainId}-${x.nonce}-${x.hash}`;
        clearTimeout(this.timers[id]);
        this.timers[id] = null;
        return false;
      }
      return true;
    });
    pendings.unshift(tx);
    this.store.transactionsPending = pendings;
    this._scheduleQuerying(tx.from, tx.chainId, tx.hash);
    eventBus.emit(EVENTS.broadcastToUI, {
      method: EVENTS.TX_HISTORY.SUCCESS,
      params: tx,
    });
  }

  addTransactionPending(tx: TransactionPendingItem) {
    if (!tx.transactionType) {
      tx.transactionType = TransactionType.Default;
    }
    const savedTx = this.store.transactionsPending.find(
      (transaction) =>
        tx.hash === transaction.hash && +tx.chainId === +transaction.chainId
    );
    if (!savedTx) {
      const txsPending = [...this.store.transactionsPending];
      txsPending.unshift(tx);
      this.store.transactionsPending = txsPending;
      this._scheduleQuerying(tx.from, tx.chainId, tx.hash);
    }
  }

  addTransactionCompleted(tx: TransactionsCompletedItem) {
    if (!tx.transactionType) {
      tx.transactionType = TransactionType.Default;
    }
    this.store.transactionsPending = [...this.store.transactionsPending].filter(
      (x) => {
        if (x.hash === tx.transactionHash && +x.chainId === +tx.chainId) {
          const id = `${x.from}-${x.chainId}-${x.nonce}-${x.hash}`;
          clearTimeout(this.timers[id]);
          this.timers[id] = null;
          return false;
        }
        return true;
      }
    );
    const savedTx = this.store.transactionsCompleted.find(
      (transaction) =>
        tx.transactionHash === transaction.transactionHash &&
        +tx.chainId === +transaction.chainId
    );
    if (!savedTx) {
      const txsCompleted = [...this.store.transactionsCompleted];
      txsCompleted.unshift(tx);
      this.store.transactionsCompleted = txsCompleted;
    }
  }

  getTransactionPending(address: string) {
    const pendingTxes = this.store.transactionsPending.filter(
      (x) => x.from.toLowerCase() == address.toLowerCase()
    );
    return pendingTxes;
  }

  getTransactionsCompleted(address: string) {
    const completeTx = this.store.transactionsCompleted.filter(
      (x) => x.from.toLowerCase() == address.toLowerCase()
    );
    return completeTx;
  }
}

export default new TxHistory();
