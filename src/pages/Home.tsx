import { Link } from 'react-router-dom';
import SiteLayout from '@/components/layout/SiteLayout';
import Seo from '@/components/Seo';
import ModpackCard from '@/components/ModpackCard';
import NewsCard from '@/components/NewsCard';
import { featuredModpacks, featuredArticles, site } from '@/content';
import { useI18n } from '@/lib/i18n';
import { ArrowRight, Activity, Boxes, Users, Rocket } from 'lucide-react';
import logo from '@/assets/logo.png';
import AdSlot from '@/components/AdSlot';

export default function Home() {
  const { t } = useI18n();
  const modpacks = featuredModpacks();
  const articles = featuredArticles().slice(0, 3);

  return (
    <SiteLayout>
      <Seo
        title="AlahPanda Labs — Premium Minecraft Modpacks"
        description={site.description}
      />

      {/* HERO — instrument panel */}
      <section className="relative overflow-hidden border-b border-hairline">
        <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(60% 50% at 80% 0%, hsl(var(--signal) / 0.12), transparent 70%)',
          }}
        />

        <div className="container relative py-20 md:py-28 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <div className="flex items-center gap-3 label-mono reveal">
              <span className="signal-dot" />
              <span>{t('home.eyebrow')}</span>
              <span className="hairline border-t w-12" />
            </div>

            <h1 className="mt-6 text-5xl md:text-7xl font-semibold tracking-tight leading-[1.02] reveal">
              <span className="block">{t('home.heroLineA')}</span>
              <span className="block text-signal">{t('home.heroLineB')}</span>
            </h1>

            <p className="mt-6 max-w-xl text-base md:text-lg text-muted-foreground reveal">
              {t('home.heroSub')}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3 reveal">
              <Link
                to="/modpacks"
                className="inline-flex items-center gap-2 px-5 h-11 rounded-md bg-signal text-primary-foreground font-medium hover:bg-signal/90 transition-colors active:scale-[0.97]"
              >
                {t('home.cta.explore')} <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={site.discordUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 h-11 rounded-md border border-hairline bg-background hover:bg-secondary/60 transition-colors active:scale-[0.97]"
              >
                {t('home.cta.discord')}
              </a>
            </div>
          </div>

          <div className="md:col-span-5 reveal">
            <div className="relative aspect-square max-w-md ml-auto">
              <div className="absolute inset-0 rounded-xl border border-hairline bg-elev grid-bg-fine" />
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={logo}
                  alt="AlahPanda Labs"
                  width={280}
                  height={280}
                  className="drop-shadow-[0_24px_60px_hsl(var(--signal)/0.35)]"
                />
              </div>
              {/* Corner ticks */}
              {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
                <span
                  key={c}
                  className={`absolute h-3 w-3 border-signal ${
                    c === 'tl' ? 'top-2 left-2 border-l border-t' :
                    c === 'tr' ? 'top-2 right-2 border-r border-t' :
                    c === 'bl' ? 'bottom-2 left-2 border-l border-b' :
                    'bottom-2 right-2 border-r border-b'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AD SLOT — below hero */}
      <section className="border-b border-hairline">
        <div className="container py-8">
          <AdSlot format="banner" label="Sponsored" />
        </div>
      </section>

      <section className="border-b border-hairline">
        <div className="container py-10">
          <div className="label-mono mb-6 reveal">{t('home.metrics')}</div>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-hairline border border-hairline rounded-lg overflow-hidden">
            <Metric icon={<Activity className="h-4 w-4" />} value={site.stats.downloads} label={t('metrics.downloads')} />
            <Metric icon={<Boxes className="h-4 w-4" />} value={site.stats.modpacks} label={t('metrics.modpacks')} />
            <Metric icon={<Users className="h-4 w-4" />} value={site.stats.members} label={t('metrics.members')} />
            <Metric icon={<Rocket className="h-4 w-4" />} value={site.stats.buildsShipped} label={t('metrics.builds')} />
          </div>
        </div>
      </section>

      {/* FEATURED MODPACKS */}
      <section className="border-b border-hairline">
        <div className="container py-20">
          <div className="flex items-end justify-between mb-10 reveal">
            <div>
              <div className="label-mono">02 — Catalog</div>
              <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">{t('home.featured')}</h2>
            </div>
            <Link to="/modpacks" className="text-sm text-muted-foreground hover:text-signal transition-colors hidden md:inline-flex items-center gap-1.5">
              All modpacks <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {modpacks.map((m, i) => <ModpackCard key={m.slug} modpack={m} index={i} />)}
          </div>
        </div>
      </section>

      {/* LATEST NEWS */}
      <section>
        <div className="container py-20">
          <div className="flex items-end justify-between mb-10 reveal">
            <div>
              <div className="label-mono">03 — Notebook</div>
              <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">{t('home.latest')}</h2>
            </div>
            <Link to="/news" className="text-sm text-muted-foreground hover:text-signal transition-colors hidden md:inline-flex items-center gap-1.5">
              All entries <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {articles.map((a, i) => <NewsCard key={a.slug} article={a} index={i} />)}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Metric({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="p-6 reveal">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="label-mono">{label}</span>
      </div>
      <div className="mt-3 font-mono tabular text-3xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}
