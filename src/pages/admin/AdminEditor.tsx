import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, BookOpen, Box, ExternalLink, FileText, Globe, HelpCircle, Home, Image, Languages, LayoutDashboard, LogOut, Menu, Newspaper, Rocket, Search, Settings, Sparkles, X } from 'lucide-react';
import Seo from '@/components/Seo';
import { adminApi, adminAuth } from '@/lib/adminApi';
import { useModrinthStats } from '@/lib/modrinthStats';
import { useI18n } from '@/lib/i18n';
import { collectionPath, CONTENT_KINDS, parseCollection, parseItem, type ContentKind, type ValidatedItem } from '@/content/v2/schema';
import { localizationStatus, type LocalizedEntry } from '@/content/v2/localize';
import { BrandSymbol } from '@/components/design-system/BrandSymbol';
import V2Workspace from './V2Workspace';
import { useAdminText, adminText } from './adminText';
import { editorLabel } from './editorLabels';
import './admin.css';

const LegacyArchive = lazy(() => import('./LegacyArchive'));
const AIStudio = lazy(() => import('./AIStudio'));
type Collection = { items: ValidatedItem[]; sha: string };
type DraftInfo = { kind: ContentKind; slug: string; revision: number; updated_at: string };
type Status = Awaited<ReturnType<typeof adminApi.status>>;
const path = '/admin/editor';
const collections: Record<string, ContentKind> = { modpacks: 'projects', launchers: 'launchers', articles: 'articles', guides: 'guides', faq: 'faq', releases: 'releases', homepage: 'homepage', settings: 'settings', navigation: 'settings', seo: 'settings' };
const routeFor = (kind: ContentKind) => ({ projects: 'modpacks', articles: 'articles' } as Partial<Record<ContentKind, string>>)[kind] || kind;
const groups = [
  { title: 'content', links: [['modpacks', Box], ['launchers', Globe], ['articles', Newspaper], ['guides', BookOpen], ['faq', HelpCircle], ['releases', Rocket], ['media', Image]] },
  { title: 'website', links: [['homepage', Home], ['navigation', Menu], ['seo', Search], ['settings', Settings]] },
  { title: 'system', links: [['drafts', FileText], ['deployments', Rocket], ['activity', Activity]] },
] as const;

function useOwnerContent() {
  const [data, setData] = useState<Partial<Record<ContentKind, Collection>>>({});
  const [drafts, setDrafts] = useState<DraftInfo[]>([]);
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = async () => {
    const results = await Promise.allSettled(CONTENT_KINDS.map(async (kind) => {
      const file = await adminApi.read(collectionPath(kind));
      return { kind, items: parseCollection(kind, JSON.parse(file.content)).items, sha: file.sha };
    }));
    const next: Partial<Record<ContentKind, Collection>> = {};
    results.forEach((result) => { if (result.status === 'fulfilled') next[result.value.kind] = result.value; });
    setData(next);
    setError(results.some((result) => result.status === 'rejected') ? 'load-error' : '');
    const [draftResult, statusResult] = await Promise.allSettled([adminApi.draftList(), adminApi.status()]);
    setDrafts(draftResult.status === 'fulfilled' ? draftResult.value.drafts : []);
    setStatus(statusResult.status === 'fulfilled' ? statusResult.value : null);
    if (draftResult.status === 'rejected' || statusResult.status === 'rejected') setError('load-error');
    setLoading(false);
  };
  useEffect(() => { void refresh(); }, []);
  return { data, drafts, status, loading, error, refresh };
}

function Panel({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return <section className={`admin-panel ${className}`}><h2>{title}</h2>{children}</section>;
}

function OwnerDashboard({ owner }: { owner: ReturnType<typeof useOwnerContent> }) {
  const a = useAdminText();
  const { locale } = useI18n();
  const mac = owner.data.projects?.items.find((item) => item.slug === 'mac-native');
  const distribution = (mac?.distribution as Array<{ provider: string; url?: string; state?: string }> | undefined)?.find((item) => item.provider === 'modrinth' && item.state === 'active')?.url;
  const metrics = useModrinthStats(distribution);
  const total = Object.values(owner.data).reduce((count, collection) => count + (collection?.items.length || 0), 0);
  const previewOrigin = import.meta.env.VITE_PREVIEW_ORIGIN;
  const verifiedPreview = typeof previewOrigin === 'string' && previewOrigin === window.location.origin && owner.status?.branch === 'v2/full-redesign';
  const tiles = [
    [a('siteStatus'), a('unknown'), Home], [a('preview'), verifiedPreview ? a('connected') : a('unknown'), ExternalLink],
    [a('lastDeploy'), a('unknown'), Rocket], [a('cmsStatus'), owner.status ? a('connected') : a('unknown'), Activity],
    [a('github'), owner.status?.repo && owner.status?.branch ? a('configured') : a('unknown'), Globe],
    [a('modrinth'), metrics.data ? `${metrics.data.downloads.toLocaleString(locale)} / ${metrics.data.followers.toLocaleString(locale)}` : a('unknown'), Box],
  ] as const;
  const localeTotals = (['pt-PT', 'pt-BR', 'en', 'es'] as const).map((language) => {
    let translated = 0; let fields = 0;
    for (const [kind, collection] of Object.entries(owner.data) as [ContentKind, Collection][]) for (const item of collection.items) {
      const report = localizationStatus(item as LocalizedEntry, kind, language);
      translated += report.translated; fields += report.total;
    }
    return { language, percent: fields ? Math.round(translated / fields * 100) : null };
  });
  const recent = [...owner.drafts].sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 4);
  return <div className="admin-dashboard">
    <div className="admin-page-heading"><div><span className="admin-eyebrow">AlahPanda Labs · CMS V2</span><h1>{a('dashboard')}</h1><p>{a('overview')}</p></div><Link to={`${path}/drafts`} className="admin-button admin-button-secondary">{owner.drafts.length} {a('drafts')}</Link></div>
    <div className="admin-status-grid">{tiles.map(([label, value, Icon]) => <div className="admin-status-card" key={label}><span>{label}</span><strong>{value}</strong><Icon size={21} aria-hidden="true"/></div>)}</div>
    <div className="admin-dashboard-main">
      <Panel title={a('studio')} className="admin-ai-teaser"><Sparkles size={22} aria-hidden="true"/><p>{a('aiUnavailable')}</p><Link className="admin-button admin-button-primary" to={`${path}/ai`}>{a('proposal')}</Link></Panel>
      <Panel title={a('workflow')}><ol className="admin-steps"><li>{a('draft')}</li><li>{a('preview')}</li><li>{a('publish')}</li></ol><p>{a('releaseInfo')}</p><Link to={`${path}/drafts`} className="admin-button admin-button-secondary">{a('drafts')}</Link></Panel>
      <Panel title={a('livePreview')}><p>{verifiedPreview ? a('published') : a('previewUnavailable')}</p>{verifiedPreview && <a className="admin-button admin-button-secondary" href="/" target="_blank" rel="noopener noreferrer">{a('visit')} <ExternalLink size={14}/></a>}</Panel>
    </div>
    <Panel title={a('quick')} className="admin-quick"><div className="admin-quick-grid">{(['articles', 'guides', 'faq', 'modpacks', 'releases', 'settings'] as const).map((key) => <Link to={`${path}/${key}`} key={key}>{a(key)} <span aria-hidden="true">↗</span></Link>)}</div></Panel>
    <div className="admin-dashboard-bottom">
      <Panel title={a('overview')}><p><strong>{total}</strong> {a('counts')}</p><p><strong>{owner.drafts.length}</strong> {a('drafts')}</p><Link to={`${path}/modpacks`}>{a('open')} →</Link></Panel>
      <Panel title={a('translations')}><ul className="admin-locales-list">{localeTotals.map(({language,percent}) => <li key={language}><span>{language}</span><meter min="0" max="100" value={percent ?? 0} aria-label={language} /> <strong>{percent === null ? a('unknown') : `${percent}%`}</strong></li>)}</ul><Link to={`${path}/locales`}>{a('locales')} →</Link></Panel>
      <Panel title={a('activity')}><p>{a('activityEmpty')}</p>{recent.map((draft) => <Link className="admin-activity-row" key={`${draft.kind}/${draft.slug}`} to={`${path}/${routeFor(draft.kind)}?entry=${encodeURIComponent(draft.slug)}`}>{draft.slug} <small>{a('draft')} · r{draft.revision}</small></Link>)}</Panel>
      <Panel title={a('modpacks')}><p>{owner.data.projects?.items.map((item) => item.name).join(' · ') || a('noRecords')}</p><Link to={`${path}/modpacks`}>{a('open')} →</Link></Panel>
    </div>
  </div>;
}

function ModpackOverview({ owner }: { owner: ReturnType<typeof useOwnerContent> }) {
  const a = useAdminText();
  const { locale } = useI18n();
  const projects = owner.data.projects?.items || [];
  const mac = projects.find((item) => item.slug === 'mac-native');
  const distribution = (mac?.distribution as Array<{provider:string;url?:string;state?:string}> | undefined)?.find((link) => link.provider === 'modrinth' && link.state === 'active')?.url;
  const metrics = useModrinthStats(distribution);
  return <Panel title={a('overview')}><div className="admin-table-wrap"><table><thead><tr><th>{a('content')}</th><th>{a('status')}</th><th>{a('releases')}</th><th>{a('modrinth')}</th><th>{a('locales')}</th></tr></thead><tbody>{projects.map((item) => {
    const versions = owner.data.releases?.items.filter((release) => (item.releaseSlugs as string[] | undefined)?.includes(release.slug)).map((release) => release.version).join(', ');
    const coverage = localizationStatus(item as LocalizedEntry,'projects',locale);
    return <tr key={item.slug}><td><Link to={`${path}/modpacks?entry=${encodeURIComponent(item.slug)}`}>{item.name}</Link></td><td><span className="admin-badge">{editorLabel(locale,String(item.status || a('unknown')))}</span></td><td>{versions || '—'}</td><td>{item.slug === 'mac-native' ? metrics.data ? `${metrics.data.downloads.toLocaleString(locale)} ${a('downloads')} · ${metrics.data.followers.toLocaleString(locale)} ${a('followers')}` : a('unknown') : '—'}</td><td>{coverage.percent === null ? a('unavailable') : `${coverage.percent}%`}</td></tr>;
  })}</tbody></table></div>{!projects.length && <p>{a('noRecords')}</p>}</Panel>;
}

function LocalesPage({ owner }: { owner: ReturnType<typeof useOwnerContent> }) {
  const a = useAdminText();
  const [language, setLanguage] = useState<'pt-PT' | 'pt-BR' | 'en' | 'es'>('pt-PT');
  const [filter, setFilter] = useState('all');
  const [privateItems, setPrivateItems] = useState<Array<{kind: ContentKind; item: ValidatedItem}>>([]);
  const [privateError, setPrivateError] = useState(false);
  useEffect(() => {
    let active = true;
    void Promise.allSettled(owner.drafts.map(async ({kind, slug}) => ({kind, item: parseItem(kind, (await adminApi.draftRead(kind, slug)).draft.content)})))
      .then((results) => {
        if (!active) return;
        setPrivateItems(results.filter((row): row is PromiseFulfilledResult<{kind: ContentKind; item: ValidatedItem}> => row.status === 'fulfilled').map((row) => row.value));
        setPrivateError(results.some((row) => row.status === 'rejected'));
      });
    return () => { active = false; };
  }, [owner.drafts]);
  const rows = [
    ...privateItems.map(({kind,item}) => ({kind,item,isDraft:true,...localizationStatus(item as LocalizedEntry, kind, language)})),
    ...(Object.entries(owner.data) as [ContentKind, Collection][]).flatMap(([kind, collection]) => collection.items.map((item) => ({ kind, item, isDraft:false, ...localizationStatus(item as LocalizedEntry, kind, language) }))),
  ];
  const shown = rows.filter((row) => filter === 'all' || row.status === filter);
  return <><div className="admin-page-heading"><div><span className="admin-eyebrow">{a('locales')}</span><h1>{a('locales')}</h1><p>{a('translations')} · {shown.length}/{rows.length}</p></div></div>
    <div className="admin-filter-row"><label>{a('locale')} <select value={language} onChange={(event) => setLanguage(event.target.value as typeof language)}>{['pt-PT','pt-BR','en','es'].map((loc) => <option key={loc}>{loc}</option>)}</select></label><label>{a('filter')} <select value={filter} onChange={(event) => setFilter(event.target.value)}>{['all','original','complete','partial','missing','needs-review','unavailable'].map((value) => <option key={value} value={value}>{value === 'needs-review' ? a('review') : value === 'all' ? a('all') : a(value as 'original'|'complete'|'partial'|'missing'|'unavailable')}</option>)}</select></label></div>
    <Panel title={a('translations')}>{privateError && <p role="alert">{a('loadError')}</p>}<div className="admin-table-wrap"><table><thead><tr><th>{a('content')}</th><th>{a('locale')}</th><th>{a('status')}</th><th>{a('translations')}</th><th/></tr></thead><tbody>{shown.map(({kind,item,isDraft,percent,status}) => <tr key={`${kind}/${item.slug}/${isDraft ? 'draft' : 'published'}`}><td><strong>{item.name}</strong><small>{kind}/{item.slug} · {a(isDraft ? 'draft' : 'alreadyPublished')}</small></td><td>{language}</td><td><span className="admin-badge">{status === 'needs-review' ? a('review') : a(status)}</span></td><td>{percent === null ? a('unavailable') : `${percent}%`}</td><td><Link to={`${path}/${routeFor(kind)}?entry=${encodeURIComponent(item.slug)}&locale=${language}`}>{a('edit')}</Link></td></tr>)}</tbody></table></div>{!shown.length && <p>{a('noRecords')}</p>}</Panel></>;
}

function DraftsPage({ owner }: { owner: ReturnType<typeof useOwnerContent> }) {
  const a = useAdminText();
  return <><div className="admin-page-heading"><div><h1>{a('drafts')}</h1><p>{owner.drafts.length} {a('draft')}</p></div></div><Panel title={a('drafts')}><div className="admin-table-wrap"><table><thead><tr><th>{a('content')}</th><th>{a('status')}</th><th>{a('activity')}</th><th/></tr></thead><tbody>{owner.drafts.map((draft) => <tr key={`${draft.kind}/${draft.slug}`}><td>{draft.kind}/{draft.slug}</td><td><span className="admin-badge">{a('draft')} · r{draft.revision}</span></td><td><time dateTime={draft.updated_at}>{new Date(draft.updated_at).toLocaleString()}</time></td><td><Link to={`${path}/${routeFor(draft.kind)}?entry=${encodeURIComponent(draft.slug)}`}>{a('open')}</Link></td></tr>)}</tbody></table></div>{!owner.drafts.length && <p>{a('noRecords')}</p>}</Panel></>;
}

function SystemPage({ owner, page }: { owner: ReturnType<typeof useOwnerContent>; page: string }) {
  const a = useAdminText();
  return <><div className="admin-page-heading"><div><h1>{a(page === 'activity' ? 'activity' : 'deployments')}</h1></div></div><Panel title={a('status')}><dl className="admin-system-list"><div><dt>Supabase · admin-cms</dt><dd>{owner.status ? a('connected') : a('unknown')}</dd></div><div><dt>GitHub</dt><dd>{owner.status?.repo || a('unknown')} · {owner.status?.branch || a('unknown')}</dd></div><div><dt>{a('drafts')}</dt><dd>{owner.status?.draftStorageConfigured ? a('configured') : a('unknown')}</dd></div><div><dt>Vercel Preview</dt><dd>{a('unknown')}</dd></div><div><dt>{a('lastDeploy')}</dt><dd>{a('unknown')}</dd></div><div><dt>Deploy hook</dt><dd>{owner.status?.deployHookConfigured ? a('configured') : a('unavailable')}</dd></div></dl><p>{a('releaseInfo')}</p></Panel>{page === 'activity' && <Panel title={a('activity')}><p>{a('activityEmpty')}</p></Panel>}</>;
}

function MediaPage({ owner }: { owner: ReturnType<typeof useOwnerContent> }) {
  const a = useAdminText();
  const media = (Object.entries(owner.data) as [ContentKind, Collection][]).flatMap(([kind, collection]) => collection.items.flatMap((item) => (Array.isArray(item.media) ? item.media : []).map((entry) => ({ kind, item, media: entry as { url: string; alt?: string; kind?: string } }))));
  return <><div className="admin-page-heading"><div><h1>{a('media')}</h1><p>{media.length} {a('counts')}</p></div></div><Panel title={a('media')}>{!media.length && <p>{a('noRecords')}</p>}<div className="admin-media-grid">{media.map(({kind,item,media:asset}) => <Link key={`${item.slug}/${asset.url}`} to={`${path}/${routeFor(kind)}?entry=${encodeURIComponent(item.slug)}`}>{asset.kind === 'image' && <img src={asset.url} alt={asset.alt || ''} loading="lazy"/>}<span>{item.name}</span></Link>)}</div></Panel></>;
}

export default function AdminEditor() {
  const { locale, setLocale } = useI18n();
  const a = useAdminText();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobile, setMobile] = useState(() => typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 820px)').matches);
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const owner = useOwnerContent();
  const page = location.pathname.slice(path.length).split('/').filter(Boolean).join('/') || 'dashboard';
  const searchMatches = useMemo(() => search.trim().length < 2 ? [] : (Object.entries(owner.data) as [ContentKind, Collection][]).flatMap(([kind, collection]) => collection.items.filter((item) => (item.name + ' ' + item.slug).toLocaleLowerCase().includes(search.toLocaleLowerCase())).map((item) => ({ kind, item }))).slice(0, 9), [search, owner.data]);
  useEffect(() => { setMenuOpen(false); setSearch(''); }, [page]);
  useEffect(() => { const shortcut = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); searchRef.current?.focus(); } }; document.addEventListener('keydown', shortcut); return () => document.removeEventListener('keydown', shortcut); }, []);
  useEffect(() => { if (!window.matchMedia) return; const mq = window.matchMedia('(max-width: 820px)'); const update = () => setMobile(mq.matches); update(); mq.addEventListener('change', update); return () => mq.removeEventListener('change', update); }, []);
  useEffect(() => { if (!menuOpen || !mobile) return; closeRef.current?.focus(); const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setMenuOpen(false); menuRef.current?.focus(); } }; document.addEventListener('keydown', escape); return () => document.removeEventListener('keydown', escape); }, [menuOpen,mobile]);
  const logout = () => { adminAuth.clear(); navigate('/admin', { replace: true }); };
  const link = (key: string, Icon: typeof Home) => <Link key={key} to={`${path}/${key}`} aria-current={page === key ? 'page' : undefined} className={page === key ? 'admin-nav-active' : ''}><Icon size={17} aria-hidden="true"/>{a(key as Parameters<typeof a>[0])}</Link>;
  const contentPage = () => {
    if (page === 'dashboard') return <OwnerDashboard owner={owner}/>;
    if (page === 'ai') return <Suspense fallback={<p role="status">{a('loading')}</p>}><AIStudio onSaved={owner.refresh}/></Suspense>;
    if (page === 'locales') return <LocalesPage owner={owner}/>;
    if (page === 'drafts') return <DraftsPage owner={owner}/>;
    if (page === 'deployments' || page === 'activity') return <SystemPage owner={owner} page={page}/>;
    if (page === 'media') return <MediaPage owner={owner}/>;
    if (page === 'advanced/legacy') return <>
      <div className="admin-page-heading"><h1>{a('legacy')}</h1><p>{a('legacyWarning')}</p></div>
      <Suspense fallback={<p role="status">{a('loading')}</p>}><LegacyArchive/></Suspense>
    </>;
    if (collections[page]) return <>
      <div className="admin-page-heading"><div><span className="admin-eyebrow">{a('contentVersion')} · {a('published')}</span><h1>{a(page as Parameters<typeof a>[0])}</h1><p>{a('contentReady')}</p></div><Link to={`${path}/locales`} className="admin-button admin-button-secondary">{a('locales')}</Link></div>
      {page === 'modpacks' && <ModpackOverview owner={owner}/>}
      <V2Workspace key={page} kind={collections[page]} onChanged={owner.refresh} publishAllowed={owner.status?.branch === 'v2/full-redesign' && owner.status?.repo === 'AlahPanda/panda-forge-labs'}/>
    </>;
    return <div role="alert">{a('unavailable')} <Link to={path}>{a('dashboard')}</Link></div>;
  };
  return <div className="admin-control"><Seo title={`${a('dashboard')} — AlahPanda Labs`} noindex/><a href="#admin-main" className="sr-only focus:not-sr-only">{a('open')}</a>
    <aside className={`admin-sidebar ${menuOpen ? 'admin-sidebar-open' : ''}`} hidden={mobile && !menuOpen} aria-label={a('ownerTitle')}><div className="admin-brand"><span className="admin-brand-mark" aria-hidden="true"><BrandSymbol/></span><span><strong>AlahPanda Labs</strong><small>{a('ownerTitle')}</small></span><button ref={closeRef} className="admin-close-menu" aria-label={a('closeMenu')} onClick={() => { setMenuOpen(false); menuRef.current?.focus(); }}><X size={20}/></button></div>
      <nav>{link('dashboard', LayoutDashboard)}{link('ai', Sparkles)}{groups.map((group) => <div className="admin-nav-group" key={group.title}><span>{a(group.title)}</span>{group.links.map(([key, Icon]) => link(key, Icon))}</div>)}{link('locales', Languages)}<div className="admin-nav-group"><span>{a('legacy')}</span><Link to={`${path}/advanced/legacy`} aria-current={page === 'advanced/legacy' ? 'page' : undefined}>{a('legacy')}</Link></div></nav>
      <div className="admin-sidebar-foot"><span>{a('drafts')} · {owner.drafts.length}</span><Link to="/">{a('visit')} ↗</Link></div>
    </aside>
    {menuOpen && mobile && <button className="admin-backdrop" aria-label={a('closeMenu')} onClick={() => { setMenuOpen(false); menuRef.current?.focus(); }}/>}
    <div className="admin-workspace"><header className="admin-topbar"><button ref={menuRef} className="admin-menu-button" aria-label={a('openMenu')} aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><Menu size={21}/></button><div className="admin-search-wrap"><Search size={17} aria-hidden="true"/><input ref={searchRef} value={search} onChange={(event) => setSearch(event.target.value)} placeholder={a('search')} aria-label={a('search')}/><kbd>⌘K</kbd>{searchMatches.length > 0 && <div className="admin-search-results">{searchMatches.map(({kind,item}) => <Link key={`${kind}/${item.slug}`} to={`${path}/${routeFor(kind)}?entry=${encodeURIComponent(item.slug)}`}>{item.name} <small>{kind}</small></Link>)}</div>}</div><div className="admin-topbar-actions"><span className="admin-badge">{owner.status ? a('connected') : a('unknown')}</span><select aria-label={a('locale')} value={locale} onChange={(event) => setLocale(event.target.value as typeof locale)}>{['pt-PT','pt-BR','en','es'].map((code) => <option key={code}>{code}</option>)}</select><button onClick={logout} title={a('signout')} aria-label={a('signout')}><LogOut size={18}/></button></div></header>
      <main id="admin-main" className="admin-main">{owner.loading ? <p role="status">{a('loading')}</p> : <>{owner.error && <div role="alert" className="admin-error">{a('loadError')} <button onClick={() => void owner.refresh()}>{a('retry')}</button></div>}
        {contentPage()}</>}
      </main>
    </div>
  </div>;
}
