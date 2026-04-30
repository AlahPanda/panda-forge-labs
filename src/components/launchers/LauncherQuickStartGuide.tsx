import { useState } from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    title: 'Download the right package',
    body: 'Pick Windows, macOS (ARM), or your Linux format (DEB, RPM, AppImage). Links resolve via ouo.io for our download accounting — each still opens your chosen installer in a new tab.',
  },
  {
    title: 'Install & sign in with Microsoft',
    body: 'Run the installer, then authenticate with your Microsoft account linked to Minecraft. This matches modern Mojang defaults and keeps sessions refreshable.',
  },
  {
    title: 'Create or import an instance',
    body: 'Create a blank profile or import a `.mrpack` / supported manifest. Pin Java per instance if you run multiple loader channels (Fabric / NeoForge).',
  },
  {
    title: 'Tune RAM, then Play',
    body: 'Use the recommended memory badge when a pack publishes one — oversized heaps often hurt GC pause times more than they help FPS.',
  },
];

export default function LauncherQuickStartGuide() {
  const [open, setOpen] = useState(0);

  return (
    <div className="rounded-2xl border border-hairline bg-gradient-to-br from-elev/80 via-background to-background overflow-hidden">
      <div className="px-6 pt-6 pb-2 border-b border-hairline/80 bg-elev/40">
        <div className="label-mono">Quick start</div>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">Interactive first-run path</h2>
        <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
          Tap a step to expand. Designed for players who want a checklist, not a wall of prose.
        </p>
      </div>

      <ol className="divide-y divide-hairline">
        {STEPS.map((step, i) => {
          const active = open === i;
          return (
            <li key={step.title}>
              <button
                type="button"
                onClick={() => setOpen(active ? -1 : i)}
                className={cn(
                  'w-full text-left px-6 py-4 flex items-start gap-4 transition-colors',
                  active ? 'bg-signal/[0.06]' : 'hover:bg-secondary/30'
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-mono',
                    active ? 'border-signal/50 bg-signal/15 text-signal' : 'border-hairline text-muted-foreground'
                  )}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[15px]">{step.title}</span>
                    <ChevronRight
                      className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', active && 'rotate-90')}
                      aria-hidden
                    />
                  </span>
                  {active && (
                    <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed pr-6">{step.body}</p>
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-signal/90">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                        <span>
                          Step {i + 1} of {STEPS.length}
                        </span>
                      </div>
                    </div>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
