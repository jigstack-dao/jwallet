import React from 'react';
import { Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import IconSpeedUpCorner from 'ui/assets/speedup-corner.svg';

const SpeedUpCorner = () => {
  const { t } = useTranslation();
  return (
    <Tooltip
      title={t('SpeedUpTooltip')}
      overlayClassName="rectangle speedup-corner-tooltip"
    >
      <img src={IconSpeedUpCorner} className="speedup-corner" />
    </Tooltip>
  );
};

export default SpeedUpCorner;
