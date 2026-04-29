import type { LauncherFeatureRow } from '@/lib/launchers';

const ROWS: Array<{ key: keyof LauncherFeatureRow; label: string }> = [
  { key: 'platforms', label: 'Windows/macOS/Linux Support' },
  { key: 'modpackFormats', label: 'Modpack Support (.mrpack / CurseForge)' },
  { key: 'perfInstances', label: 'Performance Friendly / Multiple Instances' },
  { key: 'authOffline', label: 'Official Microsoft Login / Offline Mode' },
  { key: 'openSafe', label: 'Open Source / Safe Reputation' },
  { key: 'beginnerAdvanced', label: 'Beginner Friendly / Advanced Controls' },
];

export default function LauncherFeaturesTable({ features }: { features: LauncherFeatureRow }) {
  return (
    <div className="mt-5 border border-hairline rounded-md overflow-hidden">
      <div className="px-4 py-2 bg-elev border-b border-hairline">
        <div className="label-mono">Core Features</div>
      </div>
      <table className="w-full text-sm">
        <tbody className="divide-y divide-hairline">
          {ROWS.map((r) => (
            <tr key={r.key}>
              <th scope="row" className="px-4 py-3 text-left font-normal text-foreground/90 align-middle max-w-[min(100%,20rem)]">
                {r.label}
              </th>
              <td className="px-4 py-3 text-right font-mono text-base w-14 align-middle" aria-label={`${r.label}: ${features[r.key]}`}>
                {features[r.key]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-4 py-2 text-[11px] text-muted-foreground border-t border-hairline bg-background/40">
        ✔️ strong · ⚠️ mixed / situational · ✖️ weaker for this criterion
      </p>
    </div>
  );
}
