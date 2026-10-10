import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import { ProjectGallery } from '@/components/experience/ProjectGallery';

afterEach(()=>{ cleanup();vi.useRealTimers();vi.unstubAllGlobals(); });
const images=Array.from({length:10},(_,i)=>({url:`https://cdn.modrinth.com/data/test/${i}.webp`,alt:`Gallery ${i+1}`}));
const show=(count:number)=>render(<I18nProvider><ProjectGallery title="Future project" images={images.slice(0,count)}/></I18nProvider>);
describe('reusable project carousel',()=>{
  it('renders one image without cycling',()=>{show(1);expect(screen.getByRole('img',{name:'Gallery 1'})).toBeInTheDocument();expect(screen.queryByRole('button',{name:'Next image'})).not.toBeInTheDocument();});
  it('uses all ten images, keyboard controls and a three-second timer',()=>{
    vi.useFakeTimers();
    show(10);
    expect(screen.getAllByRole('button',{name:/Screenshots [0-9]+/})).toHaveLength(10);
    act(()=>{vi.advanceTimersByTime(3000);});
    expect(screen.getByRole('img',{name:'Gallery 2'})).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Previous image'}));
    expect(screen.getByRole('img',{name:'Gallery 1'})).toBeInTheDocument();
  });
  it('disables autoplay for reduced motion while leaving manual navigation usable',()=>{
    vi.stubGlobal('matchMedia',()=>({matches:true,addListener:vi.fn(),removeListener:vi.fn()}));
    vi.useFakeTimers();show(3);
    act(()=>{vi.advanceTimersByTime(6000);});
    expect(screen.getByRole('img',{name:'Gallery 1'})).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Next image'}));
    expect(screen.getByRole('img',{name:'Gallery 2'})).toBeInTheDocument();
  });
});

import { curatedProjectGallery } from '@/content/project-galleries';
describe('owner-supplied gallery assets',()=>{
  it('keeps six native images and responsive sources in every locale',()=>{
    for(const locale of ['en','pt-PT','pt-BR','es'] as const){
      const gallery=curatedProjectGallery('mac-native',locale);
      expect(gallery).toHaveLength(6);
      for(const image of gallery){
        expect(image.url).toMatch(/^\/projects\/mac-native\/gallery\//);
        expect(image.width).toBe(1920);
        expect([800,1200]).toContain(image.height);
        expect(image.srcSet).toContain(`${image.url} 1920w`);
        expect(image.alt).toBeTruthy();
      }
    }
    expect(curatedProjectGallery('future-project','en')).toEqual([]);
  });
  it('renders responsive dimensions without preloading every slide',()=>{
    render(<I18nProvider><ProjectGallery title="Mac Native" images={curatedProjectGallery('mac-native','en')}/></I18nProvider>);
    const image=screen.getByRole('img');
    expect(image).toHaveAttribute('width','1920');
    expect(image).toHaveAttribute('height','800');
    expect(image).toHaveAttribute('loading','lazy');
    expect(image).toHaveAttribute('srcset',expect.stringContaining('1920w'));
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(document.querySelectorAll('link[rel="preload"]')).toHaveLength(0);
  });
});


describe('gallery editorial experience and lightbox',()=>{
  const curated = () => render(<I18nProvider><ProjectGallery title="Mac Native" images={curatedProjectGallery('mac-native','en')}/></I18nProvider>);
  it('separates editorial copy from accessible descriptions and removes the visible counter',()=>{
    curated();
    expect(screen.getByText('Take the scenic route')).toBeInTheDocument();
    expect(screen.getByText('Leave room for a detour when the view is worth it.')).toBeInTheDocument();
    expect(screen.queryByText(/^Screenshots/)).not.toBeInTheDocument();
    expect(screen.getByRole('group',{name:'Screenshots'})).toBeInTheDocument();
    const photo=screen.getByRole('img');
    expect(photo).toHaveAttribute('alt','Sunlit cherry grove overlooking grassy hills');
    expect(photo.getAttribute('alt')).not.toBe(screen.getByText('Take the scenic route').textContent);
  });
  it('tracks direction for arrows, dots and both wrap boundaries',()=>{
    show(3);
    const gallery=document.querySelector('.mac-gallery');
    fireEvent.click(screen.getByRole('button',{name:'Previous image'}));
    expect(gallery).toHaveAttribute('data-direction','previous');
    expect(screen.getByRole('button',{name:'Screenshots 3'})).toHaveAttribute('aria-current','true');
    expect(document.querySelector('.mac-gallery-dot-active')).toHaveClass('is-wrap');
    fireEvent.click(screen.getByRole('button',{name:'Next image'}));
    expect(gallery).toHaveAttribute('data-direction','next');
    expect(screen.getByRole('button',{name:'Screenshots 1'})).toHaveAttribute('aria-current','true');
    expect(document.querySelector('.mac-gallery-dot-active')).toHaveClass('is-wrap');
    fireEvent.click(screen.getByRole('button',{name:'Screenshots 2'}));
    expect(gallery).toHaveAttribute('data-direction','next');
    expect(document.querySelector('.mac-gallery-dot-active')).not.toHaveClass('is-wrap');
    fireEvent.click(screen.getByRole('button',{name:'Screenshots 1'}));
    expect(gallery).toHaveAttribute('data-direction','previous');
  });
  it('opens the native source in the same-tab viewer, supports keyboard arrows, locks scroll and restores focus',async()=>{
    curated();
    const trigger=screen.getByRole('button',{name:'Open image: Take the scenic route'});
    trigger.focus();fireEvent.click(trigger);
    const dialog=await screen.findByRole('dialog',{name:'Mac Native — Image viewer'});
    const close=within(dialog).getByRole('button',{name:'Close image viewer'});
    await waitFor(()=>expect(close).toHaveFocus());
    expect(document.body).toHaveAttribute('data-scroll-locked');
    expect(within(dialog).getByRole('img')).toHaveAttribute('src','/projects/mac-native/gallery/01-cherry-grove-hero.jpg');
    expect(within(dialog).getByRole('img')).not.toHaveAttribute('srcset');
    fireEvent.keyDown(close,{key:'ArrowRight'});
    expect(within(dialog).getByRole('img')).toHaveAttribute('src','/projects/mac-native/gallery/02-lake-landscape.png');
    fireEvent.keyDown(close,{key:'ArrowLeft'});
    expect(within(dialog).getByRole('img')).toHaveAttribute('src','/projects/mac-native/gallery/01-cherry-grove-hero.jpg');
    fireEvent.keyDown(close,{key:'Tab',shiftKey:true});
    expect(within(dialog).getByRole('button',{name:'Next image'})).toHaveFocus();
    fireEvent.keyDown(document.activeElement!,{key:'Escape'});
    await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(()=>expect(trigger).toHaveFocus());
    expect(document.body).not.toHaveAttribute('data-scroll-locked');
  });
  it('dismisses when the dark space outside the image is clicked',async()=>{
    curated();
    const trigger=screen.getByRole('button',{name:'Open image: Take the scenic route'});
    trigger.focus();fireEvent.click(trigger);
    const dialog=await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('img'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(dialog);
    await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(()=>expect(trigger).toHaveFocus());
  });
  it('closes with its close control and pauses autoplay while viewing',async()=>{
    vi.useFakeTimers();curated();
    fireEvent.click(screen.getByRole('button',{name:'Open image: Take the scenic route'}));
    act(()=>{vi.advanceTimersByTime(9000);});
    const dialog=screen.getByRole('dialog');
    expect(within(dialog).getByRole('img')).toHaveAttribute('alt','Sunlit cherry grove overlooking grassy hills');
    fireEvent.click(within(dialog).getByRole('button',{name:'Next image'}));
    expect(within(dialog).getByRole('img')).toHaveAttribute('alt','Lake beneath a cherry-covered hillside');
    fireEvent.click(within(dialog).getByRole('button',{name:'Close image viewer'}));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('provides distinct editorial captions and viewer labels in all four locales',()=>{
    for(const locale of ['en','pt-PT','pt-BR','es'] as const){
      const gallery=curatedProjectGallery('mac-native',locale);
      expect(new Set(gallery.map(image=>image.captionTitle)).size).toBe(6);
      for(const image of gallery){expect(image.captionTitle).toBeTruthy();expect(image.caption).not.toBe(image.alt);}
      expect(gallery[1].objectPosition).toBe('50% 100%');
    }
  });
});
