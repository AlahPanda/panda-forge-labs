import SiteLayout from '@/components/layout/SiteLayout';
import Seo from '@/components/Seo';
import { faq } from '@/content';
import { useI18n } from '@/lib/i18n';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Faq() {
  const { t } = useI18n();
  return (
    <SiteLayout>
      <Seo title="FAQ — AlahPanda Labs" description="Common questions about installation, performance, and support." />
      <section className="container max-w-3xl py-16">
        <div className="label-mono reveal">06 — Reference</div>
        <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight reveal">{t('nav.faq')}</h1>

        <div className="mt-12 space-y-12">
          {faq.map((cat) => (
            <div key={cat.id} className="reveal">
              <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-signal mb-4">{cat.title}</h2>
              <div className="border border-hairline rounded-lg divide-y divide-hairline">
                {cat.items.map((item, idx) => (
                  <FaqItem key={idx} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen((v) => !v)}
      className="w-full text-left p-5 hover:bg-secondary/40 transition-colors"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="font-medium">{q}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      {open && <p className="mt-3 text-sm text-muted-foreground">{a}</p>}
    </button>
  );
}
