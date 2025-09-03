import { useEffect } from 'react';
// Fix: Corrected react-router-dom import to use namespace import to resolve module export errors.
import * as ReactRouterDOM from 'react-router-dom';

const ScrollToTop: React.FC = () => {
  const { pathname } = ReactRouterDOM.useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;