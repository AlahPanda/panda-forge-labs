import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import RichMarkdown from '@/components/RichMarkdown';
import { adminApi } from '@/lib/adminApi';
import { collectionPath, parseCollection, parseItem, type ContentKind } from '@/content/v2/schema';
import { localizeItem, localizationStatus, type LocalizedEntry } from '@/content/v2/localize';
import type { Locale } from '@/content';
import { useAdminText } from './adminText';
import { useI18n } from '@/lib/i18n';
import { editorLabel } from './editorLabels';
import { ownerError } from './adminErrors';
import { rememberPreviewCommit } from '@/lib/previewDeployment';

type Entry = Record<string, unknown>;
type DraftInfo = { kind: ContentKind; slug: string; revision: number; updated_at: string };
const fieldClass = 'w-full h-10 px-3 rounded-md border border-hairline bg-background text-sm';
const areaClass = 'w-full px-3 py-2 rounded-md border border-hairline bg-background text-sm';
const value = (entry: Entry, key: string) => typeof entry[key] === 'string' ? entry[key] as string : '';
const strings = (entry: Entry, key: string) => Array.isArray(entry[key]) ? entry[key] as string[] : [];
const records = (entry: Entry, key: string) => Array.isArray(entry[key]) ? entry[key] as Entry[] : [];

function fresh(kind: ContentKind): Entry {
  const base: Entry = { slug: '', name: '', sourceLocale: 'pt-PT', translations: {} };
  if (kind === 'projects') return { ...base, status: 'development', releaseSlugs: [] };
  if (kind === 'releases') return { ...base, projectSlug: '', version: '', channel: 'beta' };
  if (kind === 'launchers') return { ...base, platforms: [] };
  if (kind === 'articles' || kind === 'guides') return { ...base, body: '' };
  if (kind === 'faq') return { ...base, items: [] };
  if (kind === 'homepage' || kind === 'settings') return { ...base, slug: kind === 'homepage' ? 'home' : 'site', name: kind === 'homepage' ? 'Homepage' : 'Site Settings' };
  return base;
}
const canonicalPath = (kind: ContentKind, item: Entry) => ({
  projects: `/modpacks/${value(item,'slug')}`, launchers: `/launchers/${value(item,'slug')}`, articles: `/news/${value(item,'slug')}`,
  guides: `/guides/${value(item,'slug')}`, faq: '/faq', homepage: '/', settings: '/', releases: value(item,'projectSlug') ? `/modpacks/${value(item,'projectSlug')}` : '—',
} satisfies Record<ContentKind,string>)[kind];

function Input({ label, value: input, onChange, multiline = false }: { label: string; value: string; onChange: (s: string) => void; multiline?: boolean }) {
  const { locale } = useI18n();
  return <label className="block text-sm space-y-1"><span className="label-mono">{editorLabel(locale, label)}</span>{multiline
    ? <textarea className={areaClass} rows={5} value={input} onChange={(e) => onChange(e.target.value)} />
    : <input className={fieldClass} value={input} onChange={(e) => onChange(e.target.value)} />}</label>;
}
function Select({ label, value: selected, choices, onChange }: { label: string; value: string; choices: string[]; onChange: (s: string) => void }) {
  const { locale } = useI18n();
  return <label className="block text-sm space-y-1"><span className="label-mono">{editorLabel(locale, label)}</span><select className={fieldClass} value={selected} onChange={(e) => onChange(e.target.value)}>
    {choices.map((choice) => <option key={choice} value={choice}>{editorLabel(locale, choice)}</option>)}
  </select></label>;
}
function StringList({ label, values, onChange }: { label: string; values: string[]; onChange: (v: string[]) => void }) {
  const a = useAdminText();
  const { locale } = useI18n();
  return <Input label={`${editorLabel(locale,label)} (${a('perLine')})`} value={values.join('\n')} onChange={(v) => onChange(v.split('\n').map((s) => s.trim()).filter(Boolean))} multiline />;
}
function Rows({ title, items, fields, onChange }: { title: string; items: Entry[]; fields: string[]; onChange: (v: Entry[]) => void }) {
  const a = useAdminText();
  const { locale } = useI18n();
  const emit = (rows: Entry[]) => onChange(rows.map((row) => { if (row.id === '') { const { id: _unused, ...rest } = row; return rest; } return row; }));
  return <fieldset className="border border-hairline rounded-lg p-4 space-y-3"><legend className="label-mono px-1">{editorLabel(locale,title)}</legend>
    {items.map((item, index) => <div key={index} className="border border-hairline p-3 rounded-md grid sm:grid-cols-2 gap-3">
      {fields.map((field) => field === 'visible:boolean' ? <label key={field} className="text-sm flex items-center gap-2"><input type="checkbox" checked={item.visible === true} onChange={(e) => emit(items.map((it, i) => i === index ? { ...it, visible: e.target.checked } : it))} />{a('visible')}</label> : field.includes('|') ? <Select key={field} label={field.split('|')[0]} value={value(item, field.split('|')[0])} choices={field.split('|').slice(1)} onChange={(v) => emit(items.map((it, i) => i === index ? { ...it, [field.split('|')[0]]: v } : it))} />
        : <Input key={field} label={field} value={value(item, field)} onChange={(v) => emit(items.map((it, i) => i === index ? { ...it, [field]: field === 'value' ? Number(v) : v } : it))} />)}
      <button className="text-destructive text-sm text-left" type="button" onClick={() => emit(items.filter((_, i) => i !== index))}>{a('removeRow')}</button>
      <div className="flex gap-2"><button type="button" disabled={index === 0} aria-label={`${a('moveUp')} · ${index + 1}`} onClick={() => { const next = [...items]; [next[index-1],next[index]] = [next[index],next[index-1]]; emit(next); }}>↑ {a('moveUp')}</button><button type="button" disabled={index === items.length - 1} aria-label={`${a('moveDown')} · ${index + 1}`} onClick={() => { const next = [...items]; [next[index+1],next[index]] = [next[index],next[index+1]]; emit(next); }}>↓ {a('moveDown')}</button></div>
    </div>)}
    <button className="text-signal text-sm" type="button" onClick={() => emit([...items, Object.fromEntries(fields.map((field) => [field.split('|')[0].split(':')[0], field === 'value' ? 0 : field === 'visible:boolean' ? false : field.includes('|') ? field.split('|')[1] : '']))])}>+ {a('addRow')}</button>
  </fieldset>;
}

const translatedParts: Record<string, string[]> = { features: ['title', 'description'], requirements: ['title', 'description'], faq: ['question', 'answer'], items: ['question', 'answer'], steps: ['title', 'body'], notices: ['text'], sections: ['title','intro','ctaLabel'], quickLinks: ['label'], navigation: ['label'], footer: ['label'] };
function TranslationEditor({ entry, kind, language, onChange }: { entry: Entry; kind: ContentKind; language: Locale; onChange: (key: string, value: unknown) => void }) {
  const a = useAdminText();
  const all = (entry.translations as Entry) || {};
  const translation = (all[language] as Entry) || {};
  const fields = (translation.fields as Entry) || {};
  const structured = (translation.structured as Entry) || {};
  const changeTranslation = (patch: Entry) => onChange('translations', { ...all, [language]: { ...translation, state: translation.state || 'partial', fields, ...patch } });
  const changeField = (key: string, next: string) => changeTranslation({ fields: { ...fields, [key]: next } });
  const changePart = (part: string, id: string, key: string, next: string) => changeTranslation({ structured: { ...structured, [part]: { ...((structured[part] as Entry) || {}), [id]: { ...((((structured[part] as Entry) || {})[id] as Entry) || {}), [key]: next } } } });
  const baseFields: { key: string; source: string; label: string }[] = [
    { key: 'name', source: value(entry, 'name'), label: a('fieldName') },
    { key: 'summary', source: value(entry, 'summary'), label: a('shortDescription') },
    { key: 'description', source: value(entry, 'description'), label: a('longDescription') },
    { key: 'body', source: value(entry, 'body'), label: 'Body' },
    { key: 'installation', source: value(entry, 'installation'), label: 'Installation' },
    { key: 'changelog', source: value(entry, 'changelog'), label: 'Changelog' },
    { key: 'supportIntro', source: value(entry, 'supportIntro'), label: 'Support intro' },
    { key: 'communityIntro', source: value(entry, 'communityIntro'), label: 'Community intro' },
    { key: 'seoTitle', source: value((entry.seo as Entry) || {}, 'title'), label: 'SEO title' },
    { key: 'seoDescription', source: value((entry.seo as Entry) || {}, 'description'), label: 'SEO description' },
    ...(['eyebrow','title','subtitle'] as const).map((key) => ({ key: `hero${key[0].toUpperCase()}${key.slice(1)}`, source: value((entry.hero as Entry) || {}, key), label: `Hero ${key}` })),
  ];
  const skipProperName = ['projects','releases','launchers','settings'].includes(kind);
  const percent = localizationStatus(entry as LocalizedEntry, kind, language).percent;
  return <div className="admin-translation-editor"><div className="admin-editor-heading"><div><h3>{a('compare')} · {language}</h3><p>{a('translateFields')}</p></div><span className="admin-badge">{percent === null ? a('unavailable') : `${percent}%`}</span></div>
    <Select label={a('translationState')} value={value(translation, 'state') || 'partial'} choices={['partial', 'complete', 'needs-review']} onChange={(next) => changeTranslation({ state: next })}/>
    {baseFields.filter(({key,source}) => source.trim() && !(key === 'name' && skipProperName)).map(({key,source,label}) => <div className="admin-translation-row" key={key}><div><strong>{label}</strong><p>{source}</p></div><Input label={`${label} · ${language}`} value={value(fields, key)} onChange={(next) => changeField(key, next)} multiline={source.length > 180}/></div>)}
    {Object.entries(translatedParts).flatMap(([part, keys]) => records(entry, part).map((row, index) => { const id = value(row, 'id'); return <div className="admin-translation-row" key={`${part}/${id || index}`}><div><strong>{part} · {id || a('missing')}</strong>{keys.map((key) => value(row,key) && <p key={key}>{key}: {value(row,key)}</p>)}</div><div>{id ? keys.filter((key) => value(row,key)).map((key) => <Input key={key} label={`${key} · ${language}`} value={value((((structured[part] as Entry) || {})[id] as Entry) || {}, key)} onChange={(next) => changePart(part,id,key,next)} multiline={value(row,key).length > 180}/>) : <p>{a('stableId')}</p>}</div></div>; }))}
  </div>;
}

type EditorTab = 'mainTab' | 'relationsTab' | 'mediaTab' | 'localizationTab' | 'seoTab' | 'advancedTab';
export default function V2Workspace({ kind, draftsOnly = false, onChanged, publishAllowed = false }: { kind: ContentKind; draftsOnly?: boolean; onChanged?: () => Promise<void>; publishAllowed?: boolean }) {
  const a = useAdminText();
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState<Entry[]>([]);
  const [sha, setSha] = useState('');
  const [drafts, setDrafts] = useState<DraftInfo[]>([]);
  const [entry, setEntry] = useState<Entry | null>(null);
  const [revision, setRevision] = useState<number | null>(null);
  const [baseSha, setBaseSha] = useState('');
  const [saved, setSaved] = useState(false);
  const [slugLocked, setSlugLocked] = useState(false);
  const [preview, setPreview] = useState(false);
  const [previewReviewed, setPreviewReviewed] = useState(false);
  const [tab, setTab] = useState<EditorTab>('mainTab');
  const [selectedLocale, setSelectedLocale] = useState<Locale>('en');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [previewLocale, setPreviewLocale] = useState<Locale>('pt-PT');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const requestedSlug = params.get('entry') || '';
  const requestedLocale = params.get('locale') || '';
  const requestedCreate = params.get('create') === '1';
  const draftForEntry = useMemo(() => drafts.find((draft) => draft.kind === kind && draft.slug === entry?.slug), [drafts, kind, entry]);
  const previewEntry = entry ? localizeItem(entry as Entry & LocalizedEntry, previewLocale, { includeNeedsReview: true }) : null;
  const localeStatus = entry ? localizationStatus(entry as LocalizedEntry, kind, selectedLocale) : null;
  const list = items.filter((item) => (value(item, 'name') + ' ' + value(item, 'slug')).toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  const localDrafts = drafts.filter((draft) => draft.kind === kind && draft.slug.toLocaleLowerCase().includes(search.toLocaleLowerCase()));

  const refresh = async () => {
    const [file, list] = await Promise.all([adminApi.read(collectionPath(kind)), adminApi.draftList()]);
    setItems(parseCollection(kind, JSON.parse(file.content)).items as Entry[]);
    setSha(file.sha);
    setDrafts(list.drafts);
  };
  useEffect(() => {
    let active = true;
    Promise.all([adminApi.read(collectionPath(kind)), adminApi.draftList()]).then(([file, list]) => {
      if (!active) return;
      const published = parseCollection(kind, JSON.parse(file.content)).items as Entry[];
      setItems(published);
      setSha(file.sha); setDrafts(list.drafts); setEntry(null); setRevision(null); setError(''); setPreview(false);
      const draft = list.drafts.find((item) => item.kind === kind && item.slug === requestedSlug);
      if (draft) void adminApi.draftRead(kind, draft.slug).then((result) => {
        if (!active) return;
        setEntry(result.draft.content as Entry); setBaseSha(result.draft.base_sha); setRevision(result.draft.revision); setSaved(true); setSlugLocked(true);
        setPreviewLocale(((result.draft.content as Entry).sourceLocale as Locale) || 'pt-PT'); setPreviewReviewed(false);
      }).catch((err) => { if (active) setError(ownerError(err, a('loadError'))); });
      else if (requestedSlug) {
        const selected = published.find((item) => item.slug === requestedSlug);
        if (selected) { setEntry(structuredClone(selected)); setPreviewLocale((selected.sourceLocale as Locale) || 'pt-PT'); setBaseSha(file.sha); setSaved(false); setPreviewReviewed(false); setSlugLocked(true); }
      }
      else if (requestedCreate) { setEntry(fresh(kind)); setBaseSha(file.sha); setRevision(null); setSaved(false); setPreviewReviewed(false); setSlugLocked(false); setTab('mainTab'); }
      if (requestedLocale && ['pt-PT', 'pt-BR', 'en', 'es'].includes(requestedLocale)) { setSelectedLocale(requestedLocale as Locale); setTab('localizationTab'); }
    }).catch(() => { if (active) setError('load-error'); });
    return () => { active = false; };
  }, [kind, requestedSlug, requestedLocale, requestedCreate]);

  const editPublished = (item: Entry, fileSha = sha) => { setEntry(structuredClone(item)); setPreviewLocale((item.sourceLocale as Locale) || 'pt-PT'); setRevision(null); setBaseSha(fileSha); setSaved(false); setPreview(false); setPreviewReviewed(false); setSlugLocked(true); };
  const editDraft = async (draft: DraftInfo) => {
    setBusy(true);
    try { const result = await adminApi.draftRead(draft.kind, draft.slug); setEntry(result.draft.content as Entry); setPreviewLocale(((result.draft.content as Entry).sourceLocale as Locale) || 'pt-PT'); setBaseSha(result.draft.base_sha); setRevision(result.draft.revision); setSaved(true); setPreview(false); setPreviewReviewed(false); setSlugLocked(true); }
    catch (err) { toast.error(ownerError(err, a('loadError'))); }
    finally { setBusy(false); }
  };
  const change = (key: string, next: unknown) => { setEntry((current) => current ? { ...current, [key]: next } : current); setSaved(false); setPreviewReviewed(false); };
  const save = async () => {
    if (!entry) return;
    setBusy(true);
    try {
      const parsed = parseItem(kind, entry);
      if (draftForEntry && revision === null) throw new Error(a('draftExists'));
      const result = await adminApi.draftSave(kind, parsed.slug, parsed, baseSha, revision);
      setRevision(result.draft.revision); setEntry(result.draft.content as Entry); setSaved(true); setPreview(false); setPreviewReviewed(false); await refresh(); if (requestedCreate) setParams({entry:parsed.slug}); await onChanged?.(); toast.success(a('draftSaved'));
    } catch (err) { toast.error(ownerError(err, a('saveFailed'))); }
    finally { setBusy(false); }
  };
  const publish = async () => {
    if (!entry || revision === null || !saved || !previewReviewed || !publishAllowed) return;
    if (!confirm(`${a('confirmPublish')} ${kind}/${entry.slug}`)) return;
    setBusy(true);
    try { const result = await adminApi.draftPublish(kind, value(entry, 'slug'), revision); if (result.commitSha) rememberPreviewCommit({sha:result.commitSha, url:result.commitUrl, branch:result.branch, kind, slug:value(entry,'slug')}); await refresh(); await onChanged?.(); setEntry(null); setRevision(null); setPreview(false); toast.success(a('committedPreview')); }
    catch (err) { toast.error(ownerError(err, a('publishFailed'))); }
    finally { setBusy(false); }
  };
  const discard = async () => {
    if (!entry || revision === null || !confirm(a('confirmDelete'))) return;
    setBusy(true);
    try { await adminApi.draftDelete(kind, value(entry, 'slug'), revision); await refresh(); await onChanged?.(); setEntry(null); setRevision(null); toast.success(a('discard')); }
    catch (err) { toast.error(ownerError(err, a('deleteFailed'))); }
    finally { setBusy(false); }
  };

  const publishable = !entry || (() => { try { parseCollection(kind, {schemaVersion: 2, items: [entry]}); return true; } catch { return false; } })();
  return <div className="admin-editor-layout">
    <aside className="admin-editor-panel admin-entry-list">
      <div className="admin-entry-list-head"><strong>{kind} · V2</strong>{(!['homepage', 'settings'].includes(kind) || !items.length) && <button className="admin-button admin-button-primary" onClick={() => { setEntry(fresh(kind)); setPreviewLocale('pt-PT'); setRevision(null); setBaseSha(sha); setSaved(false); setPreview(false); setPreviewReviewed(false); setSlugLocked(false); setTab('mainTab'); setParams({create:'1'}); }}>{a('new')}</button>}</div>
      <label className="admin-field">{a('searchItems')}<input value={search} onChange={(event) => setSearch(event.target.value)}/></label>
      <label className="admin-field">{a('filter')}<select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}><option value="all">{a('all')}</option><option value="published">{a('alreadyPublished')}</option><option value="draft">{a('drafts')}</option></select></label>
      {!draftsOnly && filter !== 'draft' && <div><h2>{a('publishedRows')} · {list.length}</h2>{list.map((item) => <button key={value(item, 'slug')} className="admin-entry-row" aria-current={entry?.slug === item.slug && revision === null ? 'true' : undefined} onClick={() => { editPublished(item); setParams({entry:value(item,'slug')}); }}>{value(item, 'name')}<small>{value(item, 'slug')} · {a('alreadyPublished')}</small></button>)}</div>}
      {filter !== 'published' && <div><h2>{a('privateRows')} · {localDrafts.length}</h2>{localDrafts.map((draft) => <button key={`${draft.kind}/${draft.slug}`} className="admin-entry-row" aria-current={entry?.slug === draft.slug && revision !== null ? 'true' : undefined} onClick={() => { void editDraft(draft); setParams({entry:draft.slug}); }}>{draft.slug}<small>{a('draft')} · r{draft.revision} · {new Date(draft.updated_at).toLocaleDateString()}</small></button>)}</div>}
      {!list.length && !localDrafts.length && <p>{a('noRecords')}</p>}
    </aside>
    <section className="admin-editor-panel admin-editor-body">
      {error && <p role="alert" className="text-destructive">{error === 'load-error' ? a('loadError') : error}</p>}
      {!entry && <p>{a('selectEntry')}</p>}
      {entry && <>
        <div className="admin-editor-heading"><div><span className="admin-badge">{revision !== null ? a('draft') : items.some((item) => item.slug === entry.slug) ? a('alreadyPublished') : a('unsavedDraft')}</span><h2>{value(entry, 'name') || a('unsavedDraft')}</h2><small>{kind}/{value(entry, 'slug')} · {saved ? a('saved') : a('unsaved')}</small></div><select aria-label={a('previewLanguage')} value={previewLocale} onChange={(event) => setPreviewLocale(event.target.value as Locale)}>{['pt-PT','pt-BR','en','es'].map((code) => <option key={code}>{code}</option>)}</select></div>
        <div className="admin-action-bar"><ol className="admin-flow"><li>{a('draft')}{saved && revision !== null ? ' ✓' : ''}</li><li>{a('preview')}{previewReviewed ? ' ✓' : ''}</li><li>{a('committedPreview')}</li><li>{a('readyLive')}</li><li>{a('liveProduction')}</li></ol><div><button disabled={busy || !sha} className="admin-button admin-button-primary" onClick={() => void save()}>{a('saveDraft')}</button><button className="admin-button admin-button-secondary" onClick={() => { if (!preview && saved) setPreviewReviewed(true); setPreview((previous) => !previous); }}>{a('preview')}</button><button disabled={busy || !saved || revision === null || !previewReviewed || !publishAllowed || !publishable} title={!publishAllowed ? a('branchMismatch') : !publishable ? a('reviewBeforePublish') : undefined} className="admin-button admin-button-secondary" onClick={() => void publish()}>{a('publish')}</button><button disabled title={a('noProvider')} className="admin-button admin-button-secondary">{a('translateWithAi')}</button><button disabled title={a('noProvider')} className="admin-button admin-button-secondary">{a('improveAction')}</button>{revision !== null && <button disabled={busy} className="admin-button admin-button-secondary" onClick={() => void discard()}>{a('discard')}</button>}</div></div>
        {!publishAllowed && <p className="admin-note">{a('branchMismatch')}</p>}
        {!publishable && <p className="admin-note">{a('reviewBeforePublish')}</p>}
        <div className="admin-tab-bar" role="tablist" aria-label={a('content')}>{(['mainTab','relationsTab','mediaTab','localizationTab','seoTab','advancedTab'] as EditorTab[]).map((choice) => <button type="button" role="tab" key={choice} id={`admin-tab-${choice}`} aria-controls="admin-editor-tab-panel" aria-selected={choice === tab} onClick={() => setTab(choice)}>{a(choice)}</button>)}</div>
        <div id="admin-editor-tab-panel" role="tabpanel" aria-labelledby={`admin-tab-${tab}`} className="admin-tab-panel">
        {tab === 'mainTab' && <div className="admin-form-grid">
        <div className="grid sm:grid-cols-2 gap-4 admin-span-all">
          <Input label={a('fieldName')} value={value(entry, 'name')} onChange={(v) => change('name', v)} />
          <label className="block text-sm space-y-1"><span className="label-mono">{a('slug')}</span><input className={fieldClass} value={value(entry, 'slug')} disabled={slugLocked} onChange={(e) => change('slug', e.target.value)} /></label>
          <Select label={a('source')} value={value(entry, 'sourceLocale')} choices={['pt-PT', 'pt-BR', 'en', 'es']} onChange={(v) => change('sourceLocale', v)} />
          <Input label={a('shortDescription')} value={value(entry, 'summary')} onChange={(v) => change('summary', v)} />
        </div>
        <Input label={a('longDescription')} value={value(entry, 'description')} onChange={(v) => change('description', v)} multiline />
        {(kind === 'projects') && <>
          <Select label="Project status (independent of version)" value={value(entry, 'status')} choices={['internal-prototype', 'development', 'alpha', 'beta', 'stable', 'archived']} onChange={(v) => change('status', v)} />
          <StringList label="Release slugs" values={strings(entry, 'releaseSlugs')} onChange={(v) => change('releaseSlugs', v)} />
          <Input label="Installation" value={value(entry, 'installation')} onChange={(v) => change('installation', v)} multiline />
          <StringList label="Recommendations" values={strings(entry, 'recommendations')} onChange={(v) => change('recommendations', v)} />
          <StringList label="Known issues" values={strings(entry, 'knownIssues')} onChange={(v) => change('knownIssues', v)} />
          {(['minecraft', 'loaders', 'platforms'] as const).map((key) => <StringList key={key} label={`Compatibility: ${key}`} values={strings((entry.compatibility as Entry) || {}, key)} onChange={(v) => change('compatibility', { ...((entry.compatibility as Entry) || {}), [key]: v })} />)}
          <Select label="Environment (optional)" value={value((entry.compatibility as Entry) || {}, 'environment') || 'unspecified'} choices={['unspecified', 'client', 'server', 'both']} onChange={(v) => { const next = { ...((entry.compatibility as Entry) || {}) }; if (v === 'unspecified') delete next.environment; else next.environment = v; change('compatibility', next); }} />
          <Rows title="Distribution providers" items={records(entry, 'distribution')} fields={['provider', 'state|active|paused|outdated', 'priority|primary|secondary', 'url', 'note']} onChange={(v) => change('distribution', v)} />
          <Rows title="Features" items={records(entry, 'features')} fields={['id', 'title', 'description', 'icon']} onChange={(v) => change('features', v)} />
          <Rows title="Requirements" items={records(entry, 'requirements')} fields={['id', 'title', 'description']} onChange={(v) => change('requirements', v)} />
        </>}
        {kind === 'releases' && <><Input label="Project slug" value={value(entry, 'projectSlug')} onChange={(v) => change('projectSlug', v)} /><Input label="Version" value={value(entry, 'version')} onChange={(v) => change('version', v)} /><Select label="Release channel" value={value(entry, 'channel')} choices={['alpha', 'beta', 'stable']} onChange={(v) => change('channel', v)} /><Input label="Release date (ISO 8601; optional)" value={value(entry, 'releasedAt')} onChange={(v) => change('releasedAt', v || undefined)} /><Input label="Changelog" value={value(entry, 'changelog')} onChange={(v) => change('changelog', v)} multiline /><Rows title="Distribution providers" items={records(entry, 'distribution')} fields={['provider', 'state|active|paused|outdated', 'priority|primary|secondary', 'url']} onChange={(v) => change('distribution', v)} /></>}
        {kind === 'releases' && <fieldset className="border border-hairline rounded-lg p-4 space-y-3"><legend>Release compatibility (optional; takes priority over project defaults)</legend>{(['minecraft', 'loaders', 'platforms'] as const).map((key) => <StringList key={key} label={key} values={strings((entry.compatibility as Entry) || {}, key)} onChange={(v) => change('compatibility', { ...((entry.compatibility as Entry) || {}), [key]: v })} />)}<Select label="Environment" value={value((entry.compatibility as Entry) || {}, 'environment') || 'unspecified'} choices={['unspecified', 'client', 'server', 'both']} onChange={(v) => { const next = { ...((entry.compatibility as Entry) || {}) }; if (v === 'unspecified') delete next.environment; else next.environment = v; change('compatibility', next); }} /></fieldset>}
        {kind === 'launchers' && <><StringList label="Platforms" values={strings(entry, 'platforms')} onChange={(v) => change('platforms', v)} /><Select label="Ease of use" value={value(entry, 'easeOfUse') || 'beginner'} choices={['beginner', 'intermediate', 'advanced']} onChange={(v) => change('easeOfUse', v)} /><StringList label="Pros" values={strings(entry, 'pros')} onChange={(v) => change('pros', v)} /><StringList label="Cons" values={strings(entry, 'cons')} onChange={(v) => change('cons', v)} /><Input label="Installation" value={value(entry, 'installation')} onChange={(v) => change('installation', v)} multiline /><StringList label="Recommendations" values={strings(entry, 'recommendations')} onChange={(v) => change('recommendations', v)} /><StringList label="Compatibility" values={strings(entry, 'compatibility')} onChange={(v) => change('compatibility', v)} /><Rows title="Official links" items={records(entry, 'officialLinks')} fields={['label', 'url']} onChange={(v) => change('officialLinks', v)} /><Rows title="Features" items={records(entry, 'features')} fields={['title', 'description']} onChange={(v) => change('features', v)} /></>}
        {(kind === 'articles' || kind === 'guides') && <><Input label="Body (Markdown)" value={value(entry, 'body')} onChange={(v) => change('body', v)} multiline /><Input label="Project slug (optional)" value={value(entry, 'projectSlug')} onChange={(v) => change('projectSlug', v || undefined)} />{kind === 'articles' ? <><Input label="Category" value={value(entry, 'category')} onChange={(v) => change('category', v)} /><Input label="Author" value={value(entry, 'author')} onChange={(v) => change('author', v)} /><Input label="Published date (ISO 8601; optional)" value={value(entry, 'publishedAt')} onChange={(v) => change('publishedAt', v || undefined)} /></> : <><Input label="Launcher slug (optional)" value={value(entry, 'launcherSlug')} onChange={(v) => change('launcherSlug', v || undefined)} /><Input label="Updated date (ISO 8601; optional)" value={value(entry, 'updatedAt')} onChange={(v) => change('updatedAt', v || undefined)} /><Select label="Level" value={value(entry, 'level') || 'beginner'} choices={['beginner', 'technical']} onChange={(v) => change('level', v)} /><Rows title="Steps" items={records(entry, 'steps')} fields={['id', 'title', 'body']} onChange={(v) => change('steps', v)} /></>}</>}
        {kind === 'faq' && <><Input label="Project slug (optional)" value={value(entry, 'projectSlug')} onChange={(v) => change('projectSlug', v || undefined)} /><Rows title="Questions (optional stable id for deep links)" items={records(entry, 'items')} fields={['id', 'question', 'answer']} onChange={(rows) => change('items', rows.map(({ id, ...rest }) => id ? { id, ...rest } : rest))} /></>}
        {kind === 'homepage' && <><Input label="Hero eyebrow" value={value((entry.hero as Entry) || {}, 'eyebrow')} onChange={(v) => change('hero', { ...((entry.hero as Entry) || {}), eyebrow: v })} /><Input label="Hero title" value={value((entry.hero as Entry) || {}, 'title')} onChange={(v) => change('hero', { ...((entry.hero as Entry) || {}), title: v })} /><Input label="Hero subtitle" value={value((entry.hero as Entry) || {}, 'subtitle')} onChange={(v) => change('hero', { ...((entry.hero as Entry) || {}), subtitle: v })} /><Input label="Hero primary project slug" value={value((entry.hero as Entry) || {}, 'primaryProjectSlug')} onChange={(v) => change('hero', { ...((entry.hero as Entry) || {}), primaryProjectSlug: v || undefined })} /><StringList label="Featured project slugs (ordered)" values={strings(entry, 'featuredProjectSlugs')} onChange={(v) => change('featuredProjectSlugs', v)} /><StringList label="Featured article slugs (ordered)" values={strings(entry, 'featuredArticleSlugs')} onChange={(v) => change('featuredArticleSlugs', v)} /><Rows title="Notices" items={records(entry, 'notices')} fields={['id', 'text', 'link', 'visible:boolean']} onChange={(v) => change('notices', v)} /><Rows title="Sections" items={records(entry, 'sections')} fields={['id','visible:boolean','title','intro','ctaLabel']} onChange={(v) => change('sections', v)} /><Rows title="Quick links" items={records(entry,'quickLinks')} fields={['id','label','path']} onChange={(v) => change('quickLinks',v)} /></>}
        {kind === 'settings' && <><Input label="Contact email" value={value(entry, 'contactEmail')} onChange={(v) => change('contactEmail', v)} /><Input label="Support intro" value={value(entry,'supportIntro')} onChange={(v) => change('supportIntro',v)} multiline/><Input label="Community intro" value={value(entry,'communityIntro')} onChange={(v) => change('communityIntro',v)} multiline/></>}
        </div>}
        {tab === 'relationsTab' && <div className="admin-form-grid">
          {kind === 'projects' && <Rows title="Project FAQ" items={records(entry, 'faq')} fields={['id', 'question', 'answer']} onChange={(v) => change('faq', v)} />}
          {kind === 'settings' && <><Rows title="Navigation" items={records(entry, 'navigation')} fields={['id', 'label', 'path']} onChange={(v) => change('navigation', v)} /><Rows title="Footer" items={records(entry, 'footer')} fields={['id', 'label', 'url']} onChange={(v) => change('footer', v)} /></>}
          {kind === 'homepage' && <p>{a('releaseInfo')}</p>}
          {!['projects','settings','homepage'].includes(kind) && <p>{value(entry,'projectSlug') || a('noRecords')}</p>}
        </div>}
        {tab === 'mediaTab' && <div className="admin-form-grid">{(['projects', 'launchers', 'articles', 'guides'] as ContentKind[]).includes(kind) ? <Rows title={a('media')} items={records(entry, 'media')} fields={['url', 'alt', 'caption', 'kind|image|video']} onChange={(v) => change('media', v)} /> : <p>{a('noRecords')}</p>}</div>}
        {tab === 'seoTab' && <fieldset className="border border-hairline rounded-lg p-4 space-y-3"><legend className="label-mono">SEO</legend>
          <p className="admin-note">{a('canonical')}: <code>{canonicalPath(kind,entry)}</code></p>
          <Input label="Meta title" value={value((entry.seo as Entry) || {}, 'title')} onChange={(v) => change('seo', { ...((entry.seo as Entry) || {}), title: v })} />
          <Input label="Meta description" value={value((entry.seo as Entry) || {}, 'description')} onChange={(v) => change('seo', { ...((entry.seo as Entry) || {}), description: v })} />
          <Input label="Social image URL" value={value((entry.seo as Entry) || {}, 'image')} onChange={(v) => change('seo', { ...((entry.seo as Entry) || {}), image: v || undefined })} />
          <label className="admin-field"><input type="checkbox" checked={(entry.seo as Entry)?.noindex === true} onChange={(event) => change('seo', { ...((entry.seo as Entry) || {}), noindex: event.target.checked })}/> noindex</label>
        </fieldset>}
        {tab === 'localizationTab' && <div><label className="admin-field">{a('locale')} <select value={selectedLocale} onChange={(event) => setSelectedLocale(event.target.value as Locale)}>{['pt-PT','pt-BR','en','es'].map((code) => <option key={code}>{code}</option>)}</select></label>{selectedLocale === entry.sourceLocale ? <p>{a('original')} · {selectedLocale}</p> : <TranslationEditor entry={entry} kind={kind} language={selectedLocale} onChange={change}/>}</div>}
        {tab === 'advancedTab' && <div className="admin-form-grid"><p>{kind}/{value(entry, 'slug')} · SHA {baseSha.slice(0,10)} · r{revision ?? 0}</p>{kind === 'projects' && <><Rows title="Benchmarks (with method/source)" items={records(entry, 'benchmarks')} fields={['label', 'value', 'unit', 'methodology', 'source']} onChange={(v) => change('benchmarks', v)} /><Rows title="Roadmap" items={records(entry, 'roadmap')} fields={['title', 'state|planned|in-progress|done']} onChange={(v) => change('roadmap', v)} /></>}</div>}
        </div>
        {!previewReviewed && saved && <p className="admin-note">{a('previewRequired')}</p>}
        {preview && previewEntry && <article className="admin-private-preview" aria-label={a('privatePreview')}><p className="label-mono">{a('privatePreview')} · {kind} · {previewLocale}</p><h3>{value(previewEntry, 'name')}</h3><p>{value(previewEntry, 'summary')}</p><RichMarkdown markdown={value(previewEntry, 'body') || value(previewEntry, 'description')} />{kind === 'faq' && records(previewEntry, 'items').map((item, index) => <div key={value(item,'id') || index}><strong>{value(item,'question')}</strong><RichMarkdown markdown={value(item,'answer')}/></div>)}</article>}
      </>}
    </section>
  </div>;
}
