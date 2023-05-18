import { useState, useEffect, useRef } from 'react';

export default function useVisible(initialIsVisible: boolean) {
  const [isVisible, setIsVisible] = useState(initialIsVisible);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: Event) => {
    if (
      ref.current &&
      !ref.current.contains(event.target as Node) &&
      isVisible
    ) {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [isVisible]);

  return { ref, isVisible, setIsVisible };
}
