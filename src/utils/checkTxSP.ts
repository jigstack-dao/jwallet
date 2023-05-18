import { SecurityCheckResponse, Tx } from '@/background/service/openapi';

export const checkTxSP = async (
  tx: Tx,
  origin: string,
  address: string,
  update_nonce = false
): Promise<SecurityCheckResponse> => {
  const data: SecurityCheckResponse = {
    decision: 'pass',
    alert: '',
    danger_list: [],
    warning_list: [],
    forbidden_list: [],
    trace_id: '',
  };

  return data;
};
