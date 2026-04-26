import SiteLayout from '@/components/layout/SiteLayout';
import Seo from '@/components/Seo';
import { site } from '@/content';
import { Coffee, Heart, Server, GitBranch } from 'lucide-react';

export default function Support() {
  return (
    <SiteLayout>
      <Seo
        title="Support AlahPanda Labs — Ko-fi"
        description="Help keep our Minecraft modpacks free, ad-light, and updated. Tip us on Ko-fi."
      />
      <section className="border-b border-hairline relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div className="container relative py-20">
          <div className="label-mono reveal">05 — Support</div>
          <h1 className="mt-3 text-4xl md:text-6xl font-semibold tracking-tight reveal">
            Buy us a coffee. <span className="text-signal">Keep the lab open.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-muted-foreground reveal">
            Every modpack we ship is free. Hosting mirrors, profiling on real hardware, and
            answering Discord tickets isn't. If our work has saved you an evening of debugging,
            consider chipping in.
          </p>

          <a
            href={site.supportUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-2 px-6 h-12 rounded-md bg-signal text-primary-foreground font-medium hover:bg-signal/90 transition-colors active:scale-[0.97] reveal"
          >
            <Coffee className="h-5 w-5" /> Support on Ko-fi
          </a>
        </div>
      </section>

      <section className="container py-16">
        <div className="label-mono reveal">Where it goes</div>
        <div className="mt-6 grid md:grid-cols-3 gap-5">
          <Card icon={<Server className="h-4 w-4 text-signal" />} title="Mirror hosting">
            CDN bandwidth for the .mrpack and .zip mirrors so you don't get rate-limited.
          </Card>
          <Card icon={<GitBranch className="h-4 w-4 text-signal" />} title="Hardware profiling">
            Buying and renting GPUs/Macs to benchmark each release on real silicon.
          </Card>
          <Card icon={<Heart className="h-4 w-4 text-signal" />} title="Coffee & late nights">
            The honest truth — modpack curation is a hobby with a caffeine budget.
          </Card>
        </div>
      </section>
    </SiteLayout>
  );
}

function Card({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-hairline rounded-lg p-6 bg-elev reveal">
      <div className="flex items-center gap-2 label-mono">{icon}<span>{title}</span></div>
      <p className="mt-3 text-sm text-foreground/80">{children}</p>
    </div>
  );
}
