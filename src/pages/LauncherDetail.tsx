import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Seo from '@/components/Seo';
import LauncherFeaturesTable from '@/components/launchers/LauncherFeaturesTable';
import LauncherLogo from '@/components/launchers/LauncherLogo';
import LauncherBackLink from '@/components/launchers/LauncherBackLink';
import AstralDownloadGrid from '@/components/launchers/AstralDownloadGrid';
import LauncherQuickStartGuide from '@/components/launchers/LauncherQuickStartGuide';
import LauncherCompareTable from '@/components/launchers/LauncherCompareTable';
import LauncherGlassDownload from '@/components/launchers/LauncherGlassDownload';
import { getLauncher } from '@/lib/launchers';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LauncherDetail() {
  const { slug } = useParams();
  const launcher = slug ? getLauncher(slug) : undefined;
  const astral = getLauncher('astralrinth');

  if (!launcher) {
    return (
      <>
        <Seo title="Launcher not found — AlahPanda Labs" description="Unknown launcher." />
        <div className="container py-32 text-center">
          <div className="label-mono">404</div>
          <h1 className="mt-3 text-3xl font-semibold">Launcher not found</h1>
          <LauncherBackLink className="mt-8 justify-center" />
        </div>
      </>
    );
  }

  const isAstral = launcher.recommended === true;
  const hue = launcher.accentHue;

  return (
    <>
      <Seo
        title={`${launcher.name} — Launchers · AlahPanda Labs`}
        description={`${launcher.tagline} ${launcher.detailIntro.slice(0, 120)}…`}
        image={launcher.logoUrl}
        type="article"
      />

      {isAstral ? (
        <>
          <section className="border-b border-hairline relative overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-[0.35]" />
            <div
              className="pointer-events-none absolute inset-0 opacity-90"
              style={{
                background: `radial-gradient(65% 50% at 70% 0%, hsla(${hue}, 85%, 58%, 0.22), transparent 70%)`,
              }}
            />
            <div className="container relative py-14 md:py-20">
              <LauncherBackLink className="mb-10" />
              <div className="flex flex-col lg:flex-row lg:items-end gap-10 lg:gap-16">
                <div className="min-w-0 flex-1 space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/40 bg-orange-500/10 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-amber-100">
                    Our pick · Software showcase
                  </div>
                  <div className="flex flex-wrap items-end gap-6">
                    <LauncherLogo launcher={launcher} size={88} />
                    <div>
                      <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">{launcher.name}</h1>
                      <p className="mt-2 text-lg text-muted-foreground max-w-xl">{launcher.tagline}</p>
                    </div>
                  </div>
                  <p className="text-base md:text-lg text-foreground/90 leading-relaxed max-w-2xl border-l-2 border-signal/35 pl-5">
                    {launcher.detailIntro}
                  </p>
                </div>
                <div className="shrink-0 text-right lg:pb-1">
                  <div className="label-mono text-[10px] text-muted-foreground">Distribution</div>
                  <div className="mt-1 text-sm font-medium">Windows · macOS ARM · Linux</div>
                </div>
              </div>
            </div>
          </section>

          {/* Download Matrix movida para cima para impacto imediato */}
          <section className="container py-14 md:py-16 space-y-4">
            <div className="flex items-center gap-3 mb-2">
               <Download className="h-5 w-5 text-signal" />
               <h2 className="text-xl font-semibold tracking-tight">Download matrix</h2>
            </div>
            <AstralDownloadGrid downloads={launcher.downloads} />
          </section>

          <section className="container pb-16 md:pb-20">
            <LauncherQuickStartGuide />
          </section>

          <section className="border-t border-hairline bg-elev/20">
            <div className="container py-14 md:py-16 max-w-3xl">
              <h2 className="text-xl font-semibold tracking-tight">Compatibility snapshot</h2>
              <LauncherFeaturesTable features={launcher.features} />
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="border-b border-hairline relative overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-[0.32]" />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(50% 45% at 90% 0%, hsla(${hue}, 70%, 50%, 0.14), transparent 65%)`,
              }}
            />
            <div className="container relative py-12 md:py-16">
              <LauncherBackLink className="mb-8" />
              <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-12">
                <LauncherLogo launcher={launcher} size={80} />
                <div className="min-w-0 flex-1 space-y-4">
                  <div className="label-mono text-[11px]">Third-party client</div>
                  <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">{launcher.name}</h1>
                  <p className="text-lg text-muted-foreground">{launcher.tagline}</p>
                  
                  {/* Botão de Download principal inserido diretamente no Hero para launchers comuns */}
                  <div className="pt-4">
                    <LauncherGlassDownload launcher={launcher} variant="hero" />
                    <p className="mt-3 text-[12px] text-muted-foreground italic">
                      * Official third-party binaries — check vendor for integrity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="container py-12 md:py-14 max-w-3xl">
            <h2 className="text-lg font-semibold tracking-tight">Technical overview</h2>
            <div className="mt-5 space-y-4 text-sm md:text-[15px] text-muted-foreground leading-relaxed">
              {launcher.detailParagraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </section>

          <section className="container pb-12 max-w-3xl">
            <h2 className="text-lg font-semibold tracking-tight">Feature checklist</h2>
            <LauncherFeaturesTable features={launcher.features} />
          </section>

          {astral && (
            <section className="border-y border-hairline bg-elev/15">
              <div className="container py-12 md:py-14 max-w-4xl">
                <h2 className="text-lg font-semibold tracking-tight">Side-by-side with AstralRinth</h2>
                <LauncherCompareTable
                  nameA={launcher.name}
                  featuresA={launcher.features}
                  nameB="AstralRinth"
                  featuresB={astral.features}
                />
              </div>
            </section>
          )}
        </>
      )}

      {/* Secção de FAQ com animação garantida pelo Accordion do shadcn */}
      <section className="container py-14 pb-24 max-w-3xl">
        <h2 className="text-lg font-semibold tracking-tight">FAQ</h2>
        <p className="mt-2 text-sm text-muted-foreground mb-6">Short answers — expand what applies to you.</p>
        <Accordion type="single" collapsible className="divide-y divide-hairline border border-hairline rounded-xl bg-elev/30 px-2">
          {launcher.faqs.map((faq, idx) => (
            <AccordionItem key={idx} value={`faq-${idx}`} className="border-0">
              <AccordionTrigger className="text-left text-[15px] hover:no-underline py-4 px-2">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="pb-4 px-2 text-muted-foreground leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </>
  );
}
