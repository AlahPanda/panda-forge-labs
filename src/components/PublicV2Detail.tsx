import { Link } from 'react-router-dom';
import Seo from '@/components/Seo';
import RichMarkdown from '@/components/RichMarkdown';
import type { ProjectV2, LauncherV2, ArticleV2 } from '@/content/v2/schema';
import { publicReleasesFor } from '@/content/publicResolver';

export default function PublicV2Detail({ item, section }: { item: ProjectV2 | LauncherV2 | ArticleV2; section: 'modpacks' | 'launchers' | 'news' }) {
  const project = section === 'modpacks' ? item as ProjectV2 : undefined;
  const label = project ? project.status === 'internal-prototype' ? 'In Development' : project.status === 'beta' ? 'Beta' : project.status : section === 'news' ? 'News' : 'Launcher';
  const image = 'media' in item ? item.media?.find((medium) => medium.kind === 'image') : undefined;
  const teaser = project?.status === 'internal-prototype';
  const article = section === 'news' ? item as ArticleV2 : undefined;
  const launcher = section === 'launchers' ? item as LauncherV2 : undefined;
  return <>
    <Seo title={`${item.seo?.title || item.name} — AlahPanda Labs`} description={item.seo?.description || item.summary || `${item.name} — ${label}`} image={item.seo?.image || image?.url} />
    <article className="container max-w-3xl py-16">
      <Link to={`/${section}`} className="text-sm text-muted-foreground hover:text-signal">← Back</Link>
      <div className="label-mono mt-10">{label}</div>
      <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">{item.name}</h1>
      {item.summary && <p className="mt-4 text-xl text-muted-foreground">{item.summary}</p>}
      {image && <img src={image.url} alt={image.alt || item.name} className="w-full rounded-lg mt-8" />}
      {!teaser && item.description && <div className="mt-10"><RichMarkdown markdown={item.description} /></div>}
      {project && !teaser && publicReleasesFor(project).map((release) => <section key={release.slug} className="mt-10 border border-hairline rounded-lg p-5 space-y-3">
        <h2 className="text-xl font-semibold">{release.name}</h2>
        <p className="label-mono">{release.channel} · {release.version}</p>
        {project.compatibility && <p className="text-sm text-muted-foreground">{[...(project.compatibility.minecraft || []), ...(project.compatibility.loaders || []), ...(project.compatibility.platforms || [])].join(' · ')}</p>}
        {release.changelog && <RichMarkdown markdown={release.changelog} />}
        {release.distribution?.filter((provider) => provider.state === 'active' && provider.url).map((provider) => <a key={provider.provider} href={provider.url} target="_blank" rel="noopener noreferrer" className="block text-signal underline">View official release on {provider.provider}</a>)}
      </section>)}
      {article && <div className="mt-10"><RichMarkdown markdown={article.body} /></div>}
      {launcher?.officialLinks?.length ? <div className="mt-10 space-y-2">{launcher.officialLinks.map((link) => <a key={link.url} href={link.url} rel="noopener noreferrer" target="_blank" className="block text-signal underline">{link.label}</a>)}</div> : null}
    </article>
  </>;
}
