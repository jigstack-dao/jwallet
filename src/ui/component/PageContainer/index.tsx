import React from 'react';
import './style.less';
import { ReactComponent as ArrowLeft } from '@/ui/assets/jwallet/arrow-left.svg';
import { useHistory } from 'react-router-dom';
import usePageStateCache from '@/hooks/wallet/usePageStateCache';
import Header from '../Layouts/Header';

const PageContainer: React.FC<{
  children: React.ReactChild;
  title: string;
  onBack?: () => void;
}> = ({ children, title, onBack }) => {
  const { clearCachePage } = usePageStateCache();
  const history = useHistory();
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      clearCachePage();
      history.goBack();
    }
  };
  return (
    <div className="page-container flex justify-center" id="extension">
      <div className="w-[400px]">
        <Header />
        <div className="title">
          <div onClick={handleBack} className="back hover-overlay rounded-lg">
            <ArrowLeft />
          </div>
          <div className="text">{title}</div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
