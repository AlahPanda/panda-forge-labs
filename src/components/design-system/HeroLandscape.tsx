import { useEffect, useState } from 'react';
import { useTheme } from '@/lib/theme';

type Scene = 'home' | 'mac' | 'news' | 'projects';
type Frame = { name: string; moment: 'day' | 'night' };
const path = (frame: Frame, mobile: boolean) => `/brand/${frame.name}-${frame.moment}${mobile ? '-mobile' : ''}.webp`;

function Picture({ frame, entering = false }: { frame: Frame; entering?: boolean }) {
  return <picture className={entering ? 'hero-landscape-entering' : undefined}>
    <source media="(max-width: 767px)" type="image/webp" srcSet={path(frame, true)} />
    <img src={path(frame, false)} alt="" width="1942" height="809" decoding="async" loading="eager" />
  </picture>;
}

/** Hold the previous artwork until the new moment has loaded, then dissolve. */
export function HeroLandscape({ scene = 'home' }: { scene?: Scene }) {
  const { theme } = useTheme();
  const name = scene === 'home' ? 'overlook' : scene;
  const moment = theme === 'dark' ? 'night' : 'day';
  const [frame, setFrame] = useState<Frame>(() => ({ name, moment }));
  const [previous, setPrevious] = useState<Frame | null>(null);

  useEffect(() => {
    if (frame.name === name && frame.moment === moment) return;
    let cancelled = false;
    const next: Frame = { name, moment };
    const loader = new Image();
    const show = () => { if (!cancelled) { setPrevious(frame); setFrame(next); } };
    loader.onload = show;
    loader.src = path(next, window.matchMedia('(max-width: 767px)').matches);
    if (loader.complete && loader.naturalWidth > 0) show();
    return () => { cancelled = true; loader.onload = null; };
  }, [frame, name, moment]);

  useEffect(() => {
    if (!previous) return;
    const timer = window.setTimeout(() => setPrevious(null), 380);
    return () => window.clearTimeout(timer);
  }, [previous, frame]);

  // Preload only the other moment of the scene being viewed, after idle time.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-data: reduce)').matches) return;
    const timer = window.setTimeout(() => {
      const preload = new Image();
      preload.src = path({ name, moment: moment === 'day' ? 'night' : 'day' }, window.matchMedia('(max-width: 767px)').matches);
    }, 950);
    return () => window.clearTimeout(timer);
  }, [name, moment]);

  return <div className="hero-landscape" aria-hidden="true">
    {previous && <Picture frame={previous} />}
    <Picture frame={frame} entering={!!previous} />
  </div>;
}
