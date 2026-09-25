import type { ProjectV2 } from '@/content/v2/schema';
import { cn } from '@/lib/utils';

type ProjectStatus = ProjectV2['status'];

const publicStatus: Record<ProjectStatus, { label: string; color: string }> = {
  'internal-prototype': { label: 'In Development', color: 'text-status-development' },
  development: { label: 'In Development', color: 'text-status-development' },
  alpha: { label: 'Alpha', color: 'text-status-beta' },
  beta: { label: 'Beta', color: 'text-status-beta' },
  stable: { label: 'Stable', color: 'text-status-stable' },
  archived: { label: 'Archived', color: 'text-status-archived' },
};

export function ProjectStatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  const { label, color } = publicStatus[status];
  return <span className={cn('inline-flex items-center gap-2 rounded-full border border-hairline bg-card px-2.5 py-1 text-xs font-medium', color, className)}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />{label}
  </span>;
}
