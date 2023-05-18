import React from 'react';
import BuyIcon from '@/ui/assets/jwallet/buy.svg';
// import NFTIcon from '@/ui/assets/jwallet/nft.svg';
import SantaIcon from '@/ui/assets/jwallet/santa.svg';
import SendIcon from '@/ui/assets/jwallet/send.svg';
import SwapIcon from '@/ui/assets/jwallet/swap.svg';
import GiftIcon from '@/ui/assets/jwallet/gift.svg';
// import ArrowRight from '@/ui/assets/jwallet/arrow-right.svg';
import Routes from '@/constant/routes';

export const features = [
  {
    icon: <img src={BuyIcon} />,
    text: 'Buy',
    url: Routes.BuyToken,
    active: true,
  },
  {
    icon: <img src={SendIcon} />,
    text: 'Send',
    url: Routes.SendToken,
    active: true,
  },
  {
    icon: <img src={SwapIcon} />,
    text: 'Swap & Bridge',
    url: Routes.Swap,
    active: true,
  },
  {
    text: 'More Coming...',
    active: false,
  },
  
  //{
  //  icon: <img src={SantaIcon} />,
  //  text: 'Santa',
  //  rightEl: (
  //    <div className="absolute right-[5px] top-[5px]">
  //      <img src={GiftIcon} alt="" />
  //    </div>
  //  ),
  //  url: Routes.Santa,
  //  active: false,
  //},
  // {
  //   icon: <img src={NFTIcon} />,
  //   text: 'NFT',
  //   rightEl: (
  //     <div className="w-max flex justify-center">
  //       <span className="hidden">4</span>
  //       <span className="mr-[10px] ml-auto">
  //         <img src={ArrowRight} />
  //       </span>
  //     </div>
  //   ),
  //   active: false,
  // },
];
