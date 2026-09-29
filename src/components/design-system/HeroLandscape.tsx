import { useEffect, useState } from 'react';
import { useTheme } from '@/lib/theme';

type Scene = 'home' | 'mac' | 'news' | 'projects' | 'launchers' | 'faq' | 'about' | 'guides';
type Frame = { name: string; moment: 'day' | 'night' };
type Artwork = { day: string; night: string; dayMobile?: string; nightMobile?: string };
const path = (frame: Frame, mobile: boolean, artwork?: Artwork) => artwork ? (mobile ? artwork[frame.moment === 'day' ? 'dayMobile' : 'nightMobile'] : undefined) || artwork[frame.moment] : `/brand/${frame.name}-${frame.moment}${mobile ? '-mobile' : ''}.webp`;

function Picture({ frame, entering = false, artwork }: { frame: Frame; entering?: boolean; artwork?: Artwork }) {
  return <picture className={entering ? 'hero-landscape-entering' : undefined}>
    <source media="(max-width: 767px)" srcSet={path(frame, true, artwork)} />
    <img src={path(frame, false, artwork)} alt="" width="1942" height="809" decoding="async" loading="eager" />
  </picture>;
}

/** Hold the previous artwork until the new moment has loaded, then dissolve. */
export function HeroLandscape({ scene = 'home', artwork }: { scene?: Scene; artwork?: Artwork }) {
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
    loader.src = path(next, window.matchMedia('(max-width: 767px)').matches, artwork);
    if (loader.complete && loader.naturalWidth > 0) show();
    return () => { cancelled = true; loader.onload = null; };
  }, [frame, name, moment, artwork]);

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
      preload.src = path({ name, moment: moment === 'day' ? 'night' : 'day' }, window.matchMedia('(max-width: 767px)').matches, artwork);
    }, 950);
    return () => window.clearTimeout(timer);
  }, [name, moment, artwork]);

  return <div className="hero-landscape" aria-hidden="true">
    {previous && <Picture frame={previous} artwork={artwork} />}
    <Picture frame={frame} entering={!!previous} artwork={artwork} />
  </div>;
}
