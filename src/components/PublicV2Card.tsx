import { Link } from 'react-router-dom';
import type { ProjectV2, LauncherV2, ArticleV2 } from '@/content/v2/schema';

export function PublicV2Card({ item, section }: { item: ProjectV2 | LauncherV2 | ArticleV2; section: 'modpacks' | 'launchers' | 'news' }) {
  const project = section === 'modpacks' ? item as ProjectV2 : undefined;
  const label = project ? project.status === 'internal-prototype' ? 'In Development' : project.status === 'beta' ? 'Beta' : project.status : section === 'news' ? 'News' : 'Launcher';
  const image = 'media' in item ? item.media?.find((medium) => medium.kind === 'image') : undefined;
  return <Link to={`/${section}/${item.slug}`} className="group glass-card rounded-lg p-5 block hover:border-signal/40 transition-colors">
    {image && <img src={image.url} alt={image.alt || item.name} className="w-full aspect-video object-cover rounded-md mb-5" />}
    <div className="label-mono">{label}</div>
    <h2 className="mt-2 text-xl font-semibold tracking-tight">{item.name}</h2>
    {item.summary && <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{item.summary}</p>}
  </Link>;
}
