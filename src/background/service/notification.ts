import Events from 'events';
import { ethErrors } from 'eth-rpc-errors';
import { EthereumProviderError } from 'eth-rpc-errors/dist/classes';
import { winMgr } from 'background/webapi';
import {
  IS_CHROME,
  IS_LINUX,
  KEYRING_TYPE,
  NOT_CLOSE_UNFOCUS_LIST,
} from 'consts';
import preferenceService from './preference';
import { browser } from 'webextension-polyfill-ts';
import { permissionService } from '.';

interface Approval {
  id: number;
  taskId: number | null;
  data: {
    state: number;
    params?: any;
    origin?: string;
    approvalComponent: string;
    requestDefer?: Promise<any>;
    approvalType: string;
  };
  winProps: any;
  resolve: (params?: any) => void;
  reject: (err: EthereumProviderError<any>) => void;
}

const QUEUE_APPROVAL_COMPONENTS_WHITELIST = [
  'SignTx',
  'SignText',
  'SignTypedData',
];
// something need user approval in window
// should only open one window, unfocus will close the current notification
class NotificationService extends Events {
  currentApproval: Approval | null = null;
  _approvals: Approval[] = [];
  notifiWindowId = 0;
  isLocked = false;

  get approvals() {
    return this._approvals;
  }

  set approvals(val: Approval[]) {
    this._approvals = val;
    if (val.length <= 0) {
      chrome.action.setBadgeText({
        text: '',
      });
    } else {
      chrome.action.setBadgeText({
        text: val.length + '',
      });
      chrome.action.setBadgeBackgroundColor({
        color: '#FE815F',
      });
    }
  }

  constructor() {
    super();

    winMgr.event.on('windowRemoved', (winId: number) => {
      if (winId === this.notifiWindowId) {
        this.notifiWindowId = 0;
        this.rejectAllApprovals();
      }
    });

    winMgr.event.on('windowFocusChange', async (winId: number) => {
      if (!preferenceService.store) {
        await preferenceService.init();
      }
      const account = preferenceService.getCurrentAccount()!;
      if (this.notifiWindowId && winId !== this.notifiWindowId) {
        if (process.env.NODE_ENV === 'production') {
          if (
            (IS_CHROME &&
              winId === chrome.windows.WINDOW_ID_NONE &&
              IS_LINUX) ||
            (account?.type === KEYRING_TYPE.WalletConnectKeyring &&
              NOT_CLOSE_UNFOCUS_LIST.includes(account.brandName))
          ) {
            // Wired issue: When notification popuped, will focus to -1 first then focus on notification
            return;
          }
          this.rejectApproval();
        }
      }
    });
  }

  activeFirstApproval = () => {
    if (this.notifiWindowId) {
      browser.windows.update(this.notifiWindowId, {
        focused: true,
      });
      return;
    }

    if (this.approvals.length < 0) return;

    const approval = this.approvals[0];
    this.currentApproval = approval;
    this.openNotification(approval.winProps);
  };

  deleteApproval = (approval) => {
    if (approval && this.approvals.length > 1) {
      this.approvals = this.approvals.filter((item) => approval.id !== item.id);
    } else {
      this.currentApproval = null;
      this.approvals = [];
    }
  };

  getApproval = () => this.currentApproval?.data;

  resolveApproval = (data?: any, forceReject = false) => {
    if (forceReject) {
      this.currentApproval?.reject(
        new EthereumProviderError(4001, 'User Cancel')
      );
    } else {
      this.currentApproval?.resolve(data);
    }

    const approval = this.currentApproval;
    this.deleteApproval(approval);

    if (this.approvals.length > 0) {
      this.currentApproval = this.approvals[0];
    } else {
      this.currentApproval = null;
    }

    this.currentApproval = null;
    this.notifiWindowId = 0;
    this.emit('resolve', data);
  };

  rejectApproval = async (err?: string, stay = false, isInternal = false) => {
    console.log('reject', { err });
    if (isInternal) {
      this.currentApproval?.reject(ethErrors.rpc.internal(err));
    } else {
      this.currentApproval?.reject(
        ethErrors.provider.userRejectedRequest<any>(err)
      );
    }

    const approval = this.currentApproval;
    if (approval && this.approvals.length > 1) {
      this.deleteApproval(approval);
      this.currentApproval = this.approvals[0];
    } else {
      await this.clear(stay);
    }
    this.emit('reject', err);
  };

  // currently it only support one approval at the same time
  requestApproval = async (data, winProps?): Promise<any> => {
    return new Promise((resolve, reject) => {
      const uuid = Date.now();
      const approval: Approval = {
        taskId: uuid,
        id: uuid,
        data,
        winProps,
        resolve(data) {
          resolve(data);
        },
        reject(data) {
          reject(data);
        },
      };

      if (
        !QUEUE_APPROVAL_COMPONENTS_WHITELIST.includes(data.approvalComponent)
      ) {
        if (this.currentApproval) {
          throw ethErrors.provider.userRejectedRequest(
            'please request after current approval resolve'
          );
        }
      } else {
        if (
          this.currentApproval &&
          !QUEUE_APPROVAL_COMPONENTS_WHITELIST.includes(
            this.currentApproval.data.approvalComponent
          )
        ) {
          throw ethErrors.provider.userRejectedRequest(
            'please request after current approval resolve'
          );
        }
      }

      if (data.isUnshift) {
        this.approvals = [approval, ...this.approvals];
        this.currentApproval = approval;
      } else {
        this.approvals = [...this.approvals, approval];
        if (!this.currentApproval) {
          this.currentApproval = approval;
        }
      }

      if (
        ['wallet_switchEthereumChain', 'wallet_addEthereumChain'].includes(
          data?.params?.method
        )
      ) {
        const chainId = data.params?.data?.[0]?.chainId;
        const site = permissionService.getSite(data?.origin);
        permissionService.updateConnectSite(data?.origin, {
          ...site,
          chainId,
        });
      }
      if (this.notifiWindowId) {
        browser.windows.update(this.notifiWindowId, {
          focused: true,
        });
      } else {
        this.openNotification(winProps);
      }
    });
  };

  clear = async (stay = false) => {
    this.approvals = [];
    this.currentApproval = null;
    if (this.notifiWindowId && !stay) {
      await winMgr.remove(this.notifiWindowId);
      this.notifiWindowId = 0;
    }
  };

  rejectAllApprovals = () => {
    this.approvals.forEach((approval) => {
      approval?.reject(
        new EthereumProviderError(4001, 'User rejected the request.')
      );
    });
    this.approvals = [];
    this.currentApproval = null;
  };

  unLock = () => {
    this.isLocked = false;
  };

  lock = () => {
    this.isLocked = true;
  };

  openNotification = (winProps) => {
    if (this.isLocked) return;
    this.lock();
    if (this.notifiWindowId) {
      winMgr.remove(this.notifiWindowId);
      this.notifiWindowId = 0;
    }
    winMgr.openNotification(winProps).then((winId) => {
      this.notifiWindowId = winId!;
    });
  };
}

export default new NotificationService();
