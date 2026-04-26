import { useState, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  /** Tailwind aspect class, e.g. 'aspect-video', 'aspect-square' */
  aspect?: string;
  rounded?: string;
}

/**
 * Image with skeleton placeholder + object-cover.
 * Reserves space via aspect-ratio to prevent CLS.
 */
export default function SmartImage({
  src,
  alt = '',
  aspect = 'aspect-video',
  rounded = 'rounded-md',
  className,
  ...rest
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div className={cn('relative overflow-hidden bg-elev', aspect, rounded)}>
      {!loaded && !errored && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-secondary to-elev" />
      )}
      {src && !errored && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-500',
            loaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          {...rest}
        />
      )}
      {errored && (
        <div className="absolute inset-0 grid-bg-fine flex items-center justify-center">
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground/60">
            no image
          </div>
        </div>
      )}
    </div>
  );
}
