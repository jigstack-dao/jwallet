import { NFTContractItem, NFTItem, Tx } from '@/background/service/openapi';
import { JsonRpcProvider } from '@ethersproject/providers';
import { formatUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import networkInfo from '@/constant/networks/networkInfo.json';
import { intToHex } from 'ethereumjs-util';
import axios from 'axios';
import { parseStandardTokenTransactionData } from './transaction';
import { AddressZero, TRANSACTION_TYPES } from '@/constant';
import { TransactionDescription } from 'ethers/lib/utils';
import { ERC1155__factory, ERC721__factory } from '@/constant/types';
import getAsset, { AssetType, ERC20_Metadata, ERC721_Metadata } from './asset';
const zeroAddress = '0x0000000000000000000000000000000000000000';
export const explainTxSP = async (
  tx: Tx,
  origin: string,
  address: string,
  update_nonce = false,
  provider: JsonRpcProvider
): Promise<any> => {
  let gasLimit;
  let nonce;
  let success = true;
  try {
    gasLimit = await provider.estimateGas({
      from: tx?.from,
      to: tx?.to,
      data: tx?.data,
      value: +tx?.value > 0 ? tx.value : undefined,
    });
  } catch (error) {
    if (tx.data.startsWith('0x6080')) {
      // transaction for deployment
      gasLimit = BigNumber.from(5000000);
    } else gasLimit = BigNumber.from(2000000);
    success = false;
  }
  if (tx.gas) {
    gasLimit = BigNumber.from(tx.gas);
  }
  const gasPrice = tx.gasPrice
    ? BigNumber.from(tx.gasPrice)
    : await provider.getGasPrice();
  const recommendedNonce = await provider.getTransactionCount(
    tx?.from,
    'pending'
  );
  if (tx.nonce != null || typeof tx.nonce != 'undefined') {
    nonce = +tx.nonce;
  } else {
    nonce = recommendedNonce;
  }
  const native_token = networkInfo.find(
    (network) => +network.chainId === +tx?.chainId
  );

  const decimals = native_token?.nativeCurrency?.decimals || 18;
  const estimated_gas_cost_value = (+gasLimit * +gasPrice) / 10 ** decimals;
  const api = axios.create({
    baseURL: process.env.REACT_APP_CRYPTOCOMPARE_API,
  });
  const result = await api.get(
    `/data/price?fsym=${
      native_token ? native_token.nativeCurrency.symbol : 'ETH'
    }&tsyms=USD`
  );
  const data: any = {
    is_gnosis: false,
    gas: {
      estimated_seconds: 0,
      estimated_gas_used: +gasLimit,
      estimated_gas_cost_value,
      estimated_gas_cost_usd_value: estimated_gas_cost_value * result?.data.USD,
    },
    recommend: {
      nonce: intToHex(nonce),
      gas: gasLimit._hex,
    },
    pre_exec: {
      success,
      err_msg: success
        ? ''
        : 'Please double-check your transaction and resubmit.',
    },
    support_balance_change: true,
    balance_change: {
      success: true,
      err_msg: '',
      send_token_list: [],
      receive_token_list: [],
      usd_value_change: 0,
    },
    native_token: {
      id: native_token?.shortName || 'eth',
      chain: native_token?.chain || 'eth',
      name: native_token?.chain || 'eth',
      symbol: native_token?.nativeCurrency?.symbol || 'ETH',
      display_symbol: native_token?.nativeCurrency?.symbol || 'ETH',
      optimized_symbol: native_token?.nativeCurrency?.symbol || 'ETH',
      decimals: native_token?.nativeCurrency?.decimals || 18,
      logo_url: '',
      price: result?.data?.USD || 0,
      is_verified: true,
      is_core: true,
      is_wallet: true,
      time_at: 1483200000,
    },
    abi: null,
    abiStr: null,
  };
  if (
    +tx.nonce < +recommendedNonce &&
    tx?.from.toLowerCase() === tx?.to?.toLowerCase()
  ) {
    data.type_cancel_tx = {};
    return data;
  }

  if (tx.to) {
    const [asset, code] = await Promise.all([
      getAsset(tx.to, provider),
      provider.getCode(tx.to),
    ]);
    const isContract = code !== '0x';

    switch (asset.type) {
      case AssetType.ERC20:
        // eslint-disable-next-line no-case-declarations
        const parsedErc20TxData = parseStandardTokenTransactionData(
          tx.data,
          asset.type
        );
        switch (parsedErc20TxData?.name) {
          case TRANSACTION_TYPES.TOKEN_METHOD_APPROVE:
            if (+parsedErc20TxData.args._value === 0) {
              data.type_cancel_token_approval = await erc20CancelApprovalData(
                asset.metadata,
                parsedErc20TxData
              );
            } else {
              data.type_token_approval = await erc20ApprovalData(
                tx,
                asset.metadata,
                parsedErc20TxData
              );
            }
            break;
          case TRANSACTION_TYPES.TOKEN_METHOD_TRANSFER:
            data.type_send = await erc20TransferData(
              tx,
              asset.metadata,
              parsedErc20TxData
            );
            break;
          default:
            data.type_default = {};
            break;
        }
        break;
      case AssetType.ERC721:
        // eslint-disable-next-line no-case-declarations
        const parsedErc721TxData = parseStandardTokenTransactionData(
          tx.data,
          asset.type
        );
        switch (parsedErc721TxData?.name) {
          case TRANSACTION_TYPES.TOKEN_METHOD_TRANSFER_FROM:
          case TRANSACTION_TYPES.TOKEN_METHOD_SAFE_TRANSFER_FROM:
            data.type_nft_send = await nft721SendData(
              tx,
              asset.metadata,
              parsedErc721TxData,
              provider
            );
            break;
          case TRANSACTION_TYPES.TOKEN_METHOD_APPROVE:
            if (parsedErc721TxData.args.to !== zeroAddress) {
              // single approve
              data.type_single_nft_approval = await erc721ApproveData(
                tx,
                asset.metadata,
                parsedErc721TxData,
                provider
              );
            } else {
              // cancel single approve
              data.type_cancel_single_nft_approval = await erc721ApproveData(
                tx,
                asset.metadata,
                parsedErc721TxData,
                provider
              );
            }
            break;
          case TRANSACTION_TYPES.TOKEN_METHOD_SET_APPROVAL_FOR_ALL:
            // approval all
            if (
              parsedErc721TxData?.args?.approved ||
              parsedErc721TxData?.args?._approved
            ) {
              data.type_nft_collection_approval = await erc721ApproveAllData(
                tx,
                asset.metadata,
                parsedErc721TxData,
                provider
              );
            } else {
              // cancel approval all
              data.type_cancel_nft_collection_approval =
                await erc721ApproveAllData(
                  tx,
                  asset.metadata,
                  parsedErc721TxData,
                  provider
                );
            }
            break;
          default:
            data.type_default = {};
            break;
        }
        break;
      case AssetType.ERC1155:
        // eslint-disable-next-line no-case-declarations
        const parsedErc1155TxData = parseStandardTokenTransactionData(
          tx.data,
          asset.type
        );
        switch (parsedErc1155TxData?.name) {
          case TRANSACTION_TYPES.TOKEN_METHOD_SET_APPROVAL_FOR_ALL:
            if (
              parsedErc1155TxData?.args?.approved ||
              parsedErc1155TxData?.args?._approved
            ) {
              data.type_nft_collection_approval = await erc1155ApproveAllData(
                tx,
                parsedErc1155TxData,
                provider
              );
            } else {
              data.type_cancel_nft_collection_approval =
                await erc1155ApproveAllData(tx, parsedErc1155TxData, provider);
            }
            break;
          case TRANSACTION_TYPES.TOKEN_METHOD_SAFE_TRANSFER_FROM:
            data.type_nft_send = await nft1155SendData(
              tx,
              parsedErc1155TxData,
              provider
            );
            break;
          default:
            data.type_default = {};
            break;
        }
        break;
      default:
        if (isContract) {
          data.type_default = {};
        } else {
          data.type_send = {
            to_addr: tx.to,
            token_symbol: native_token?.nativeCurrency.symbol || 'ETH',
            token_amount: +tx.value ? tx.value : '0x0',
            token: {
              amount: +tx.value ? tx.value : '0x0',
              chain: tx.chainId,
              decimals,
              name: native_token?.nativeCurrency.name || 'Ethereum',
              symbol: native_token?.nativeCurrency.symbol || 'ETH',
              id: AddressZero,
              is_core: false,
              is_verified: false,
              is_wallet: false,
              logo_url: '',
              price: 0,
              time_at: 0,
              raw_amount: +tx.value,
              raw_amount_hex_str: +tx.value ? tx.value : '0x0',
            },
          };
        }
    }
  } else {
    data.type_deploy_contract = {};
  }

  return data;
};

const erc20ApprovalData = async (
  tx: Tx,
  asset: ERC20_Metadata,
  parsedData: TransactionDescription
) => {
  const tokenAddress = tx.to;
  return {
    spender: parsedData.args._spender,
    spender_protocol_logo_url: '',
    spender_protocol_name: '',
    token_symbol: asset.symbol,
    token_amount: +formatUnits(parsedData.args._value._hex, asset.decimals),
    is_infinity: false,
    token: {
      amount: parsedData.args._value._hex,
      chain: tx.chainId,
      decimals: asset.decimals,
      symbol: asset.symbol,
      id: tokenAddress,
      is_core: false,
      is_verified: false,
      is_wallet: false,
      logo_url: '',
      name: asset.name,
      price: 0,
      time_at: 0,
      raw_amount: +parsedData.args._value._hex,
      raw_amount_hex_str: parsedData.args._value._hex,
    },
  };
};

const erc20CancelApprovalData = async (
  asset: ERC20_Metadata,
  parsedData: TransactionDescription
) => {
  return {
    spender: parsedData.args._spender,
    spender_protocol_logo_url: '',
    spender_protocol_name: '',
    token_symbol: asset.symbol,
  };
};

const erc20TransferData = async (
  tx: Tx,
  asset: ERC20_Metadata,
  parsedData: TransactionDescription
) => {
  const tokenAddress = tx.to;
  return {
    to_addr: parsedData.args._to,
    token_symbol: asset.symbol,
    token_amount: +formatUnits(parsedData.args._value._hex, asset.decimals),
    token: {
      amount: parsedData.args._value._hex,
      chain: tx.chainId,
      decimals: asset.decimals,
      symbol: asset.symbol,
      id: tokenAddress,
      is_core: false,
      is_verified: false,
      is_wallet: false,
      logo_url: '',
      name: asset.name,
      price: 0,
      time_at: 0,
      raw_amount: +parsedData.args._value._hex,
      raw_amount_hex_str: parsedData.args._value._hex,
    },
  };
};

const erc721ApproveData = async (
  tx: Tx,
  asset: ERC721_Metadata,
  parsedData: TransactionDescription,
  provider: JsonRpcProvider
) => {
  const data = ERC721__factory.connect(tx.to, provider);
  const tokenURI = await data.tokenURI(parsedData.args.tokenId);
  const info = await (await fetch(tokenURI)).json();

  const nft: NFTItem = {
    chain: 'string',
    id: parsedData.args.tokenId,
    contract_id: tx.to || 'string',
    inner_id: 'string',
    token_id: parsedData.args.tokenId,
    name: info?.name || 'string',
    contract_name: info?.name || 'string',
    description: info?.description || 'string',
    usd_price: 0,
    amount: 0,
    collection_id: parsedData.args.tokenId,
    pay_token: {
      id: 'string',
      name: 'string',
      symbol: 'string',
      amount: 0,
      logo_url: 'string',
      time_at: 0,
      date_at: '',
      price: 0,
    },
    content_type: 'image',
    content: info?.description || 'string',
    detail_url: info?.image || 'string',
    total_supply: 'string',
    collection: {
      id: 'string',
      name: info?.name || 'string',
      description: 'string',
      logo_url: 'string',
      is_core: true,
      contract_uuids: [],
      create_at: Date.now(),
    },
    is_erc1155: false,
    is_erc721: true,
  };
  return {
    spender: tx.from,
    spender_protocol_name: '',
    spender_protocol_logo_url: '',
    token_symbol: asset.symbol,
    is_nft: true,
    nft,
    token: {},
    token_amount: 0,
    is_infinity: 0,
  };
};

const erc721ApproveAllData = async (
  tx: Tx,
  asset: ERC721_Metadata,
  parsedData: TransactionDescription,
  provider: JsonRpcProvider
) => {
  const nft_contract: NFTItem = {
    chain: 'string',
    id: tx.to,
    contract_id: tx.to || 'string',
    inner_id: 'string',
    token_id: 'string',
    name: asset?.name || 'string',
    contract_name: 'string',
    description: 'string',
    usd_price: 0,
    amount: 0,
    collection_id: 'string',
    pay_token: {
      id: 'string',
      name: 'string',
      symbol: 'string',
      amount: 0,
      logo_url: 'string',
      time_at: 0,
      date_at: '',
      price: 0,
    },
    content_type: 'image',
    content: 'string',
    detail_url: 'string',
    total_supply: 'string',
    collection: {
      id: 'string',
      name: asset?.name || 'string',
      description: 'string',
      logo_url: 'string',
      is_core: true,
      contract_uuids: [],
      create_at: Date.now(),
    },
    is_erc1155: false,
    is_erc721: true,
  };
  return {
    spender: tx.from,
    spender_protocol_name: '',
    spender_protocol_logo_url: '',
    token_symbol: asset.symbol,
    is_nft: true,
    nft_contract,
    token: {},
    token_amount: 0,
    is_infinity: 0,
  };
};

const erc1155ApproveAllData = async (
  tx: Tx,
  parsedData: TransactionDescription,
  provider: JsonRpcProvider
) => {
  const nftContract: NFTContractItem = {
    id: tx.to || 'string',
    chain: 'string',
    name: 'ERC1155',
    symbol: 'string',
    is_core: true,
    time_at: Date.now(),
    collection: {
      id: 'string',
      name: 'ERC1155',
      create_at: Date.now(),
    },
  };
  return {
    spender: tx.from,
    spender_protocol_name: '',
    spender_protocol_logo_url: '',
    token_symbol: '',
    is_nft: true,
    nft_contract: nftContract,
    // token: TokenItem,
    token_amount: 0,
    is_infinity: 0,
  };
};

const nft721SendData = async (
  tx: Tx,
  asset: ERC721_Metadata,
  parsedData: TransactionDescription,
  provider: JsonRpcProvider
) => {
  const data = ERC721__factory.connect(tx.to, provider);
  const tokenURI = await data.tokenURI(parsedData.args.tokenId);
  const info = await (await fetch(tokenURI)).json();

  const nft: NFTItem = {
    chain: 'string',
    id: parsedData.args.tokenId,
    contract_id: tx.to || 'string',
    inner_id: 'string',
    token_id: parsedData.args.tokenId,
    name: info?.name || 'string',
    contract_name: info?.name || 'string',
    description: info?.description || 'string',
    usd_price: 0,
    amount: 0,
    collection_id: parsedData.args.tokenId,
    pay_token: {
      id: 'string',
      name: 'string',
      symbol: 'string',
      amount: 0,
      logo_url: 'string',
      time_at: 0,
      date_at: '',
      price: 0,
    },
    content_type: 'image',
    content: info?.description || 'string',
    detail_url: info?.image || 'string',
    total_supply: 'string',
    collection: {
      id: 'string',
      name: info?.name || 'string',
      description: 'string',
      logo_url: 'string',
      is_core: true,
      contract_uuids: [],
      create_at: Date.now(),
    },
    is_erc1155: false,
    is_erc721: true,
  };
  return {
    spender: tx.from,
    spender_protocol_name: '',
    spender_protocol_logo_url: '',
    token_symbol: asset.symbol,
    is_nft: true,
    nft,
    token_amount: info?.attributes?.length || 0,
    is_infinity: 0,
  };
};

const nft1155SendData = async (
  tx: Tx,
  parsedData: TransactionDescription,
  provider: JsonRpcProvider
) => {
  const data = ERC1155__factory.connect(tx.to, provider);
  const tokenURI = await data.uri(parsedData.args.id);
  let info;
  try {
    info = await (await fetch(tokenURI)).json();
  } catch (error) {
    console.log(error);
    info = {
      name: null,
      description: null,
      image: null,
    };
  }
  const nft: NFTItem = {
    chain: 'string',
    id: parsedData.args.id,
    contract_id: tx.to || 'string',
    inner_id: 'string',
    token_id: parsedData.args.id,
    name: info?.name || 'string',
    contract_name: info?.name || 'string',
    description: info?.description || 'string',
    usd_price: 0,
    amount: 0,
    collection_id: parsedData.args.id,
    pay_token: {
      id: 'string',
      name: 'string',
      symbol: 'string',
      amount: 0,
      logo_url: 'string',
      time_at: 0,
      date_at: '',
      price: 0,
    },
    content_type: 'image',
    content: info?.description || 'string',
    detail_url: info?.image || 'string',
    total_supply: 'string',
    collection: {
      id: 'string',
      name: info?.name || 'string',
      description: 'string',
      logo_url: 'string',
      is_core: true,
      contract_uuids: [],
      create_at: Date.now(),
    },
    is_erc1155: false,
    is_erc721: true,
  };
  return {
    spender: tx.from,
    spender_protocol_name: '',
    spender_protocol_logo_url: '',
    token_symbol: '',
    is_nft: true,
    nft,
    token_amount: +parsedData?.args?.amount || 0,
    is_infinity: 0,
  };
};
