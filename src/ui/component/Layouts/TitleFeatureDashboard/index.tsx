import React from 'react';
import Routes from '@/constant/routes';
import { ReactComponent as ArrowLeft } from '@/ui/assets/jwallet/arrow-left.svg';
import { useHistory } from 'react-router-dom';
import './style.less';

interface IProps {
  title: string;
  showArrow?: boolean;
  onBack?: () => void;
}

const TitleFeatureDashboard: React.FC<IProps> = ({
  title = '',
  showArrow = true,
  onBack,
}) => {
  const history = useHistory();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      history.push(Routes.Dashboard);
    }
  };

  return (
    <div className="title">
      {showArrow && (
        <div onClick={handleBack} className="back hover-overlay rounded-lg">
          <ArrowLeft />
        </div>
      )}
      <div className="text">{title}</div>
    </div>
  );
};
export default TitleFeatureDashboard;
