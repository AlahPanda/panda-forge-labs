import { useEffect, useRef } from 'react';

/** Adds .in to children with .reveal as they enter the viewport. */
export function useReveal() {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = containerRef.current ?? document;
    const els = (root === document ? document : root).querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return containerRef;
}
