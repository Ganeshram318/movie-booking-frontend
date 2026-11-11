import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname, hash, key } = useLocation();

  useLayoutEffect(() => {
    let target = null;
    try {
      if (hash) target = document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch { /* An invalid fragment falls back to the top of the page. */ }
    if (target) target.scrollIntoView({ block: 'start' });
    else window.scrollTo(0, 0);
  }, [pathname, hash, key]);

  return null;
}

export default ScrollToTop;
