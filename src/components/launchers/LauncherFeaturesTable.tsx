import type { LauncherFeatureRow } from '@/lib/launchers';
import { LAUNCHER_FEATURE_ROWS } from '@/lib/launcherFeatureMeta';

export default function LauncherFeaturesTable({ features }: { features: LauncherFeatureRow }) {
  return (
    <div className="mt-5 border border-hairline rounded-md overflow-hidden">
      <div className="px-4 py-2 bg-elev border-b border-hairline">
        <div className="label-mono">Core Features</div>
      </div>
      <table className="w-full text-sm">
        <tbody className="divide-y divide-hairline">
          {LAUNCHER_FEATURE_ROWS.map((r) => (
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
