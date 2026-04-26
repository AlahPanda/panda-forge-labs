import { useEffect, useRef } from 'react';
import { site } from '@/content';

interface Props {
  /** AdSense ad slot ID. Optional — if absent, only the placeholder shows. */
  slot?: string;
  /** Visual format/size. */
  format?: 'banner' | 'rectangle' | 'sidebar' | 'in-feed';
  className?: string;
  label?: string;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

/** Fixed heights to prevent CLS (Cumulative Layout Shift). */
const HEIGHT: Record<NonNullable<Props['format']>, string> = {
  banner: 'h-[120px] md:h-[120px]',
  rectangle: 'h-[250px]',
  sidebar: 'h-[600px]',
  'in-feed': 'h-[140px]',
};

export default function AdSlot({ slot, format = 'banner', className = '', label = 'Advertisement' }: Props) {
  const ref = useRef<HTMLModElement>(null);
  const enabled = site.ads.adsenseEnabled && !!site.ads.adsenseClient;

  useEffect(() => {
    if (!enabled) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // noop — script not yet loaded
    }
  }, [enabled]);

  return (
    <aside
      aria-label={label}
      className={`relative w-full border border-dashed border-hairline rounded-lg bg-elev/40 overflow-hidden ${HEIGHT[format]} ${className}`}
    >
      <span className="absolute top-2 left-3 label-mono text-[10px] text-muted-foreground/70">
        {label}
      </span>

      {enabled ? (
        <ins
          ref={ref}
          className="adsbygoogle block w-full h-full"
          style={{ display: 'block' }}
          data-ad-client={site.ads.adsenseClient}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-muted-foreground/60">
          ad slot · {format}
        </div>
      )}
    </aside>
  );
}
