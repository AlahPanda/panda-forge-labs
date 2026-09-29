import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export type GalleryImage = { url: string; alt: string; caption?: string };
export function ProjectGallery({ images, title, fallback = 'projects' }: { images: GalleryImage[]; title: string; fallback?: 'mac' | 'projects' }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef<number | null>(null);
  const count = images.length;
  const mediaKey = images.map((image) => image.url).join('|');
  useEffect(() => setIndex(0), [mediaKey]);
  useEffect(() => {
    if (count < 2 || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % count), 3000);
    return () => window.clearInterval(timer);
  }, [count, paused, mediaKey]);
  useEffect(() => {
    if (count < 2 || !images[(index + 1) % count]) return;
    const next = new Image(); next.src = images[(index + 1) % count].url;
  }, [count, index, images]);
  if (!count) return <div className={`mac-gallery mac-gallery-illustration ${fallback === 'projects' ? 'project-gallery-illustration' : ''}`} role="img" aria-label={t('mac.illustration')}><span>{title}</span><small>{t('mac.illustration')}</small></div>;
  const active = images[index % count];
  const move = (direction: number) => setIndex((current) => (current + direction + count) % count);
  return <div className="mac-gallery" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }} onTouchStart={(event) => { touch.current = event.touches[0]?.clientX ?? null; }} onTouchEnd={(event) => { if (touch.current !== null) { const delta = (event.changedTouches[0]?.clientX ?? touch.current) - touch.current; if (Math.abs(delta) > 45) move(delta > 0 ? -1 : 1); } touch.current = null; }}>
    <img key={active.url} src={active.url} alt={active.alt} loading="lazy" decoding="async" />
    <div className="mac-gallery-caption"><span>{t('mac.screenshots')} · {index % count + 1}/{count}</span>{active.caption && <strong>{active.caption}</strong>}</div>
    {count > 1 && <div className="mac-gallery-controls"><div className="mac-gallery-dots" role="group" aria-label={t('mac.screenshots')}>{images.map((image, position) => <button key={image.url} type="button" aria-label={`${t('mac.screenshots')} ${position + 1}`} aria-current={position === index ? 'true' : undefined} onClick={() => setIndex(position)} />)}</div><div className="mac-gallery-arrows"><button type="button" aria-label={t('mac.previous')} onClick={() => move(-1)}><ChevronLeft size={20}/></button><button type="button" aria-label={t('mac.next')} onClick={() => move(1)}><ChevronRight size={20}/></button></div></div>}
  </div>;
}
