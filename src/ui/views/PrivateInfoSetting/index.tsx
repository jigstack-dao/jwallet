import PageContainer from '@/ui/component/PageContainer';
import { useWallet } from '@/ui/utils';
import clsx from 'clsx';
import React, { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import ExportSeed from './Components/ExportSeed';
import './style.less';

const FEATURES = ['Export the SEED'];

const PrivateInfoSetting = () => {
  const [feature, setFeature] = useState('');

  const [activeExport, setActiveExport] = useState(false);
  const wallet = useWallet();
  const history = useHistory();

  useEffect(() => {
    void (async () => {
      const _activeExport = await wallet.isExportSeed();
      setActiveExport(_activeExport);
    })();
  }, []);

  const renderContent = useMemo(() => {
    switch (feature) {
      case 'Export the SEED':
        return <ExportSeed />;
      default:
        return FEATURES.map((x) => (
          <div
            className={clsx(
              'setting-card',
              !activeExport && x == 'Export the SEED'
                ? 'export-seed-disabled'
                : ''
            )}
            key={x}
            onClick={() => setFeature(x)}
          >
            <div className="setting-card__name">{x}</div>
          </div>
        ));
    }
  }, [feature, activeExport]);

  const onBack = () => {
    if (feature == '') {
      history.goBack();
    } else {
      setFeature('');
    }
  };

  return (
    <PageContainer title="Private Info" onBack={() => onBack()}>
      <div>{renderContent}</div>
    </PageContainer>
  );
};

export default PrivateInfoSetting;
