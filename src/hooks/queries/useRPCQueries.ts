import { RPC } from '@/constant/networks/extraRpcs';
import { useQueries } from '@tanstack/react-query';
import fetchAdapter from '@vespaiach/axios-fetch-adapter';
import axios from 'axios';
import { useMemo } from 'react';

const refetchInterval = 60_000;

export const rpcBody = JSON.stringify({
  jsonrpc: '2.0',
  method: 'eth_getBlockByNumber',
  params: ['latest', false],
  id: 1,
});

const formatData = (rpc: RPC, data: any) => {
  let height: number | null = data?.result?.number ?? null;
  let latency: number | null = data?.latency ?? null;
  if (height) {
    const hexString = height.toString(16);
    height = parseInt(hexString, 16);
  } else {
    latency = null;
  }
  return { rpc, height, latency };
};

const fetchChain = async (baseURL: string) => {
  if (baseURL.includes('API_KEY')) return null;
  try {
    const API = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'X-Client': 'JWallet',
      },
      adapter: fetchAdapter,
    });

    API.interceptors.request.use(function (request) {
      (request as any).requestStart = Date.now();
      return request;
    });

    API.interceptors.response.use(
      function (response) {
        (response as any).latency =
          Date.now() - (response.config as any).requestStart;
        return response;
      },
      function (error) {
        if (error.response) {
          error.response.latency = null;
        }

        return Promise.reject(error);
      }
    );

    const { data, latency } = (await API.post('', rpcBody)) as any;

    return { ...data, latency };
  } catch (error) {
    return null;
  }
};

const fetchWssChain = (baseURL: string) => {
  return new Promise((resolve, reject) => {
    try {
      const socket = new WebSocket(baseURL);
      let requestStart;

      socket.onopen = function () {
        socket.send(rpcBody);
        requestStart = Date.now();
      };

      socket.onmessage = function (event) {
        const data = JSON.parse(event.data);

        const latency = Date.now() - requestStart;
        resolve({ ...data, latency });
      };

      socket.onerror = function (e) {
        reject(e);
      };
    } catch (error) {
      resolve(null);
    }
  });
};

const useHttpQuery = (rpc: RPC) => {
  return {
    queryKey: [rpc.url],
    queryFn: () => fetchChain(rpc.url),
    refetchInterval,
    select: (data) => formatData(rpc, data),
  };
};

const useSocketQuery = (rpc: RPC) => {
  return {
    queryKey: [rpc.url],
    queryFn: () => fetchWssChain(rpc.url),
    refetchInterval,
    select: (data) => formatData(rpc, data),
  };
};

const useRPCQueries = (rpcs: RPC[]) => {
  const queries = useMemo(
    () =>
      rpcs?.map((rpc) =>
        rpc.url.includes('wss://') ? useSocketQuery(rpc) : useHttpQuery(rpc)
      ) ?? [],
    [rpcs]
  );

  return useQueries({ queries });
};

export default useRPCQueries;
