import type { ProjectV2 } from '@/content/v2/schema';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

type ProjectStatus = ProjectV2['status'];

const publicStatus: Record<ProjectStatus, { labelKey: string; color: string }> = {
  'internal-prototype': { labelKey: 'project.inDevelopment', color: 'text-status-development' },
  development: { labelKey: 'project.inDevelopment', color: 'text-status-development' },
  alpha: { labelKey: 'status.alpha', color: 'text-status-beta' },
  beta: { labelKey: 'status.beta', color: 'text-status-beta' },
  stable: { labelKey: 'status.stable', color: 'text-status-stable' },
  archived: { labelKey: 'status.archived', color: 'text-status-archived' },
};

export function ProjectStatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  const { t } = useI18n();
  const { labelKey, color } = publicStatus[status];
  return <span className={cn('inline-flex items-center gap-2 rounded-full border border-hairline bg-card px-2.5 py-1 text-xs font-medium', color, className)}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />{t(labelKey)}
  </span>;
}
