import { useParams, Link } from 'react-router-dom';
import SiteLayout from '@/components/layout/SiteLayout';
import Seo from '@/components/Seo';
import LauncherFeaturesTable from '@/components/launchers/LauncherFeaturesTable';
import { getLauncher } from '@/lib/launchers';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export default function LauncherDetail() {
  const { slug } = useParams();
  const launcher = slug ? getLauncher(slug) : undefined;

  if (!launcher) {
    return (
      <SiteLayout>
        <div className="container py-32 text-center">
          <div className="label-mono">404</div>
          <h1 className="mt-3 text-3xl font-semibold">Launcher not found</h1>
          <Link to="/launchers" className="mt-6 inline-flex items-center gap-2 text-signal">
            <ArrowLeft className="h-4 w-4" /> Back to launchers
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const isAstral = launcher.recommended === true;

  return (
    <SiteLayout>
      <Seo
        title={`${launcher.name} — Launchers · AlahPanda Labs`}
        description={launcher.detailIntro.slice(0, 160)}
        type="article"
      />

      <article className="border-b border-hairline relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-35 pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(55% 45% at 90% -10%, hsl(var(--signal) / 0.08), transparent 70%)',
          }}
        />

        <div className="container max-w-3xl relative py-12 md:py-16">
          <Link to="/launchers" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-signal mb-8">
            <ArrowLeft className="h-3.5 w-3.5" /> All launchers
          </Link>

          <div className="label-mono">08 — Launchers</div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">{launcher.name}</h1>
            {isAstral && (
              <span className="text-[10px] font-mono uppercase tracking-wider text-signal/90 px-2 py-1 rounded border border-signal/30 bg-signal/10">
                Recommended by AlahPanda Labs
              </span>
            )}
          </div>

          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{launcher.detailIntro}</p>

          {launcher.detailParagraphs.map((para, i) => (
            <p key={i} className="mt-5 text-foreground/90 leading-relaxed">
              {para}
            </p>
          ))}
        </div>
      </article>

      <section className="container max-w-3xl py-12">
        <h2 className="text-xl font-semibold tracking-tight">Download</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Each button opens the official grab flow in a new browser tab{' '}
          {isAstral ? '(hosting mirrors via ouo.io).' : '(vendor site).'}
        </p>

        <div className="mt-6 flex flex-col gap-2">
          {launcher.downloads.map((d) => (
            <a
              key={d.url}
              href={d.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between gap-4 px-4 py-3 rounded-md border border-hairline bg-elev/50 hover:border-signal hover:bg-secondary/30 transition-colors"
            >
              <span className="font-medium">{d.label}</span>
              <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            </a>
          ))}
        </div>
      </section>

      <section className="container max-w-3xl pb-12">
        <LauncherFeaturesTable features={launcher.features} />
      </section>

      <section className="container max-w-3xl pb-16">
        <h2 className="text-xl font-semibold tracking-tight">Questions you might ask</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Quick answers to compare this launcher against your expectations — cross-check numbers on the vendor site too.
        </p>
        <ul className="mt-8 space-y-8">
          {launcher.faqs.map((faq, idx) => (
            <li key={idx} className="border-l-2 border-signal/35 pl-5">
              <h3 className="font-medium text-foreground">{faq.q}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
            </li>
          ))}
        </ul>

        {!isAstral && (
          <aside className="mt-12 rounded-lg border border-signal/25 bg-signal/[0.04] p-6">
            <p className="text-sm leading-relaxed text-foreground/90">
              <span className="font-medium text-signal">Our recommendation:</span>{' '}
              for most modded Minecraft workflows we still steer players toward{' '}
              <Link to="/launchers/astralrinth" className="text-signal underline underline-offset-2 hover:no-underline">
                AstralRinth
              </Link>
              — it is the launcher we bake into documentation, support, and tooling.
            </p>
          </aside>
        )}

        {isAstral && (
          <p className="mt-12 text-sm text-muted-foreground">
            Curious how others compare?{' '}
            <Link to="/launchers" className="text-signal hover:underline underline-offset-2">
              Browse the full launcher grid
            </Link>
            .
          </p>
        )}
      </section>
    </SiteLayout>
  );
}
