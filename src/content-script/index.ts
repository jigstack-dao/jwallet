import { Message } from 'utils';
import { nanoid } from 'nanoid';

const channelName = nanoid();

const container = document.head || document.documentElement;
const textEle = document.createElement('script');
textEle.className = channelName;
textEle.id = 'jwallet';
container.insertBefore(textEle, container.children[0]);

const ele = document.createElement('script');
ele.src = chrome.runtime.getURL('pageProvider.js');
container.insertBefore(ele, container.children[0]);

const { BroadcastChannelMessage, PortMessage } = Message;

const pm = new PortMessage().connect();

const bcm = new BroadcastChannelMessage(channelName).listen((data) =>
  pm.request(data)
);

// background notification
pm.on('message', (data) => bcm.send('message', data));

document.addEventListener('beforeunload', () => {
  bcm.dispose();
  pm.dispose();
});
