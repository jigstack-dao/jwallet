import { Step, StepBase } from '@lifi/sdk';
import fetchAdapter from '@vespaiach/axios-fetch-adapter';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

class LifiAPI {
  api: AxiosInstance;
  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_LIFI_API || '',
      headers: {
        'X-Client': 'JWallet',
      },
      adapter: fetchAdapter,
    });
  }

  async getAdvancedStep(step: StepBase) {
    const request: AxiosRequestConfig = {
      url: '/advanced/stepTransaction',
      data: step,
      method: 'POST',
    };

    try {
      const { data }: AxiosResponse<Step> = await this.api.request(request);
      return data;
    } catch (error) {
      console.log(error);
      throw new Error('Error to call Lifi api');
    }
  }
}

export default new LifiAPI();
