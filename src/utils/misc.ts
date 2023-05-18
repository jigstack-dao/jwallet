import { RPC } from '@/constant/networks/extraRpcs';
import { encodePacked } from 'web3-utils';

export const ConvertURL = (url: string) => {
  if (!url.startsWith('ipfs://')) {
    return url;
  }

  return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
};

export const hashPersonalMessage = (hashedMsg: string) => {
  const hashedPersonalMsg = encodePacked(
    '\x19Ethereum Signed Message:\n',
    hashedMsg
  );
  return hashedPersonalMsg;
};

export function mergeDeep(target, source) {
  const newTarget = { ...target };
  const isObject = (obj) => obj && typeof obj === 'object';

  if (!isObject(newTarget) || !isObject(source)) {
    return source;
  }

  Object.keys(source).forEach((key) => {
    const targetValue = newTarget[key];
    const sourceValue = source[key];

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      newTarget[key] = targetValue.concat(sourceValue);
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      newTarget[key] = mergeDeep(Object.assign({}, targetValue), sourceValue);
    } else {
      newTarget[key] = sourceValue;
    }
  });

  return newTarget;
}

export function removeEndingSlash(rpc) {
  return rpc.endsWith('/') ? rpc.substr(0, rpc.length - 1) : rpc;
}

export function removeEndingSlashObject(rpc: RPC | string): RPC {
  if (typeof rpc === 'string') {
    return {
      url: removeEndingSlash(rpc),
    };
  } else {
    return {
      ...rpc,
      url: removeEndingSlash(rpc.url),
    };
  }
}

export function getScanLinkFromChainlist(scanLink: RPC | string): string {
  if (typeof scanLink === 'string') {
    return scanLink;
  } else {
    return scanLink.url || '';
  }
}

export const isBrowser = () => typeof window != 'undefined';
