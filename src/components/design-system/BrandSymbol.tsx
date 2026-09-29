import type { SVGProps } from 'react';

/** Replaceable, original interim symbol; not the approved final mascot or logo. */
export function BrandSymbol(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 76 76" fill="none" aria-hidden="true" {...props}>
    <path d="M11 27C6 20 9 9 18 8c8-1 13 4 14 10m33 9c5-7 3-17-6-19-8-2-13 3-15 10" fill="currentColor" />
    <path d="M39 15c16-1 27 9 29 26 1 17-12 29-29 30C22 72 8 61 8 44 7 27 20 16 39 15Z" fill="var(--panda-face)" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />
    <path d="M24 32c-6 3-8 14-3 19 6 5 13-3 13-11 0-7-4-11-10-8Zm30-1c6 2 9 13 5 18-5 6-13-1-15-9-2-8 4-12 10-9Z" fill="currentColor" />
    <path d="m33 54 5-3 6 2-5 5c-2 1-4-1-6-4Z" fill="currentColor" />
    <path d="M30 59c4 5 13 6 19 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M26 42h1m26-2h1" stroke="var(--panda-face)" strokeWidth="3" strokeLinecap="round" />
  </svg>;
}
