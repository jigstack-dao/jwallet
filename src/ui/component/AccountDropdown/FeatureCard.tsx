import React from 'react';

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  name: string;
  onClick?: () => void;
  href?: string;
}> = ({ icon, name, onClick, href }) => {
  return href ? (
    <a
      className="px-4 w-full h-[46px] flex items-center cursor-pointer hover:text-white hover-overlay"
      href={href}
      target={'_blank'}
      rel="noreferrer"
    >
      <div className="mr-3">{icon}</div>
      <div className="text-14">{name}</div>
    </a>
  ) : (
    <div
      className="px-4 w-full h-[46px] flex items-center cursor-pointer hover-overlay"
      onClick={() => {
        if (onClick) onClick();
      }}
    >
      <div className="mr-3">{icon}</div>
      <div className="text-14">{name}</div>
    </div>
  );
};
export default FeatureCard;
