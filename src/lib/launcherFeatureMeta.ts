import type { LauncherFeatureRow } from '@/lib/launchers';

export const LAUNCHER_FEATURE_ROWS: Array<{ key: keyof LauncherFeatureRow; label: string }> = [
  { key: 'platforms', label: 'Windows / macOS / Linux' },
  { key: 'modpackFormats', label: 'Modpack formats (.mrpack / CurseForge)' },
  { key: 'perfInstances', label: 'Performance & multiple instances' },
  { key: 'authOffline', label: 'Microsoft login / offline flexibility' },
  { key: 'openSafe', label: 'Open source / reputation' },
  { key: 'beginnerAdvanced', label: 'Beginner UX / advanced controls' },
];
