import React, { memo, ReactNode } from 'react';
import { useHistory } from 'react-router-dom';
import cx from 'clsx';
import { Button } from 'antd';
import { colorCSS } from './Buttons/PrimaryButton';

interface StrayFooterProps {
  className?: string;
  children: ReactNode;
  isFixed?: boolean;
}

export interface StrayFooterNavProps {
  onNextClick?: (e?: any) => void;
  onBackClick?: () => void;
  backDisabled?: boolean;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  hasBack?: boolean;
  hasDivider?: boolean;
  className?: string;
  NextButtonContent?: React.ReactNode;
  BackButtonContent?: React.ReactNode;
  footerFixed?: boolean;
}

interface CompoundedComponent
  extends React.MemoExoticComponent<React.FunctionComponent<StrayFooterProps>> {
  Nav: typeof StrayFooterNav;
}

const StrayFooter = memo(function StrayFooter({
  className,
  children,
  isFixed = true,
}: StrayFooterProps) {
  return (
    <div
      className={cx(
        'bottom-0 left-0 w-full flex lg:bottom-[-24px]',
        className,
        {
          fixed: isFixed,
          absolute: !isFixed,
        }
      )}
    >
      {children}
    </div>
  );
}) as CompoundedComponent;

const StrayFooterNav = memo(function StrayFooterNav({
  onNextClick,
  onBackClick,
  backDisabled,
  nextDisabled,
  nextLoading,
  hasBack = false,
  hasDivider = false,
  NextButtonContent = 'Next',
  BackButtonContent = 'Back',
  className,
  footerFixed,
}: StrayFooterNavProps) {
  const history = useHistory();

  const handleBack = async () => {
    if (onBackClick) {
      onBackClick();
      return;
    }

    history.goBack();
  };

  return (
    <StrayFooter className={className} isFixed={footerFixed}>
      <div
        className={cx(
          'py-24 px-20 w-full flex justify-center',
          hasDivider && ' border-gray-divider'
        )}
      >
        {hasBack && (
          <Button
            disabled={backDisabled}
            onClick={handleBack}
            size="large"
            className="flex-1 mr-16 lg:h-[52px]"
          >
            {BackButtonContent}
          </Button>
        )}
        <button
          disabled={nextDisabled}
          type="submit"
          onClick={onNextClick}
          style={{
            ...colorCSS['primary'],
            boxShadow: '0px 4px 24px -1px rgba(0, 0, 0, 0.1)',
          }}
          className={cx('btn-clear', hasBack ? 'flex-1' : '')}
        >
          {NextButtonContent}
        </button>
      </div>
    </StrayFooter>
  );
});

StrayFooter.Nav = StrayFooterNav;

export default StrayFooter;
