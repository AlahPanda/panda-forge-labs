import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useI18n } from '@/lib/i18n';
import { galleryLabels } from '@/content/project-galleries';

export type GalleryImage = {
  url: string; alt: string; caption?: string; captionTitle?: string;
  width?: number; height?: number; srcSet?: string; objectPosition?: string;
};
const gallerySizes = '(min-width: 1280px) 700px, (min-width: 1024px) 58vw, calc(100vw - 48px)';
const initialSlide = { index: 0, direction: 1, previous: null as number | null, sequence: 0 };
export function ProjectGallery({ images, title, fallback = 'projects' }: { images: GalleryImage[]; title: string; fallback?: 'mac' | 'projects' }) {
  const { t, locale } = useI18n();
  const labels = galleryLabels(locale);
  const [slide, setSlide] = useState(initialSlide);
  const [paused, setPaused] = useState(false);
  const [open, setOpen] = useState(false);
  const [loadedUrl, setLoadedUrl] = useState('');
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const touch = useRef<number | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const count = images.length;
  const mediaKey = images.map((image) => image.url).join('|');
  const index = count ? slide.index % count : 0;
  const active = images[index];
  const previous = slide.previous === null ? undefined : images[slide.previous];
  const nextImage = count > 1 ? images[(index + 1) % count] : undefined;
  const nextUrl = nextImage?.url;
  const nextSrcSet = nextImage?.srcSet;
  useEffect(() => { setSlide(initialSlide); setOpen(false); setLoadedUrl(''); }, [mediaKey]);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReducedMotion(query.matches);
    query.addEventListener?.('change', change);
    return () => query.removeEventListener?.('change', change);
  }, []);
  useEffect(() => {
    if (count < 2 || paused || open || reducedMotion) return;
    const timer = window.setInterval(() => setSlide((current) => ({ index: (current.index + 1) % count, previous: current.index % count, direction: 1, sequence: current.sequence + 1 })), 3000);
    return () => window.clearInterval(timer);
  }, [count, paused, open, reducedMotion, mediaKey]);
  useEffect(() => {
    if (!nextUrl) return;
    const next = new Image();
    next.sizes = gallerySizes;
    if (nextSrcSet) next.srcset = nextSrcSet;
    next.src = nextUrl;
  }, [nextUrl, nextSrcSet]);
  useEffect(() => {
    if (slide.previous === null || loadedUrl !== active?.url) return;
    const timer = window.setTimeout(() => setSlide((current) => ({ ...current, previous: null })), reducedMotion ? 0 : 320);
    return () => window.clearTimeout(timer);
  }, [slide.sequence, slide.previous, loadedUrl, active?.url, reducedMotion]);
  if (!count) return <div className={`mac-gallery mac-gallery-illustration ${fallback === 'projects' ? 'project-gallery-illustration' : ''}`} role="img" aria-label={t('mac.illustration')}><span>{title}</span><small>{t('mac.illustration')}</small></div>;
  const move = (direction: number) => setSlide((current) => ({ index: (current.index + direction + count) % count, previous: current.index % count, direction, sequence: current.sequence + 1 }));
  const select = (position: number) => {
    if (position === index) return;
    setSlide((current) => ({ index: position, previous: current.index % count, direction: position > current.index % count ? 1 : -1, sequence: current.sequence + 1 }));
  };
  const wrap = slide.previous !== null && ((slide.direction > 0 && slide.previous === count - 1 && index === 0) || (slide.direction < 0 && slide.previous === 0 && index === count - 1));
  const arrows = (className: string) => count > 1 && <div className={className}>
    <button type="button" aria-label={t('mac.previous')} onClick={() => move(-1)}><ChevronLeft size={20}/></button>
    <button type="button" aria-label={t('mac.next')} onClick={() => move(1)}><ChevronRight size={20}/></button>
  </div>;
  return <Dialog.Root open={open} onOpenChange={setOpen}>
    <div className="mac-gallery mac-gallery-photographic" data-direction={slide.direction > 0 ? 'next' : 'previous'}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
      <Dialog.Trigger asChild>
        <button type="button" className="mac-gallery-image" data-transitioning={loadedUrl === active.url} aria-label={`${labels.open}: ${active.captionTitle || active.alt}`}
          onTouchStart={(event) => { touch.current = event.touches[0]?.clientX ?? null; }}
          onTouchEnd={(event) => { if (touch.current !== null) { const delta = (event.changedTouches[0]?.clientX ?? touch.current) - touch.current; if (Math.abs(delta) > 45) { move(delta > 0 ? -1 : 1); event.preventDefault(); } } touch.current = null; }}>
          {previous && <img className="mac-gallery-outgoing" src={previous.url} srcSet={previous.srcSet} sizes={previous.srcSet ? gallerySizes : undefined} style={{ objectPosition: previous.objectPosition }} alt="" aria-hidden="true" decoding="async"/>}
          <img key={`${active.url}-${slide.sequence}`} className="mac-gallery-current" src={active.url} srcSet={active.srcSet}
            sizes={active.srcSet ? gallerySizes : undefined} width={active.width} height={active.height} alt={active.alt}
            style={{ objectPosition: active.objectPosition }} loading="lazy" decoding="async"
            data-ready={loadedUrl === active.url || !previous} onLoad={() => setLoadedUrl(active.url)}/>
          <span className="mac-gallery-expand" aria-hidden="true"><Expand size={18}/></span>
        </button>
      </Dialog.Trigger>
      <div className="mac-gallery-caption" aria-live="polite" aria-atomic="true">
        {active.captionTitle && <strong>{active.captionTitle}</strong>}
        {active.caption && <p>{active.caption}</p>}
      </div>
      {count > 1 && <div className="mac-gallery-controls">
        <div className="mac-gallery-dots" role="group" aria-label={t('mac.screenshots')}>
          <span className={`mac-gallery-dot-active${wrap ? ' is-wrap' : ''}`} data-direction={slide.direction > 0 ? 'next' : 'previous'} style={{ '--dot-index': index } as CSSProperties} aria-hidden="true"/>
          {wrap && <span key={slide.sequence} className="mac-gallery-dot-ghost" style={{ '--dot-index': slide.previous, '--dot-step': slide.direction * 28 } as CSSProperties} aria-hidden="true"/>}
          {images.map((image, position) => <button key={image.url} type="button" aria-label={`${t('mac.screenshots')} ${position + 1}`} aria-current={position === index ? 'true' : undefined} onClick={() => select(position)}/>)}
        </div>
        {arrows('mac-gallery-arrows')}
      </div>}
    </div>
    <Dialog.Portal>
      <Dialog.Overlay className="mac-gallery-lightbox-backdrop"/>
      <Dialog.Content className="mac-gallery-lightbox" onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }} onOpenAutoFocus={(event) => { event.preventDefault(); closeButton.current?.focus(); }}
        onKeyDown={(event) => { if (count > 1 && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); } }}>
        <Dialog.Title className="sr-only">{title} — {labels.viewer}</Dialog.Title>
        <Dialog.Description className="sr-only">{labels.keyboard}</Dialog.Description>
        <Dialog.Close ref={closeButton} type="button" className="mac-gallery-lightbox-close" aria-label={labels.close}><X size={22}/></Dialog.Close>
        {/* The viewer always opens the unchanged native source, including any original FPS overlay. */}
        <img key={active.url} src={active.url} alt={active.alt} width={active.width} height={active.height} decoding="async"
          style={{ maxWidth: active.width ? `min(100%, ${active.width}px)` : '100%' }}/>
        <div className="mac-gallery-lightbox-footer">
          <div>{active.captionTitle && <strong>{active.captionTitle}</strong>}{active.caption && <p>{active.caption}</p>}</div>
          {arrows('mac-gallery-arrows')}
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
