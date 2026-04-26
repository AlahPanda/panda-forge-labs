import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import SiteLayout from '@/components/layout/SiteLayout';
import Seo from '@/components/Seo';
import { getModpack, site, reviewsFor } from '@/content';
import { useI18n } from '@/lib/i18n';
import { Download, ArrowLeft, ExternalLink, Activity, Sparkles, BookOpen, History, Star } from 'lucide-react';
import DiscordPopup from '@/components/DiscordPopup';
import BenchmarkChart from '@/components/BenchmarkChart';
import FeatureShowcase from '@/components/FeatureShowcase';
import InstallGuide from '@/components/InstallGuide';
import RichMarkdown from '@/components/RichMarkdown';
import TagChip from '@/components/TagChip';
import AdSlot from '@/components/AdSlot';

type TabKey = 'showcase' | 'install' | 'changelog';

export default function ModpackDetail() {
  const { slug } = useParams();
  const { t } = useI18n();
  const modpack = slug ? getModpack(slug) : undefined;
  const [showDownload, setShowDownload] = useState(false);
  const [showDiscord, setShowDiscord] = useState(false);
  const [tab, setTab] = useState<TabKey>('showcase');

  if (!modpack) {
    return (
      <SiteLayout>
        <div className="container py-32 text-center">
          <div className="label-mono">404</div>
          <h1 className="mt-3 text-3xl font-semibold">Modpack not found</h1>
          <Link to="/modpacks" className="mt-6 inline-flex items-center gap-2 text-signal">
            <ArrowLeft className="h-4 w-4" /> Back to catalog
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const handleDownloadClick = (url: string) => {
    window.open(url, '_blank', 'noreferrer');
    setShowDownload(false);
    if (site.popups.discordOnDownload) {
      setTimeout(() => setShowDiscord(true), 600);
    }
  };

  const accent = `hsl(${modpack.accent})`;
  const reviews = reviewsFor(modpack.slug);
  const isPerformance = modpack.layoutType === 'performance';
  const isImmersion = modpack.layoutType === 'immersion';

  const showcaseLabel = isPerformance
    ? 'FPS Benchmarks'
    : isImmersion
    ? 'Feature Showcase'
    : 'Highlights';

  return (
    <SiteLayout>
      <Seo
        title={`${modpack.name} — AlahPanda Labs`}
        description={modpack.summary}
        image={modpack.image}
        type="article"
      />

      <section className="border-b border-hairline relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(50% 60% at 90% 0%, ${accent.replace(')', ' / 0.18)')}, transparent 70%)` }}
        />
        <div className="container relative py-16">
          <Link to="/modpacks" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-signal mb-8">
            <ArrowLeft className="h-3.5 w-3.5" /> All modpacks
          </Link>

          <div className="grid md:grid-cols-12 gap-10 items-end">
            <div className="md:col-span-8">
              <div className="flex items-center gap-2 label-mono reveal">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: accent }} />
                <span>{modpack.loader}</span>
                <span className="hairline border-t w-8" />
                <span className="tabular">v{modpack.version}</span>
                <span className="hairline border-t w-8" />
                <span className="uppercase">{modpack.layoutType}</span>
              </div>
              <h1 className="mt-5 text-5xl md:text-7xl font-semibold tracking-tight reveal">{modpack.name}</h1>
              <p className="mt-3 text-xl text-muted-foreground reveal">{modpack.tagline}</p>
              <div className="mt-6 max-w-2xl reveal">
                <RichMarkdown markdown={modpack.description} />
              </div>

              <div className="mt-8 flex flex-wrap gap-2 reveal">
                {modpack.tags.map((tag) => (
                  <TagChip key={tag} label={tag} size="sm" />
                ))}
              </div>
            </div>

            <div className="md:col-span-4 reveal">
              <button
                onClick={() => setShowDownload(true)}
                className="group w-full glass-card rounded-lg p-6 text-left hover:shadow-[0_32px_64px_-32px_hsl(var(--signal)/0.4)] transition-shadow active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <div className="label-mono">{t('modpack.download')}</div>
                  <Download className="h-4 w-4 text-signal" />
                </div>
                <div className="mt-3 text-2xl font-semibold tracking-tight">Get {modpack.name}</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  4 mirrors · <span className="font-mono tabular">{modpack.specs.size}</span>
                </div>
                <div className="mt-5 inline-flex items-center gap-1.5 text-signal text-sm font-medium">
                  Choose source <ExternalLink className="h-3.5 w-3.5" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SPECS */}
      <section className="border-b border-hairline">
        <div className="container py-14">
          <div className="label-mono reveal">{t('modpack.specs')}</div>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 border border-hairline rounded-lg divide-x divide-hairline overflow-hidden">
            <Spec label="Min RAM" value={modpack.specs.minRam} />
            <Spec label="Recommended" value={modpack.specs.recommendedRam} />
            <Spec label="Java" value={modpack.specs.javaVersion} />
            <Spec label="Mods" value={modpack.modCount.toString()} />
          </div>
        </div>
      </section>

      {/* CONTENT + SIDEBAR (with ad) */}
      <section className="border-b border-hairline">
        <div className="container py-14 grid lg:grid-cols-[1fr_300px] gap-10">
          <div>
            {/* Tabs */}
            <div role="tablist" className="flex gap-1 border border-hairline rounded-md p-1 bg-elev w-fit">
              <TabBtn active={tab === 'showcase'} onClick={() => setTab('showcase')} icon={isImmersion ? <Sparkles className="h-3.5 w-3.5" /> : <Activity className="h-3.5 w-3.5" />}>
                {showcaseLabel}
              </TabBtn>
              <TabBtn active={tab === 'install'} onClick={() => setTab('install')} icon={<BookOpen className="h-3.5 w-3.5" />}>
                Install Guide
              </TabBtn>
              <TabBtn active={tab === 'changelog'} onClick={() => setTab('changelog')} icon={<History className="h-3.5 w-3.5" />}>
                Changelog
              </TabBtn>
            </div>

            <div className="mt-6">
              {tab === 'showcase' && (
                <div>
                  {isImmersion ? (
                    <FeatureShowcase features={modpack.features} />
                  ) : (
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight mb-2">
                        Single-machine FPS · Vanilla vs Performance King vs {modpack.name}
                      </h2>
                      <p className="text-sm text-muted-foreground mb-5">
                        Same hardware, same world seed, same render distance. Higher is better.
                      </p>
                      <BenchmarkChart data={modpack.benchmarks} modpackName={modpack.name} />
                    </div>
                  )}
                </div>
              )}

              {tab === 'install' && <InstallGuide markdown={modpack.installGuide} />}

              {tab === 'changelog' && (
                <div className="space-y-4">
                  {modpack.changelog.map((c) => (
                    <div key={c.version} className="border border-hairline rounded-lg p-5">
                      <div className="flex items-center gap-3">
                        <span className="font-mono tabular text-signal">v{c.version}</span>
                        <span className="hairline border-t flex-1" />
                        <time className="font-mono text-xs text-muted-foreground tabular">{c.date}</time>
                      </div>
                      <p className="mt-3 text-sm text-foreground/80">{c.notes}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="mt-12">
                <div className="label-mono mb-4">Reviews</div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="border border-hairline rounded-lg p-5 bg-elev">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{r.author}</span>
                        <span className="inline-flex items-center gap-1 text-signal font-mono text-xs tabular">
                          <Star className="h-3 w-3 fill-current" /> {r.rating.toFixed(1)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-foreground/80">{r.body}</p>
                      <time className="mt-3 block font-mono text-[11px] text-muted-foreground tabular">{r.publishedAt}</time>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <AdSlot format="sidebar" label="Sponsored" />
            {site.ads.showSupportButton && (
              <a
                href={site.supportUrl}
                target="_blank"
                rel="noreferrer"
                className="block border border-hairline rounded-lg p-5 bg-elev hover:border-signal/60 transition-colors"
              >
                <div className="label-mono">Support the lab</div>
                <div className="mt-2 text-base font-semibold">Buy us a coffee on Ko-fi ☕</div>
                <div className="mt-2 text-xs text-muted-foreground">Keeps the modpacks free, ad-light, and frequently updated.</div>
              </a>
            )}
          </aside>
        </div>
      </section>

      {/* DOWNLOAD MODAL */}
      {showDownload && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowDownload(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md glass-card rounded-lg p-6 animate-in zoom-in-95"
          >
            <div className="label-mono">{t('modpack.choose')}</div>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">{modpack.name} <span className="text-signal font-mono text-base">v{modpack.version}</span></h3>
            <div className="mt-6 space-y-2">
              {Object.entries(modpack.downloadLinks)
                .filter(([, url]) => !!url)
                .map(([source, url]) => (
                  <button
                    key={source}
                    onClick={() => handleDownloadClick(url!)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-md border border-hairline hover:border-signal hover:bg-secondary/40 transition-colors text-left active:scale-[0.99]"
                  >
                    <span className="font-medium capitalize">{source}</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      <DiscordPopup open={showDiscord} onClose={() => setShowDiscord(false)} />
    </SiteLayout>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 h-8 rounded text-xs font-medium tracking-wide transition-colors active:scale-[0.97] ${
        active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-5">
      <div className="label-mono">{label}</div>
      <div className="mt-2 font-mono tabular text-lg font-semibold">{value}</div>
    </div>
  );
}
