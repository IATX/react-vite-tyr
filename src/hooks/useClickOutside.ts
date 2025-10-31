import { useEffect, type RefObject } from 'react';

type Handler = (event: MouseEvent | TouchEvent) => void;

function useClickOutside<T extends HTMLElement>(
  // ✨ Add | null to the type of the ref parameter
  ref: RefObject<T | null>, 
  handler: Handler,
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // The logic here remains the same
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

export default useClickOutside;