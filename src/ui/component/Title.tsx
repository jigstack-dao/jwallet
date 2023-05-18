import React from 'react';

interface IProps {
  text?: string;
}

const Title: React.FC<IProps> = ({ text = '' }) => {
  return <p className="font-GilroyExtraBold text-22 text-center">{text}</p>;
};

export default Title;
