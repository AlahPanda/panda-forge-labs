import { ReactNode } from 'react';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import { useReveal } from '@/lib/useReveal';

export default function SiteLayout({ children }: { children: ReactNode }) {
  const ref = useReveal();
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main ref={ref as any} className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
