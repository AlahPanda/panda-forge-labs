import SiteLayout from '@/components/layout/SiteLayout';
import Seo from '@/components/Seo';
import { site } from '@/content';
import LauncherCard from '@/components/launchers/LauncherCard';
import AstralDownloadDialog from '@/components/launchers/AstralDownloadDialog';
import { ASTRAL_DOWNLOADS, launchersCatalog } from '@/lib/launchers';

export default function Launchers() {
  return (
    <SiteLayout>
      <Seo
        title="Launchers — AlahPanda Labs"
        description="The best Minecraft launchers — AstralRinth recommended. Compare features and download securely."
      />

      <section className="border-b border-hairline relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(65% 50% at 70% -20%, hsl(var(--signal) / 0.12), transparent 70%)',
          }}
        />

        <div className="container relative py-16">
          <div className="label-mono reveal">08 — Launchers</div>
          <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight reveal">Launchers</h1>
          <p className="mt-5 max-w-2xl text-muted-foreground reveal">
            Pick a launcher that matches how you play. We recommend{' '}
            <span className="text-foreground font-medium">AstralRinth</span> — tuned for clarity, installs on every major
            desktop, and centered in our tooling story.
          </p>

          <div className="mt-10 border border-hairline rounded-lg p-6 bg-elev/80 backdrop-blur-sm reveal">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="label-mono">Quick install · AstralRinth</div>
                <p className="mt-2 text-lg font-semibold tracking-tight">Three steps to start</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <AstralDownloadDialog downloads={ASTRAL_DOWNLOADS} buttonLabel="Download" />
                <a
                  href={site.discordUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center px-4 h-11 rounded-md border border-hairline text-sm hover:bg-secondary/60 transition-colors"
                >
                  Help on Discord
                </a>
              </div>
            </div>

            <ol className="mt-8 grid md:grid-cols-3 gap-4">
              <li className="border border-hairline rounded-md p-4 bg-background/50">
                <div className="label-mono">01</div>
                <p className="mt-2 font-medium">Download</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pick your OS (below) — Windows, macOS ARM, or a Linux package. Links open new tabs via ouo.io.
                </p>
              </li>
              <li className="border border-hairline rounded-md p-4 bg-background/50">
                <div className="label-mono">02</div>
                <p className="mt-2 font-medium">Install &amp; open</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Run the installer or package manager step, trust the binary if prompted, launch AstralRinth.
                </p>
              </li>
              <li className="border border-hairline rounded-md p-4 bg-background/50">
                <div className="label-mono">03</div>
                <p className="mt-2 font-medium">Sign in &amp; create</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Use Microsoft account where required (or offline if your policy allows). Add an instance/modpack profile and go.
                </p>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className="container py-14 pb-24">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {launchersCatalog.map((launcher) => (
            <LauncherCard key={launcher.id} launcher={launcher} />
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
