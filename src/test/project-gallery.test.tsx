import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
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
