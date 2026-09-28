import { useEffect, useRef } from 'react';

/** Adds .in to children with .reveal as they enter the viewport. */
export function useReveal() {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = containerRef.current ?? document;
    const container = root === document ? document : root;
    const els = container.querySelectorAll('.reveal');
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
    // Filtered cards may enter after the route has mounted.
    const mutations = new MutationObserver((changes) => changes.forEach((change) => change.addedNodes.forEach((node) => {
      if (!(node instanceof Element)) return;
      if (node.matches('.reveal')) io.observe(node);
      node.querySelectorAll('.reveal').forEach((child) => io.observe(child));
    })));
    mutations.observe(container, { childList: true, subtree: true });
    return () => { mutations.disconnect(); io.disconnect(); };
  }, []);

  return containerRef;
}
