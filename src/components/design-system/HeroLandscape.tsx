import { useTheme } from '@/lib/theme';

/** The browser selects one responsive image for the active moment. */
export function HeroLandscape() {
  const { theme } = useTheme();
  const moment = theme === 'dark' ? 'night' : 'day';
  return <div className="hero-landscape" aria-hidden="true">
    <picture>
      <source media="(max-width: 767px)" type="image/webp" srcSet={`/brand/overlook-${moment}-mobile.webp`} />
      <img
        src={`/brand/overlook-${moment}.webp`}
        alt=""
        width="1983"
        height="793"
        decoding="async"
        loading="eager"
      />
    </picture>
  </div>;
}
