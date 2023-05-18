import React, { useLayoutEffect, useRef } from 'react';
import AccountDropdown from '../../AccountDropdown';
import NetworkDropdown from '../../NetworkDropdown';
import LogoHeader from '@/ui/assets/logo/logo-header.svg';
import { useHistory } from 'react-router-dom';
import Routes from '@/constant/routes';

const Header = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const history = useHistory();

  useLayoutEffect(() => {
    const extension = document.getElementById('extension');

    const scrollHandler = (event: Event) => {
      const header = headerRef.current;
      const offset = (header?.offsetHeight || 0) / 3;
      const scroll = extension?.scrollTop || 0;
      if (scroll > offset) {
        if (header) {
          header.style.background = 'rgb(89, 87, 213)';
        }
      } else {
        if (header) {
          header.style.background = '';
        }
      }
    };

    extension?.addEventListener('scroll', scrollHandler, true);

    return () => {
      extension?.removeEventListener('scroll', scrollHandler);
    };
  }, []);

  const onRedirectHome = () => {
    history.push(Routes.Dashboard);
  };

  return (
    <div
      className="flex justify-center items-center py-4 fixed w-full px-3 top-0 left-0 z-20 transition"
      ref={headerRef}
    >
      <div className="flex justify-between w-[400px]">
        <div className="p-1 rounded-md hover-overlay">
          <img
            className="cursor-pointer"
            src={LogoHeader}
            alt=""
            onClick={onRedirectHome}
          />
        </div>
        <NetworkDropdown />
        <AccountDropdown />
      </div>
    </div>
  );
};

export default Header;
