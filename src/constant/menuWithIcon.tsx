import React from 'react';
import { ReactComponent as MoonPay } from '@/ui/assets/jwallet/buy-token/moonpay.svg';
import { ReactComponent as Transak } from '@/ui/assets/jwallet/buy-token/transak.svg';
import { ReactComponent as Wyre } from '@/ui/assets/jwallet/buy-token/wyre.svg';
import { ReactComponent as TestFaucet } from '@/ui/assets/jwallet/buy-token/test-faucet.svg';
import { ReactComponent as DirectlyDeposit } from '@/ui/assets/jwallet/buy-token/directly-deposit.svg';

export enum BUY_ETH_KEYS {
  MoonPay = 'MoonPay',
  Transak = 'Transak',
  Wyre = 'Wyre',
  TestFaucet = 'TestFaucet',
  DirectlyDeposit = 'DirectlyDeposit',
}

export const BUY_ETH_OPTIONS = [
  {
    key: BUY_ETH_KEYS.MoonPay,
    title: <MoonPay />,
    content:
      'MoonPay supports popular payment methods, including Visa, Mastercard, Apple / Google / Samsung Pay, and bank transfers in 145+ countries. Tokens deposit into your MetaMask account.',
  },
  {
    key: BUY_ETH_KEYS.Transak,
    title: <Transak />,
    content:
      'Transak supports credit & debit cards, Apple Pay, MobiKwik, and bank transfers (depending on location) in 100+ countries. ETH deposits directly into your MetaMask account.',
  },
  {
    key: BUY_ETH_KEYS.Wyre,
    title: <Wyre />,
    content:
      'Wyre lets you use a debit card to deposit ETH right in to your MetaMask account.',
  },
  {
    key: BUY_ETH_KEYS.TestFaucet,
    title: <TestFaucet />,
    content: 'Get Ether from a faucet for the Ropsten',
  },
  {
    key: BUY_ETH_KEYS.DirectlyDeposit,
    title: <DirectlyDeposit />,
    content:
      'If you already have some ETH, the quickest way to get ETH in your new wallet by direct deposit.',
  },
];
