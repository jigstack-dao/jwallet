import { ethErrors } from 'eth-rpc-errors';
import {
  keyringService,
  notificationService,
  permissionService,
} from 'background/service';
import { PromiseFlow, underline2Camelcase } from 'background/utils';
import { EVENTS } from 'consts';
import providerController from './controller';
import eventBus from '@/eventBus';
import { jsonRpcRequest } from '@/background/utils/rpc';
import validUrl from 'valid-url';

const isSignApproval = (type: string) => {
  const SIGN_APPROVALS = ['SignText', 'SignTypedData', 'SignTx'];
  return SIGN_APPROVALS.includes(type);
};
export const resemblesETHAddress = (str: string): boolean => {
  return str.length === 42;
};
const flow = new PromiseFlow();
const flowContext = flow
  .use(async (ctx, next) => {
    // check method
    const {
      data: { method },
    } = ctx.request;
    ctx.mapMethod = underline2Camelcase(method);
    if (!providerController[ctx.mapMethod]) {
      // TODO: make rpc whitelist
      if (method.startsWith('eth_') || method === 'net_version') {
        return providerController.ethRpc(ctx.request);
      }

      throw ethErrors.rpc.methodNotFound({
        message: `method [${method}] doesn't has corresponding handler`,
        data: ctx.request.data,
      });
    }

    return next();
  })
  .use(async (ctx, next) => {
    const { mapMethod } = ctx;
    if (!Reflect.getMetadata('SAFE', providerController, mapMethod)) {
      // check lock
      const isUnlock = keyringService.memStore.getState().isUnlocked;

      if (!isUnlock) {
        ctx.request.requestedApproval = true;
        await notificationService.requestApproval({ lock: true });
      }
    }

    return next();
  })
  .use(async (ctx, next) => {
    // check connect
    const {
      request: {
        session: { origin, name, icon },
      },
      mapMethod,
    } = ctx;
    if (!Reflect.getMetadata('SAFE', providerController, mapMethod)) {
      if (!permissionService.hasPermission(origin)) {
        ctx.request.requestedApproval = true;
        const { chainId } = await notificationService.requestApproval(
          {
            params: { origin, name, icon },
            approvalComponent: 'Connect',
          },
          { height: 600 }
        );
        permissionService.addConnectedSite(origin, name, icon, chainId);
      }
    }

    return next();
  })
  .use(async (ctx, next) => {
    // check need approval
    const networks = permissionService.getAllNetworks();
    const {
      request: {
        data: { params, method },
        session: { origin, name, icon },
      },
      mapMethod,
    } = ctx;
    const [approvalType, condition, options = {}] =
      Reflect.getMetadata('APPROVAL', providerController, mapMethod) || [];
    let windowHeight = 800;
    if ('height' in options) {
      windowHeight = options.height;
    } else {
      const minHeight = 500;
      if (windowHeight < minHeight) {
        windowHeight = minHeight;
      }
    }
    if (approvalType === 'SignText') {
      let from, message;
      const [first, second] = params;
      // Compatible with wrong params order
      // ref: https://github.com/MetaMask/eth-json-rpc-middleware/blob/53c7361944c380e011f5f4ee1e184db746e26d73/src/wallet.ts#L284
      if (resemblesETHAddress(first) && !resemblesETHAddress(second)) {
        from = first;
        message = second;
      } else {
        from = second;
        message = first;
      }
      ctx.request.data.params[0] = message;
      ctx.request.data.params[1] = from;
    }

    if (approvalType && (!condition || !condition(ctx.request))) {
      ctx.request.requestedApproval = true;
      if (approvalType === 'SignTx' && !('chainId' in params[0])) {
        const site = permissionService.getConnectedSite(origin);
        const currentChainId = permissionService.getCurrentNetworkTemporary();
        const chainId = currentChainId ?? site?.chainId;
        if (chainId) {
          const chain = networks.find((item) => item.chainId === chainId);
          if (chain) {
            params[0].chainId = chain.chainId;
          }
        }
      }

      if (
        approvalType === 'AddChain' &&
        method === 'wallet_switchEthereumChain'
      ) {
        const { chainId } = params[0];
        if (!chainId || isNaN(+chainId)) {
          throw ethErrors.rpc.invalidParams(
            `Expect non-zero numeric or hexadecimal 'chainId'. Received:\n${chainId}`
          );
        }
        const networks = permissionService.getAllNetworks();
        if (!networks.find((x) => +x.chainId === +chainId)) {
          throw ethErrors.rpc.invalidInput(
            `Unrecognized chain ID "${chainId}". Try adding the chain using wallet_addEthereumChain first.`
          );
        }
      }

      if (approvalType === 'AddChain' && method === 'wallet_addEthereumChain') {
        const { chainId, rpcUrls, chainName, nativeCurrency } = params[0];
        const networks = permissionService.getAllNetworks();
        if (!networks.find((x) => x.chainId === chainId)) {
          const isLocalhost = (strUrl) => {
            try {
              const url = new URL(strUrl);
              return (
                url.hostname === 'localhost' || url.hostname === '127.0.0.1'
              );
            } catch (error) {
              return false;
            }
          };

          let endPointChainId: any;
          const firstValidRPCUrl = Array.isArray(rpcUrls)
            ? rpcUrls.find(
                (rpcUrl) => isLocalhost(rpcUrl) || validUrl.isHttpsUri(rpcUrl)
              )
            : null;

          if (!chainName || typeof chainName != 'string') {
            throw ethErrors.rpc.invalidParams(
              `Expected a chain name, Received:\n${chainName}`
            );
          }

          if (
            !nativeCurrency ||
            typeof nativeCurrency.name != 'string' ||
            typeof nativeCurrency.symbol != 'string' ||
            !nativeCurrency.decimals ||
            isNaN(+nativeCurrency.decimals)
          ) {
            throw ethErrors.rpc.invalidParams(
              `Expected a valid native currency, Received:\n${JSON.stringify(
                nativeCurrency
              )}`
            );
          }

          if (!firstValidRPCUrl) {
            throw ethErrors.rpc.invalidParams(
              `Expected an array with at least one valid string HTTPS url 'rpcUrls', Received:\n${rpcUrls}`
            );
          }

          // Check RPC, Chain id.
          try {
            endPointChainId = await jsonRpcRequest(
              firstValidRPCUrl,
              'eth_chainId'
            );
          } catch (err) {
            throw ethErrors.rpc.internal(
              `Request for method 'eth_chainId on ${firstValidRPCUrl} failed`
            );
          }

          if (endPointChainId != chainId) {
            throw ethErrors.rpc.invalidParams(
              `Chain ID returned by RPC URL ${firstValidRPCUrl} does not match ${chainId}`
            );
          }

          params[0].rpcUrls = [firstValidRPCUrl];
        }
      }

      ctx.approvalRes = await notificationService.requestApproval(
        {
          approvalComponent: approvalType,
          params: {
            method,
            data: params,
            session: { origin, name, icon },
          },
          origin,
        },
        { height: windowHeight }
      );
      if (isSignApproval(approvalType)) {
        permissionService.updateConnectSite(origin, { isSigned: true }, true);
      } else {
        permissionService.touchConnectedSite(origin);
      }
    }

    return next();
  })
  .use(async (ctx) => {
    const { approvalRes, mapMethod, request } = ctx;
    // process request
    const [approvalType] =
      Reflect.getMetadata('APPROVAL', providerController, mapMethod) || [];
    const { uiRequestComponent, ...rest } = approvalRes || {};
    const {
      session: { origin },
    } = request;
    const requestDefer = Promise.resolve(
      providerController[mapMethod]({
        ...request,
        approvalRes,
      })
    );

    requestDefer
      .then((result) => {
        if (isSignApproval(approvalType)) {
          eventBus.emit(EVENTS.broadcastToUI, {
            method: EVENTS.SIGN_FINISHED,
            params: {
              success: true,
              data: result,
            },
          });
        }
        return result;
      })
      .catch((e: any) => {
        console.log({ err: e });
        if (isSignApproval(approvalType)) {
          eventBus.emit(EVENTS.broadcastToUI, {
            method: EVENTS.SIGN_FINISHED,
            params: {
              success: false,
              errorMsg: JSON.stringify(e),
            },
          });
        }
      });
    async function requestApprovalLoop({ uiRequestComponent, ...rest }) {
      ctx.request.requestedApproval = true;
      const res = await notificationService.requestApproval({
        approvalComponent: uiRequestComponent,
        params: rest,
        origin,
        approvalType,
      });
      if (res.uiRequestComponent) {
        return await requestApprovalLoop(res);
      } else {
        return res;
      }
    }
    if (uiRequestComponent) {
      ctx.request.requestedApproval = true;
      return await requestApprovalLoop({ uiRequestComponent, ...rest });
    }
    return await requestDefer;
  })
  .callback();

export default (request) => {
  const ctx: any = { request: { ...request, requestedApproval: false } };
  return flowContext(ctx).finally(() => {
    if (ctx.request.requestedApproval) {
      flow.requestedApproval = false;
      // only unlock notification if current flow is an approval flow
      notificationService.unLock();
    }
  });
};
