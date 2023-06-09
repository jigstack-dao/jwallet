import { browser, Windows } from 'webextension-polyfill-ts';
import { EventEmitter } from 'events';
import { IS_WINDOWS } from 'consts';

const event = new EventEmitter();

// if focus other windows, then reject the approval
browser.windows.onFocusChanged.addListener((winId) => {
  event.emit('windowFocusChange', winId);
});

browser.windows.onRemoved.addListener((winId) => {
  event.emit('windowRemoved', winId);
});

const BROWSER_HEADER = 80;
const WINDOW_SIZE = {
  width: 400 + (IS_WINDOWS ? 14 : 0), // idk why windows cut the width.
  height: 600,
};

const create = async ({ url, ...rest }): Promise<number | undefined> => {
  const {
    top: cTop,
    left: cLeft,
    width,
  } = await browser.windows.getCurrent({
    windowTypes: ['normal'],
  } as Windows.GetInfo);

  const top = cTop! + BROWSER_HEADER;
  const left = cLeft! + width! - WINDOW_SIZE.width;

  const currentWindow = await browser.windows.getCurrent();
  let win;
  if (currentWindow.state === 'fullscreen') {
    // browser.windows.create not pass state to chrome
    win = await chrome.windows.create({
      focused: true,
      url,
      type: 'popup',
      ...rest,
      width: undefined,
      height: undefined,
      left: undefined,
      top: undefined,
      state: 'fullscreen',
    });
  } else {
    win = await browser.windows.create({
      focused: true,
      url,
      type: 'popup',
      top,
      left,
      ...WINDOW_SIZE,
      ...rest,
    });
  }

  // shim firefox
  if (win.left !== left) {
    await browser.windows.update(win.id!, { left, top });
  }

  return win.id;
};

const remove = async (winId) => {
  return browser.windows.remove(winId);
};

const openNotification = ({ route = '', ...rest } = {}): Promise<
  number | undefined
> => {
  const url = `${chrome.runtime.getURL('notification.html')}${
    route && `#${route}`
  }`;

  return new Promise((resolve, reject) => {
    chrome.tabs.query(
      {
        url: [
          chrome.runtime.getURL('index.html'),
          chrome.runtime.getURL('notification.html'),
        ],
      },
      (tabs) => {
        if (tabs.length) {
          chrome.tabs.update(tabs[0].id || 1, { active: true, url });
          chrome.windows.update(tabs[0].windowId, {
            focused: true,
          });
          resolve(tabs[0].windowId);
        } else {
          resolve(create({ url, ...rest }));
        }
      }
    );
  });
};

export default {
  openNotification,
  event,
  remove,
};
