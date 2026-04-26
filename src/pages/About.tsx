import SiteLayout from '@/components/layout/SiteLayout';
import Seo from '@/components/Seo';
import { site } from '@/content';

export default function About() {
  return (
    <SiteLayout>
      <Seo title="About — AlahPanda Labs" description="The story and engineering principles behind AlahPanda Labs." />
      <section className="container max-w-3xl py-16">
        <div className="label-mono reveal">05 — About</div>
        <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight reveal">A small lab. Sharp tools.</h1>
        <p className="mt-6 text-lg text-muted-foreground reveal">
          {site.description}
        </p>

        <div className="mt-12 space-y-8 reveal">
          <Section title="Principles">
            We pin every dependency. We profile before shipping. We document the why, not just the what.
            Every modpack is a measurement, not a guess.
          </Section>
          <Section title="Stack">
            Curated mod set · lockfile-driven builds · benchmark suite · multi-mirror distribution.
          </Section>
          <Section title="Get in touch">
            Discord is the fastest way. Email <a className="text-signal hover:underline" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> for partnerships.
          </Section>
        </div>
      </section>
    </SiteLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-signal pl-5">
      <h2 className="font-mono uppercase tracking-[0.2em] text-xs text-signal">{title}</h2>
      <p className="mt-3 text-foreground/85">{children}</p>
    </div>
  );
}
