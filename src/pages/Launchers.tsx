import SiteLayout from '@/components/layout/SiteLayout';
import Seo from '@/components/Seo';
import LauncherListCard from '@/components/launchers/LauncherListCard';
import { launchersForList } from '@/lib/launchers';

export default function Launchers() {
  const items = launchersForList();

  return (
    <SiteLayout>
      <Seo
        title="Launchers — AlahPanda Labs"
        description="Compare Minecraft launchers at a glance. Open any card for downloads, FAQs, and our feature cheat-sheet — AstralRinth stays our recommended default."
      />

      <section className="border-b border-hairline relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(65% 50% at 70% -20%, hsl(var(--signal) / 0.09), transparent 70%)',
          }}
        />

        <div className="container relative py-14 md:py-16">
          <div className="label-mono reveal">08 — Launchers</div>
          <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight reveal">Launchers</h1>

          <p className="mt-5 max-w-2xl text-muted-foreground leading-relaxed reveal">
            Explore launchers side by side — every tile is the same size. Click through for download links tuned to each vendor, FAQs that answer comparisons in plain language,
            and our feature checklist when you cannot decide blindly.
          </p>

          <p className="mt-6 max-w-2xl text-sm text-foreground/80 leading-relaxed reveal border border-hairline/80 rounded-lg px-4 py-3 bg-elev/50">
            <span className="font-medium text-signal">Recommendation:</span> we still prioritize{' '}
            <strong className="text-foreground font-medium">AstralRinth</strong> internally — tutorials, tooling, and support assume that baseline when possible (look for{' '}
            <span className="font-mono text-[11px] text-signal/90">&quot;Our pick&quot;</span> badge).
          </p>
        </div>
      </section>

      <section className="container py-12 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((launcher) => (
            <LauncherListCard key={launcher.id} launcher={launcher} />
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
