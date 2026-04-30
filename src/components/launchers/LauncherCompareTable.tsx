import type { LauncherFeatureRow } from '@/lib/launchers';
import { LAUNCHER_FEATURE_ROWS } from '@/lib/launcherFeatureMeta';

interface Props {
  nameA: string;
  featuresA: LauncherFeatureRow;
  nameB: string;
  featuresB: LauncherFeatureRow;
}

export default function LauncherCompareTable({ nameA, featuresA, nameB, featuresB }: Props) {
  return (
    <div className="mt-6 border border-hairline rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-elev border-b border-hairline">
        <div className="label-mono">Comparative matrix</div>
        <p className="mt-1 text-xs text-muted-foreground">Same legend as the solo table: ✔ strong · ⚠ situational · ✖ weakest.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[32rem]">
          <thead>
            <tr className="border-b border-hairline bg-background/50">
              <th scope="col" className="px-4 py-3 text-left font-medium text-muted-foreground">
                Capability
              </th>
              <th scope="col" className="px-4 py-3 text-center font-semibold w-28 text-signal/95">
                {nameA}
              </th>
              <th scope="col" className="px-4 py-3 text-center font-semibold w-28">
                {nameB}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {LAUNCHER_FEATURE_ROWS.map((r) => (
              <tr key={r.key}>
                <th scope="row" className="px-4 py-3 text-left font-normal text-foreground/90 max-w-xs">
                  {r.label}
                </th>
                <td className="px-4 py-3 text-center font-mono text-base bg-signal/[0.04]">{featuresA[r.key]}</td>
                <td className="px-4 py-3 text-center font-mono text-base">{featuresB[r.key]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
