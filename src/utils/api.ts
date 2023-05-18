import axios from 'axios';

export const apiConnection = (
  baseURL: string,
  headers: Record<string, string>
) => {
  return axios.create({
    baseURL,
    headers,
  });
};
