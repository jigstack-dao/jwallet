import { CHAINS } from '@/constant';
import IconJwallet from 'ui/assets/jwallet-small.svg';
export const switchChainInterceptor = {
  onResponse(res, data) {
    if (data.method === 'wallet_switchEthereumChain') {
      const chainId = data.params?.[0]?.chainId;
      const chain = Object.values(CHAINS).find((item) => item.hex === chainId);
      Notification.open({
        content: `Switched to <span class="jigstack-strong">${chain?.name}</span> for the current Dapp`,
      });
    }

    return res;
  },
};

export const switchChainNotice = (chainId: string) => {
  const chain = Object.values(CHAINS).find((item) => item.hex === chainId);
  Notification.open({
    content: `Switched to <span class="jigstack-strong">${
      chain?.name || chainId
    }</span> for the current Dapps`,
  });
};

class Notification {
  styles = `
    .jigstack-notification {
      position: fixed;
      z-index: 1010;
      top: 60px;
      right: 42px;
    }
    .jigstack-notification-content {
      min-width: 230px;
      height: 66px;
      background: linear-gradient(156.27deg, #5957D5 0%, #9257D5 100.75%), #FFFFFF;
      border: none;
      box-sizing: border-box;
      box-shadow: 0px 2px 20px rgba(26, 26, 79, 0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;

      font-family: 'Arial', sans-serif;
      font-style: normal;
      font-weight: 500;
      font-size: 16px;
      line-height: 16px;
      color: #fff;

      padding: 12px;
      gap: 8px;
    }

    .jigstack-notification-icon {
      width: 50px;
    }
    .jigstack-strong {
      font-weight: bold;
    }

  `;

  content = '';

  template = () => {
    return `
      <div class="jigstack-notification">
        <div class="jigstack-notification-content">
          <img class="jigstack-notification-icon" src="${IconJwallet}"/>
          ${this.content}
        </div>
      </div>
    `;
  };

  static instance?: Notification | null;
  static id?: any;
  static close?: (() => void) | null;

  static open = ({ content }) => {
    if (Notification.instance) {
      Notification.close?.();
    }
    const instance = new Notification();
    instance.content = content;
    Notification.instance = instance;
    const style = document.createElement('style');
    style.setAttribute('rel', 'stylesheet');
    style.innerHTML = instance.styles;
    document.head.appendChild(style);

    const div = document.createElement('div');
    div.innerHTML = instance.template();

    document.body.appendChild(div);
    const close = () => {
      document.head.removeChild(style);
      document.body.removeChild(div);
      clearTimeout(Notification.id);
      Notification.instance = null;
      Notification.id = null;
      Notification.close = null;
    };

    Notification.id = setTimeout(close, 3000);
    Notification.close = close;

    return {
      close,
    };
  };
}
