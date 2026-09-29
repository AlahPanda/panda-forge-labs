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
