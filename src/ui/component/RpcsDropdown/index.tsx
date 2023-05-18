import useVisible from '@/hooks/forms/useVisible';
import clsx from 'clsx';
import React, { FC, memo } from 'react';

import { ReactComponent as ArrowDown } from '@/ui/assets/jwallet/arrow-down.svg';
import ShieldImg from '@/ui/assets/jwallet/rpcs/shield.png';
import SpeedImg from '@/ui/assets/jwallet/rpcs/speed.png';
import CrossImg from '@/ui/assets/jwallet/rpcs/cross.png';
import DangerImg from '@/ui/assets/jwallet/rpcs/danger.png';
import NoneImg from '@/ui/assets/jwallet/rpcs/none.png';
import TickImg from '@/ui/assets/jwallet/rpcs/tick.png';
import './style.less';
import { Tooltip } from 'antd';

export interface RPCInfo {
  url: string;
  tracking?: 'none' | 'yes' | 'limited' | 'unspecified';
  trackingDetails?: string;
  latency: number | null;
  height: number | null;
}

interface IProps {
  options?: RPCInfo[];
  selected?: RPCInfo;
  placeHolder?: string;
  onChange?: (item: RPCInfo) => any;
  styles?: Record<string, string | number>;
  defaultLabel?: string;
  isValid?: boolean;
}

const getSpeed = (latency: number | null) => {
  if (!latency || latency > 5000) {
    return <img src={DangerImg} className="w-full h-full" />;
  }
  if (latency < 1000) {
    return <img src={TickImg} className="w-full h-full" />;
  }

  return <img src={DangerImg} className="w-full h-full" />;
};

const getPrivacy = (tracking: 'none' | 'yes' | 'limited' | 'unspecified') => {
  switch (tracking) {
    case 'yes':
      return <img src={CrossImg} className="w-full h-full" />;
    case 'limited':
      return <img src={DangerImg} className="w-full h-full" />;
    case 'none':
      return <img src={TickImg} className="w-full h-full" />;
    default:
      return <img src={NoneImg} className="w-full h-full" />;
  }
};

const RpcLabel: FC<RPCInfo> = memo(function RpcLabel(props) {
  const { url, height, latency, tracking, trackingDetails } = props;
  if (!url) {
    return <></>;
  }
  return (
    <>
      <td className="max-w-0">
        <Tooltip
          className="overflow-hidden whitespace-nowrap pl-2 py-2 fade-right block"
          title={url}
          overlayClassName="rpc-tooltip"
        >
          {url}
        </Tooltip>
      </td>
      <td className="text-center">{height || ''}</td>
      <td className="text-center">{latency ? `${latency / 1000}s` : ''}</td>
      <td className="text-center">
        <div className="w-4 h-4 m-auto p-0.5">{getSpeed(latency)}</div>
      </td>
      <td className="text-right">
        {trackingDetails ? (
          <Tooltip
            className="w-4 h-4 m-auto p-0.5 hover-overlay__lighter rounded-full"
            title={trackingDetails}
            overlayClassName="rpc-tooltip"
            placement="left"
            showArrow={false}
          >
            {getPrivacy(tracking || 'unspecified')}
          </Tooltip>
        ) : (
          <div className="w-3 h-3 m-auto">
            {getPrivacy(tracking || 'unspecified')}
          </div>
        )}
      </td>
    </>
  );
});

const RpcsDropdown: React.FC<IProps> = ({
  options = [],
  selected,
  placeHolder,
  onChange,
  styles,
  defaultLabel,
  isValid,
}) => {
  const { isVisible, setIsVisible, ref } = useVisible(false);

  const handleChange = (item: RPCInfo) => {
    if (onChange) {
      onChange(item);
    }
    setIsVisible(false);
  };

  const getLabel = () => {
    if (!selected) {
      return defaultLabel || placeHolder || '';
    }
    return selected.url;
  };

  const onToggleVisible = () => {
    setIsVisible((old) => !old);
  };

  return (
    <div className="jwallet-dropdown" style={styles} ref={ref}>
      <div
        className={clsx(
          'jwallet-dropdown__main',
          typeof isValid !== 'undefined' &&
            isValid != null &&
            !isValid &&
            'jwallet-dropdown__main__invalid'
        )}
        onClick={onToggleVisible}
      >
        <span className="jwallet-dropdown__main-label truncate block">
          {getLabel()}
        </span>
        <span className="jwallet-dropdown__main-icon">
          <ArrowDown />
        </span>
      </div>
      {isVisible && (
        <div className="jwallet-dropdown__menus">
          <div className="overflow-y-auto thin-scrollbar max-h-72">
            <table className="w-full relative">
              <thead className="sticky top-0">
                <tr className="bg-[#5957d5]">
                  <th className="text-left">
                    <div className="pl-2 py-2">RPC</div>
                  </th>
                  <th className="text-center w-24">Height</th>
                  <th className="text-center w-20">Latency</th>
                  <th className="text-center w-6">
                    <Tooltip
                      className="w-5 h-5 m-auto p-0.5 hover-overlay rounded-full"
                      title="Score"
                      overlayClassName="rpc-tooltip"
                    >
                      <img src={SpeedImg} alt="" className="w-full h-full" />
                    </Tooltip>
                  </th>
                  <th className="text-right w-6">
                    <Tooltip
                      className="w-5 h-5 m-auto p-0.5 hover-overlay rounded-full"
                      title="Privacy"
                      overlayClassName="rpc-tooltip"
                    >
                      <img src={ShieldImg} alt="" className="w-full h-full" />
                    </Tooltip>
                  </th>
                </tr>
              </thead>
              <tbody>
                {options.map((x) => (
                  <tr
                    key={x.url}
                    className="hover-overlay hover:cursor-pointer"
                    onClick={() => handleChange(x)}
                  >
                    <RpcLabel {...x} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RpcsDropdown;
