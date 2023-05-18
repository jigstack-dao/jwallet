import fetchAdapter from '@vespaiach/axios-fetch-adapter';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

class SantaAPI {
  api: AxiosInstance;
  constructor(tokenAuth: string) {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_SANTA_API || '',
      headers: {
        Authorization: `Bearer ${tokenAuth}`,
      },
      adapter: fetchAdapter,
    });
  }

  async SendGift(payload: {
    title: string;
    comment: string;
    imageId?: string;
    tokenId: string;
    amount: string;
    txhash: string;
    recipients: Array<{
      amount: string;
      recipient: string;
      tokenId: string;
    }>;
  }) {
    const request: AxiosRequestConfig = {
      url: '/gifts',
      data: payload,
      method: 'POST',
    };

    try {
      const { data }: AxiosResponse = await this.api.request(request);
      console.log({ data });
      return data;
    } catch (error) {
      console.log(error);
      throw new Error('Error to call Lifi api');
    }
  }
}

export default SantaAPI;
