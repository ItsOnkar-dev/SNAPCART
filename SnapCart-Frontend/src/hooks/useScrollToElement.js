import { useCallback, useRef } from 'react';

/**
 * Custom hook for scrolling to elements
 * @param {Object} options - Configuration options
 * @param {string} options.behavior - Scroll behavior ('smooth', 'auto', 'instant')
 * @param {string} options.block - Vertical alignment ('start', 'center', 'end', 'nearest')
 * @param {string} options.inline - Horizontal alignment ('start', 'center', 'end', 'nearest')
 * @returns {Object} - Object containing ref and scroll function
 */
const useScrollToElement = (options = {}) => {
  const {
    behavior = 'smooth',
    block = 'center',
    inline = 'nearest'
  } = options;

  const elementRef = useRef(null);

  const scrollToElement = useCallback((delay = 0) => {
    if (elementRef.current) {
      setTimeout(() => {
        elementRef.current.scrollIntoView({
          behavior,
          block,
          inline
        });
      }, delay);
    }
  }, [behavior, block, inline]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  return {
    ref: elementRef,
    scrollToElement,
    scrollToTop
  };
};

export default useScrollToElement; 