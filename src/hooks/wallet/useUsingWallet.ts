import { useEffect, useState } from 'react';

const useUsingWallet = () => {
  const [hasUsing, setHasUsing] = useState(1);
  useEffect(() => {
    const handleChange = () => {
      setHasUsing((prev) => prev + 1);
    };
    window.addEventListener('click', handleChange);
    return () => {
      window.removeEventListener('click', handleChange);
    };
  }, []);
  return hasUsing;
};

export default useUsingWallet;
