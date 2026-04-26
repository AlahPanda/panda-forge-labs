interface Bench {
  label: string;
  vanilla: number;
  /** "Performance King" reference (e.g., Fabulously Optimized) */
  fabulous?: number;
  modded: number;
}

interface Props {
  data: Bench[];
  modpackName?: string;
}

export default function BenchmarkChart({ data, modpackName = 'This Modpack' }: Props) {
  const all = data.flatMap((d) => [d.vanilla, d.fabulous ?? 0, d.modded]);
  const max = Math.max(...all) * 1.1;

  return (
    <div className="border border-hairline rounded-lg p-6 bg-elev">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-6 label-mono">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-muted-foreground/50" /> Vanilla
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-warn" /> Performance King
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-signal" /> {modpackName}
        </span>
      </div>

      <div className="space-y-6">
        {data.map((d) => (
          <div key={d.label} className="reveal">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm">{d.label}</span>
              <span className="label-mono tabular">
                {d.vanilla}
                {d.fabulous !== undefined && <> · <span style={{ color: 'hsl(var(--warn))' }}>{d.fabulous}</span></>}
                {' · '}
                <span className="text-signal">{d.modded}</span>
                {' fps'}
              </span>
            </div>
            <div className="space-y-1.5">
              <Bar value={d.vanilla} max={max} className="bg-muted-foreground/40" />
              {d.fabulous !== undefined && (
                <Bar value={d.fabulous} max={max} style={{ background: 'hsl(var(--warn))' }} />
              )}
              <Bar value={d.modded} max={max} className="bg-signal" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Bar({
  value,
  max,
  className,
  style,
}: {
  value: number;
  max: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const pct = Math.max(2, (value / max) * 100);
  return (
    <div className="h-2 w-full bg-secondary/50 rounded-sm overflow-hidden">
      <div
        className={`h-full ${className ?? ''} rounded-sm transition-[width] duration-700 ease-out`}
        style={{ width: `${pct}%`, ...style }}
      />
    </div>
  );
}
