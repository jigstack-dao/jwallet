import axios, { AxiosInstance } from 'axios';

interface CreateSantaBody {
  sender: string;
  txhash: string;
  chainId: number;
  recipients: Array<{
    amount: string;
    tokenAddress: string;
    recipient: string;
  }>;
}

class JwalletAPI {
  service: AxiosInstance;
  constructor() {
    this.service = axios.create({
      baseURL: process.env.REACT_APP_JWALLET_API || '',
    });
  }

  async createWallet(address: string) {
    try {
      await this.service.post('/wallet', { address });
    } catch (error) {
      console.log('account alreardy existed');
    }
  }

  async updateVerifySantaEmail(address: string, email: string) {
    await this.service.post('/wallet', { address, email });
  }

  async getNonce(address: string) {
    try {
      const { data } = await this.service.get(
        `/wallet/nonce?address=${address}`
      );
      if (data.statusCode == 200 && data.success) {
        return data.data.nonce;
      }
    } catch (error) {
      return undefined;
    }
  }

  async getSignature(address: string, signature: string) {
    const { data } = await this.service.post('/wallet/check-signature', {
      address,
      signature,
    });
    if (data.statusCode == 200 && data.success) {
      const headers = {
        Authorization: `Bearer ${data.data.accessToken}`,
      };
      this.service = axios.create({
        baseURL: process.env.REACT_APP_JWALLET_API || '',
        headers,
      });
    }
  }

  async createSantaGift(body: CreateSantaBody) {
    await this.service.post('/santa-gift', body);
  }
}

export default new JwalletAPI();
