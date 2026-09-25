import type { SVGProps } from 'react';

/** Provisional one-colour studio mark. The final mascot illustration needs owner approval. */
export function PandaMark(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 80 80" fill="none" aria-hidden="true" {...props}>
    <circle cx="17" cy="20" r="11" fill="currentColor" />
    <circle cx="63" cy="20" r="11" fill="currentColor" />
    <circle cx="40" cy="42" r="31" fill="var(--panda-face, #f8f5f0)" stroke="currentColor" strokeWidth="3" />
    <ellipse cx="27" cy="40" rx="8" ry="11" transform="rotate(20 27 40)" fill="currentColor" />
    <ellipse cx="53" cy="40" rx="8" ry="11" transform="rotate(-20 53 40)" fill="currentColor" />
    <circle cx="29" cy="40" r="2" fill="var(--panda-face, #f8f5f0)" />
    <circle cx="51" cy="40" r="2" fill="var(--panda-face, #f8f5f0)" />
    <path d="M36 54q4-4 8 0l-4 4-4-4Z" fill="currentColor" />
  </svg>;
}
