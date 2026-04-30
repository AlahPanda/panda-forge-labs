import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

type Download = { label: string; url: string };

function pick(dls: Download[], pred: (d: Download) => boolean) {
  return dls.filter(pred);
}

const win = (d: Download) => /windows/i.test(d.label);
const mac = (d: Download) => /macos|mac\b/i.test(d.label);
const linux = (d: Download) => /linux/i.test(d.label);

export default function AstralDownloadGrid({ downloads }: { downloads: Download[] }) {
  const windows = pick(downloads, win);
  const macos = pick(downloads, mac);
  const linuxRows = pick(downloads, linux);

  const Tile = ({
    title,
    subtitle,
    items,
    accent,
  }: {
    title: string;
    subtitle: string;
    items: Download[];
    accent: 'amber' | 'sky' | 'violet';
  }) => {
    const ring =
      accent === 'amber'
        ? 'border-orange-400/30 bg-orange-500/[0.06]'
        : accent === 'sky'
          ? 'border-sky-400/25 bg-sky-500/[0.05]'
          : 'border-violet-400/25 bg-violet-500/[0.06]';
    return (
      <div className={cn('rounded-2xl border p-5 flex flex-col gap-3', ring)}>
        <div>
          <div className="label-mono text-[10px] opacity-80">{subtitle}</div>
          <h3 className="mt-1 text-lg font-semibold tracking-tight">{title}</h3>
        </div>
        <div className="space-y-2">
          {items.map((d) => (
            <a
              key={d.url + d.label}
              href={d.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center justify-between gap-3 rounded-xl border border-hairline bg-background/60 px-4 py-3',
                'hover:border-signal/45 hover:bg-secondary/40 transition-colors text-left text-sm font-medium',
                'active:scale-[0.99]'
              )}
            >
              <span className="min-w-0 truncate">{d.label}</span>
              <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Tile title="Windows" subtitle="Installer" items={windows} accent="amber" />
      <Tile title="macOS" subtitle="Apple Silicon" items={macos} accent="sky" />
      <Tile title="Linux" subtitle="DEB · RPM · AppImage" items={linuxRows} accent="violet" />
    </div>
  );
}
