import { useTheme } from '@/lib/theme';

/** The browser selects one responsive image for the active moment. */
export function HeroLandscape({ scene = 'home' }: { scene?: 'home' | 'mac' | 'news' | 'projects' }) {
  const { theme } = useTheme();
  const moment = theme === 'dark' ? 'night' : 'day';
  const name = scene === 'home' ? 'overlook' : scene;
  return <div className="hero-landscape" aria-hidden="true">
    <picture>
      <source media="(max-width: 767px)" type="image/webp" srcSet={`/brand/${name}-${moment}-mobile.webp`} />
      <img
        src={`/brand/${name}-${moment}.webp`}
        alt=""
        width="1942"
        height="809"
        decoding="async"
        loading="eager"
      />
    </picture>
  </div>;
}
