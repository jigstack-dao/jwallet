import { browser } from 'webextension-polyfill-ts';
import 'reflect-metadata';
import { ethErrors } from 'eth-rpc-errors';
import { WalletController } from 'background/controller/wallet';
import { Message } from 'utils';
import { EVENTS } from 'consts';
import { storage } from './webapi';
import {
  permissionService,
  preferenceService,
  sessionService,
  keyringService,
  openapiService,
  transactionWatchService,
  pageStateCacheService,
  transactionHistoryService,
  contactBookService,
  signTextHistoryService,
  widgetService,
  settingService,
} from './service';
import { providerController, walletController } from './controller';
import rpcCache from './utils/rpcCache';
import eventBus from '@/eventBus';
// import migrateData from '@/migrations';
import createSubscription from './controller/provider/subscriptionManager';
import buildinProvider from 'background/utils/buildinProvider';

// Keep service worker alway awake ----------------
// (https://stackoverflow.com/questions/66618136/persistent-service-worker-in-chrome-extension)
let lifeline;

keepAlive();

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'keepAlive') {
    lifeline = port;
    setTimeout(keepAliveForced, 295e3); // 5 minutes minus 5 seconds
    port.onDisconnect.addListener(keepAliveForced);
  }
});

function keepAliveForced() {
  lifeline?.disconnect();
  lifeline = null;
  keepAlive();
}

async function keepAlive() {
  if (lifeline) return;
  for (const tab of await chrome.tabs.query({ url: '*://*/*' })) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id || 0 },
        function: () => chrome.runtime.connect({ name: 'keepAlive' }),
      });
      chrome.tabs.onUpdated.removeListener(retryOnTabUpdate);
      return;
    } catch (e) {
      console.log(e);
    }
  }
  chrome.tabs.onUpdated.addListener(retryOnTabUpdate);
}

async function retryOnTabUpdate(tabId, info, tab) {
  tab;
  if (info.url && /^(file|https?):/.test(info.url)) {
    keepAlive();
  }
}
// END----------------

const { PortMessage } = Message;

let appStoreLoaded = false;

async function restoreAppState() {
  const keyringState = await storage.get('keyringState');
  keyringService.loadStore(keyringState);
  keyringService.store.subscribe((value) => storage.set('keyringState', value));
  await openapiService.init();

  // Init keyring and openapi first since this two service will not be migrated
  // await migrateData();
  await settingService.init();
  await permissionService.init();
  await preferenceService.init();
  await transactionWatchService.init();
  await pageStateCacheService.init();
  await transactionHistoryService.init();
  await contactBookService.init();
  await signTextHistoryService.init();
  await widgetService.init();
  rpcCache.start();
  appStoreLoaded = true;

  transactionWatchService.roll();
  transactionHistoryService.roll();
}

restoreAppState();

// for page provider
browser.runtime.onConnect.addListener((port) => {
  // if (appStoreLoaded) {
  //   openapiService.getConfig();
  // }

  if (
    port.name === 'popup' ||
    port.name === 'notification' ||
    port.name === 'tab'
  ) {
    const pm = new PortMessage(port);
    pm.listen((data) => {
      if (data?.type) {
        switch (data.type) {
          case 'broadcast':
            eventBus.emit(data.method, data.params);
            break;
          case 'openapi':
            if (walletController.openapi[data.method]) {
              return walletController.openapi[data.method].apply(
                null,
                data.params
              );
            }
            break;
          case 'controller':
          default:
            if (data.method) {
              if (
                !['setClosingTime', 'isExpiredClosingTime'].includes(
                  data.method
                )
              ) {
                walletController.setClosingTime();
              }
              return walletController[data.method].apply(null, data.params);
            }
        }
      }
    });

    const boardcastCallback = (data: any) => {
      pm.request({
        type: 'broadcast',
        method: data.method,
        params: data.params,
      });
    };

    if (port.name === 'popup') {
      preferenceService.setPopupOpen(true);

      port.onDisconnect.addListener(() => {
        const mins = settingService.getStore().advanced.lockTimer;
        preferenceService.updateWalletLockTime(mins);
        preferenceService.setPopupOpen(false);
      });
    }

    eventBus.addEventListener(EVENTS.broadcastToUI, boardcastCallback);
    port.onDisconnect.addListener(() => {
      eventBus.removeEventListener(EVENTS.broadcastToUI, boardcastCallback);
    });

    return;
  }

  if (!port.sender?.tab) {
    return;
  }

  const pm = new PortMessage(port);
  const provider = buildinProvider.currentProvider;
  const subscriptionManager = createSubscription(provider);

  subscriptionManager.events.on('notification', (message) => {
    pm.send('message', {
      event: 'message',
      data: {
        type: message.method,
        data: message.params,
      },
    });
  });

  pm.listen(async (data) => {
    if (!appStoreLoaded) {
      throw ethErrors.provider.disconnected();
    }

    const sessionId = port.sender?.tab?.id;
    const session = sessionService.getOrCreateSession(sessionId);

    const req = { data, session };
    // for background push to respective page
    req.session.pushMessage = (event, data) => {
      pm.send('message', { event, data });
    };

    if (subscriptionManager.methods[data?.method]) {
      const connectSite = permissionService.getConnectedSite(session.origin);
      if (connectSite) {
        provider.chainId = String(connectSite.chainId);
      }
      return subscriptionManager.methods[data.method].call(null, req);
    }

    return providerController(req);
  });

  port.onDisconnect.addListener(() => {
    subscriptionManager.destroy();
  });
});

declare global {
  interface Window {
    wallet: WalletController;
  }
}

// for popup operate
globalThis.wallet = new Proxy(walletController, {
  get(target, propKey, receiver) {
    if (!appStoreLoaded) {
      throw ethErrors.provider.disconnected();
    }
    return Reflect.get(target, propKey, receiver);
  },
});

storage
  .byteInUse()
  .then(() => {
    /* do nothing */
  })
  .catch(() => {
    // IGNORE
  });

chrome.action.onClicked.addListener(function (listener) {
  openExtension();
});

function openExtension() {
  const options_url = chrome.runtime.getURL('index.html');
  chrome.tabs.query(
    {
      url: [
        chrome.runtime.getURL('index.html'),
        chrome.runtime.getURL('notification.html'),
      ],
    },
    function (tabs) {
      if (tabs.length == 0) {
        chrome.tabs.create(
          {
            url: options_url,
            active: false,
          },
          function (tab) {
            // After the tab has been created, open a window to inject the tab
            chrome.windows.create({
              tabId: tab.id,
              type: 'popup',
              focused: true,
              width: 450,
              height: 650,
              // incognito, top, left, ...
            });
          }
        );
      } else {
        // If there's more than one, close all but the first
        for (let i = 1; i < tabs.length; i++)
          if (tabs[i].id != undefined) chrome.tabs.remove(Number(tabs[i].id));
        // And focus the options page
        chrome.tabs.update(Number(tabs[0].id), { active: true });
        chrome.windows.update(tabs[0].windowId, { focused: true });
      }
    }
  );
}
