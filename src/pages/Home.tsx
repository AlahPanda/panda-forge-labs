import { Link } from 'react-router-dom';
import SiteLayout from '@/components/layout/SiteLayout';
import Seo from '@/components/Seo';
import ModpackCard from '@/components/ModpackCard';
import NewsCard from '@/components/NewsCard';
import { site } from '@/content';
import { useI18n } from '@/lib/i18n';
import { ArrowRight, Activity, Boxes, Users, Rocket } from 'lucide-react';
import logo from '@/assets/logo.png';
import AdSlot from '@/components/AdSlot';
import { publicHomepage, publicFeaturedProjects, publicFeaturedArticles, publicSiteDescription } from '@/content/publicResolver';
import { PublicV2Card } from '@/components/PublicV2Card';

export default function Home() {
  const { t } = useI18n();
  const config = publicHomepage();
  const modpacks = publicFeaturedProjects();
  const articles = publicFeaturedArticles().slice(0, 3);

  return (
    <SiteLayout>
      <Seo
        title="AlahPanda Labs — Premium Minecraft Modpacks"
        description={publicSiteDescription()}
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
              <span>{config?.hero?.eyebrow || t('home.eyebrow')}</span>
              <span className="hairline border-t w-12" />
            </div>

            <h1 className="mt-6 text-5xl md:text-7xl font-semibold tracking-tight leading-[1.02] reveal">
              {config?.hero?.title ? <span className="block">{config.hero.title}</span> : <><span className="block">{t('home.heroLineA')}</span><span className="block text-signal">{t('home.heroLineB')}</span></>}
            </h1>

            <p className="mt-6 max-w-xl text-base md:text-lg text-muted-foreground reveal">
              {config?.hero?.subtitle || t('home.heroSub')}
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

      {config?.notices?.filter((notice) => notice.visible).map((notice) => <div key={notice.id} className="border-b border-hairline bg-elev/40"><div className="container py-4 text-sm">{notice.link ? <a href={notice.link} target="_blank" rel="noopener noreferrer" className="text-signal underline">{notice.text}</a> : notice.text}</div></div>)}

      {/* AD SLOT — below hero */}
      <section className="border-b border-hairline">
        <div className="container py-8">
          <AdSlot format="banner" label="Sponsored" />
        </div>
      </section>

      {config?.sections?.find((section) => section.id === 'metrics')?.visible !== false && <section className="border-b border-hairline">
        <div className="container py-10">
          <div className="label-mono mb-6 reveal">{t('home.metrics')}</div>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-hairline border border-hairline rounded-lg overflow-hidden">
            <Metric icon={<Activity className="h-4 w-4" />} value={site.stats.downloads} label={t('metrics.downloads')} />
            <Metric icon={<Boxes className="h-4 w-4" />} value={site.stats.modpacks} label={t('metrics.modpacks')} />
            <Metric icon={<Users className="h-4 w-4" />} value={site.stats.members} label={t('metrics.members')} />
            <Metric icon={<Rocket className="h-4 w-4" />} value={site.stats.buildsShipped} label={t('metrics.builds')} />
          </div>
        </div>
      </section>}

      {/* FEATURED MODPACKS */}
      {config?.sections?.find((section) => section.id === 'featured-projects')?.visible !== false && <section className="border-b border-hairline">
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
            {modpacks.map((m, i) => m.source === 'v2' ? <PublicV2Card key={m.slug} item={m.item} section="modpacks" /> : <ModpackCard key={m.slug} modpack={m.item} index={i} />)}
          </div>
        </div>
      </section>}

      {/* LATEST NEWS */}
      {config?.sections?.find((section) => section.id === 'latest-news')?.visible !== false && <section>
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
            {articles.map((a, i) => a.source === 'v2' ? <PublicV2Card key={a.slug} item={a.item} section="news" /> : <NewsCard key={a.slug} article={a.item} index={i} />)}
          </div>
        </div>
      </section>}
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
