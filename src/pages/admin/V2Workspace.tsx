import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import RichMarkdown from '@/components/RichMarkdown';
import { adminApi } from '@/lib/adminApi';
import { collectionPath, parseCollection, parseItem, type ContentKind } from '@/content/v2/schema';

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

function Input({ label, value: input, onChange, multiline = false }: { label: string; value: string; onChange: (s: string) => void; multiline?: boolean }) {
  return <label className="block text-sm space-y-1"><span className="label-mono">{label}</span>{multiline
    ? <textarea className={areaClass} rows={5} value={input} onChange={(e) => onChange(e.target.value)} />
    : <input className={fieldClass} value={input} onChange={(e) => onChange(e.target.value)} />}</label>;
}
function Select({ label, value: selected, choices, onChange }: { label: string; value: string; choices: string[]; onChange: (s: string) => void }) {
  return <label className="block text-sm space-y-1"><span className="label-mono">{label}</span><select className={fieldClass} value={selected} onChange={(e) => onChange(e.target.value)}>
    {choices.map((choice) => <option key={choice} value={choice}>{choice}</option>)}
  </select></label>;
}
function StringList({ label, values, onChange }: { label: string; values: string[]; onChange: (v: string[]) => void }) {
  return <Input label={`${label} (one per line)`} value={values.join('\n')} onChange={(v) => onChange(v.split('\n').map((s) => s.trim()).filter(Boolean))} multiline />;
}
function Rows({ title, items, fields, onChange }: { title: string; items: Entry[]; fields: string[]; onChange: (v: Entry[]) => void }) {
  return <fieldset className="border border-hairline rounded-lg p-4 space-y-3"><legend className="label-mono px-1">{title}</legend>
    {items.map((item, index) => <div key={index} className="border border-hairline p-3 rounded-md grid sm:grid-cols-2 gap-3">
      {fields.map((field) => field === 'visible:boolean' ? <label key={field} className="text-sm flex items-center gap-2"><input type="checkbox" checked={item.visible === true} onChange={(e) => onChange(items.map((it, i) => i === index ? { ...it, visible: e.target.checked } : it))} />Visible</label> : field.includes('|') ? <Select key={field} label={field.split('|')[0]} value={value(item, field.split('|')[0])} choices={field.split('|').slice(1)} onChange={(v) => onChange(items.map((it, i) => i === index ? { ...it, [field.split('|')[0]]: v } : it))} />
        : <Input key={field} label={field} value={value(item, field)} onChange={(v) => onChange(items.map((it, i) => i === index ? { ...it, [field]: field === 'value' ? Number(v) : v } : it))} />)}
      <button className="text-destructive text-sm text-left" type="button" onClick={() => onChange(items.filter((_, i) => i !== index))}>Remove row</button>
    </div>)}
    <button className="text-signal text-sm" type="button" onClick={() => onChange([...items, Object.fromEntries(fields.map((field) => [field.split('|')[0].split(':')[0], field === 'value' ? 0 : field === 'visible:boolean' ? false : field.includes('|') ? field.split('|')[1] : '']))])}>+ Add row</button>
  </fieldset>;
}

export default function V2Workspace({ kind, draftsOnly = false }: { kind: ContentKind; draftsOnly?: boolean }) {
  const [items, setItems] = useState<Entry[]>([]);
  const [sha, setSha] = useState('');
  const [drafts, setDrafts] = useState<DraftInfo[]>([]);
  const [entry, setEntry] = useState<Entry | null>(null);
  const [revision, setRevision] = useState<number | null>(null);
  const [baseSha, setBaseSha] = useState('');
  const [saved, setSaved] = useState(false);
  const [slugLocked, setSlugLocked] = useState(false);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const draftForEntry = useMemo(() => drafts.find((draft) => draft.kind === kind && draft.slug === entry?.slug), [drafts, kind, entry]);

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
      setItems(parseCollection(kind, JSON.parse(file.content)).items as Entry[]);
      setSha(file.sha); setDrafts(list.drafts); setEntry(null); setRevision(null); setError(''); setPreview(false);
    }).catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Could not load content'); });
    return () => { active = false; };
  }, [kind]);

  const editPublished = (item: Entry) => { setEntry(structuredClone(item)); setRevision(null); setBaseSha(sha); setSaved(false); setPreview(false); setSlugLocked(true); };
  const editDraft = async (draft: DraftInfo) => {
    setBusy(true);
    try { const result = await adminApi.draftRead(draft.kind, draft.slug); setEntry(result.draft.content as Entry); setBaseSha(result.draft.base_sha); setRevision(result.draft.revision); setSaved(true); setPreview(false); setSlugLocked(true); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Cannot read draft'); }
    finally { setBusy(false); }
  };
  const change = (key: string, next: unknown) => { setEntry((current) => current ? { ...current, [key]: next } : current); setSaved(false); };
  const save = async () => {
    if (!entry) return;
    setBusy(true);
    try {
      const parsed = parseItem(kind, entry);
      if (draftForEntry && revision === null) throw new Error('A draft with this slug exists. Open it before editing.');
      const result = await adminApi.draftSave(kind, parsed.slug, parsed, baseSha, revision);
      setRevision(result.draft.revision); setEntry(result.draft.content as Entry); setSaved(true); await refresh(); toast.success('Private draft saved');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Invalid fields or save failed'); }
    finally { setBusy(false); }
  };
  const publish = async () => {
    if (!entry || revision === null || !saved) return;
    if (!confirm(`Publish ${kind}/${entry.slug} to the V2 Git collection?`)) return;
    setBusy(true);
    try { await adminApi.draftPublish(kind, value(entry, 'slug'), revision); await refresh(); setEntry(null); setRevision(null); setPreview(false); toast.success('Published to the V2 Git collection'); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Publish failed'); }
    finally { setBusy(false); }
  };
  const discard = async () => {
    if (!entry || revision === null || !confirm('Permanently delete this private draft?')) return;
    setBusy(true);
    try { await adminApi.draftDelete(kind, value(entry, 'slug'), revision); await refresh(); setEntry(null); setRevision(null); toast.success('Draft removed'); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Delete failed'); }
    finally { setBusy(false); }
  };

  return <div className="grid lg:grid-cols-[280px_1fr] gap-6">
    <aside className="border border-hairline bg-elev rounded-lg p-4 h-fit space-y-5">
      <div><div className="label-mono">{kind} · V2</div><button className="text-signal mt-3 text-sm" onClick={() => { setEntry(fresh(kind)); setRevision(null); setBaseSha(sha); setSaved(false); setPreview(false); setSlugLocked(false); }}>+ New private draft</button></div>
      {!draftsOnly && <div><div className="label-mono mb-2">Published in Git · {items.length}</div>{items.map((item) => <button key={value(item, 'slug')} className="block text-left w-full py-1 text-sm" onClick={() => editPublished(item)}>{value(item, 'name')}</button>)}</div>}
      <div><div className="label-mono mb-2">Private drafts</div>{drafts.filter((draft) => draft.kind === kind).map((draft) => <button key={`${draft.kind}/${draft.slug}`} className="block text-left w-full py-1 text-sm" onClick={() => void editDraft(draft)}>{draft.kind}/{draft.slug} · r{draft.revision}</button>)}</div>
    </aside>
    <section className="border border-hairline bg-elev rounded-lg p-5 space-y-5 min-h-[400px]">
      {error && <p role="alert" className="text-destructive">{error}</p>}
      {!entry && <p className="text-muted-foreground text-sm">Choose a published item or a private draft. New content starts as a private draft.</p>}
      {entry && <>
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">{revision === null ? 'New draft' : `Private draft · revision ${revision}`}</h2><span className="label-mono">{saved ? 'Saved · ready for preview' : 'Unsaved changes'}</span></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Name" value={value(entry, 'name')} onChange={(v) => change('name', v)} />
          <label className="block text-sm space-y-1"><span className="label-mono">Slug</span><input className={fieldClass} value={value(entry, 'slug')} disabled={slugLocked} onChange={(e) => change('slug', e.target.value)} /></label>
          <Select label="Original language" value={value(entry, 'sourceLocale')} choices={['pt-PT', 'pt-BR', 'en', 'es']} onChange={(v) => change('sourceLocale', v)} />
          <Input label="Short description" value={value(entry, 'summary')} onChange={(v) => change('summary', v)} />
        </div>
        <Input label="Long description" value={value(entry, 'description')} onChange={(v) => change('description', v)} multiline />
        {(kind === 'projects') && <>
          <Select label="Project status (independent of version)" value={value(entry, 'status')} choices={['internal-prototype', 'development', 'alpha', 'beta', 'stable', 'archived']} onChange={(v) => change('status', v)} />
          <StringList label="Release slugs" values={strings(entry, 'releaseSlugs')} onChange={(v) => change('releaseSlugs', v)} />
          <Input label="Installation" value={value(entry, 'installation')} onChange={(v) => change('installation', v)} multiline />
          <StringList label="Recommendations" values={strings(entry, 'recommendations')} onChange={(v) => change('recommendations', v)} />
          {(['minecraft', 'loaders', 'platforms'] as const).map((key) => <StringList key={key} label={`Compatibility: ${key}`} values={strings((entry.compatibility as Entry) || {}, key)} onChange={(v) => change('compatibility', { ...((entry.compatibility as Entry) || {}), [key]: v })} />)}
          <Rows title="Distribution providers" items={records(entry, 'distribution')} fields={['provider', 'state|active|paused|outdated', 'priority|primary|secondary', 'url', 'note']} onChange={(v) => change('distribution', v)} />
          <Rows title="Features" items={records(entry, 'features')} fields={['title', 'description', 'icon']} onChange={(v) => change('features', v)} />
          <Rows title="Requirements" items={records(entry, 'requirements')} fields={['title', 'description']} onChange={(v) => change('requirements', v)} />
          <Rows title="Benchmarks (with method/source)" items={records(entry, 'benchmarks')} fields={['label', 'value', 'unit', 'methodology', 'source']} onChange={(v) => change('benchmarks', v)} />
          <Rows title="Roadmap" items={records(entry, 'roadmap')} fields={['title', 'state|planned|in-progress|done']} onChange={(v) => change('roadmap', v)} />
        </>}
        {kind === 'releases' && <><Input label="Project slug" value={value(entry, 'projectSlug')} onChange={(v) => change('projectSlug', v)} /><Input label="Version" value={value(entry, 'version')} onChange={(v) => change('version', v)} /><Select label="Release channel" value={value(entry, 'channel')} choices={['alpha', 'beta', 'stable']} onChange={(v) => change('channel', v)} /><Input label="Release date (ISO 8601; optional)" value={value(entry, 'releasedAt')} onChange={(v) => change('releasedAt', v || undefined)} /><Input label="Changelog" value={value(entry, 'changelog')} onChange={(v) => change('changelog', v)} multiline /><Rows title="Distribution providers" items={records(entry, 'distribution')} fields={['provider', 'state|active|paused|outdated', 'priority|primary|secondary', 'url']} onChange={(v) => change('distribution', v)} /></>}
        {kind === 'launchers' && <><StringList label="Platforms" values={strings(entry, 'platforms')} onChange={(v) => change('platforms', v)} /><Select label="Ease of use" value={value(entry, 'easeOfUse') || 'beginner'} choices={['beginner', 'intermediate', 'advanced']} onChange={(v) => change('easeOfUse', v)} /><StringList label="Pros" values={strings(entry, 'pros')} onChange={(v) => change('pros', v)} /><StringList label="Cons" values={strings(entry, 'cons')} onChange={(v) => change('cons', v)} /><Input label="Installation" value={value(entry, 'installation')} onChange={(v) => change('installation', v)} multiline /><StringList label="Recommendations" values={strings(entry, 'recommendations')} onChange={(v) => change('recommendations', v)} /><StringList label="Compatibility" values={strings(entry, 'compatibility')} onChange={(v) => change('compatibility', v)} /><Rows title="Official links" items={records(entry, 'officialLinks')} fields={['label', 'url']} onChange={(v) => change('officialLinks', v)} /><Rows title="Features" items={records(entry, 'features')} fields={['title', 'description']} onChange={(v) => change('features', v)} /></>}
        {(kind === 'articles' || kind === 'guides') && <><Input label="Body (Markdown)" value={value(entry, 'body')} onChange={(v) => change('body', v)} multiline /><Input label="Project slug (optional)" value={value(entry, 'projectSlug')} onChange={(v) => change('projectSlug', v || undefined)} />{kind === 'articles' ? <><Input label="Category" value={value(entry, 'category')} onChange={(v) => change('category', v)} /><Input label="Author" value={value(entry, 'author')} onChange={(v) => change('author', v)} /></> : <><Input label="Launcher slug (optional)" value={value(entry, 'launcherSlug')} onChange={(v) => change('launcherSlug', v || undefined)} /><Select label="Level" value={value(entry, 'level') || 'beginner'} choices={['beginner', 'technical']} onChange={(v) => change('level', v)} /><Rows title="Steps" items={records(entry, 'steps')} fields={['title', 'body']} onChange={(v) => change('steps', v)} /></>}</>}
        {kind === 'faq' && <><Input label="Project slug (optional)" value={value(entry, 'projectSlug')} onChange={(v) => change('projectSlug', v || undefined)} /><Rows title="Questions" items={records(entry, 'items')} fields={['question', 'answer']} onChange={(v) => change('items', v)} /></>}
        {kind === 'homepage' && <><Input label="Hero eyebrow" value={value((entry.hero as Entry) || {}, 'eyebrow')} onChange={(v) => change('hero', { ...((entry.hero as Entry) || {}), eyebrow: v })} /><Input label="Hero title" value={value((entry.hero as Entry) || {}, 'title')} onChange={(v) => change('hero', { ...((entry.hero as Entry) || {}), title: v })} /><Input label="Hero subtitle" value={value((entry.hero as Entry) || {}, 'subtitle')} onChange={(v) => change('hero', { ...((entry.hero as Entry) || {}), subtitle: v })} /><Input label="Hero primary project slug" value={value((entry.hero as Entry) || {}, 'primaryProjectSlug')} onChange={(v) => change('hero', { ...((entry.hero as Entry) || {}), primaryProjectSlug: v || undefined })} /><StringList label="Featured project slugs (ordered)" values={strings(entry, 'featuredProjectSlugs')} onChange={(v) => change('featuredProjectSlugs', v)} /><StringList label="Featured article slugs (ordered)" values={strings(entry, 'featuredArticleSlugs')} onChange={(v) => change('featuredArticleSlugs', v)} /><Rows title="Notices" items={records(entry, 'notices')} fields={['id', 'text', 'link', 'visible:boolean']} onChange={(v) => change('notices', v)} /></>}
        {kind === 'settings' && <><Input label="Contact email" value={value(entry, 'contactEmail')} onChange={(v) => change('contactEmail', v)} /><Rows title="Navigation" items={records(entry, 'navigation')} fields={['label', 'path']} onChange={(v) => change('navigation', v)} /><Rows title="Footer" items={records(entry, 'footer')} fields={['label', 'url']} onChange={(v) => change('footer', v)} /></>}
        {kind === 'projects' && <Rows title="Project FAQ" items={records(entry, 'faq')} fields={['question', 'answer']} onChange={(v) => change('faq', v)} />}
        {(kind === 'projects' || kind === 'launchers' || kind === 'articles') && <Rows title="Images and media" items={records(entry, 'media')} fields={['url', 'alt', 'caption', 'kind|image|video']} onChange={(v) => change('media', v)} />}
        <fieldset className="border border-hairline rounded-lg p-4 space-y-3"><legend className="label-mono">SEO</legend>
          <Input label="Meta title" value={value((entry.seo as Entry) || {}, 'title')} onChange={(v) => change('seo', { ...((entry.seo as Entry) || {}), title: v })} />
          <Input label="Meta description" value={value((entry.seo as Entry) || {}, 'description')} onChange={(v) => change('seo', { ...((entry.seo as Entry) || {}), description: v })} />
        </fieldset>
        <fieldset className="border border-hairline rounded-lg p-4 space-y-3"><legend className="label-mono">Translations · optional</legend>
          {(['pt-PT', 'pt-BR', 'en', 'es'] as const).filter((locale) => locale !== entry.sourceLocale).map((locale) => {
            const all = (entry.translations as Entry) || {};
            const translation = (all[locale] as Entry) || {};
            const fields = (translation.fields as Entry) || {};
            const set = (patch: Entry) => change('translations', { ...all, [locale]: { state: translation.state || 'partial', fields: { ...fields, ...patch } } });
            return <div key={locale} className="border border-hairline rounded-md p-3 space-y-2"><div className="label-mono">{locale}</div>
              <Select label="Translation state" value={value(translation, 'state') || 'partial'} choices={['partial', 'complete']} onChange={(v) => change('translations', { ...all, [locale]: { state: v, fields } })} />
              <Input label="Translated name" value={value(fields, 'name')} onChange={(v) => set({ name: v })} />
              <Input label="Translated summary" value={value(fields, 'summary')} onChange={(v) => set({ summary: v })} />
              <Input label="Translated description" value={value(fields, 'description')} onChange={(v) => set({ description: v })} multiline />
              {(kind === 'articles' || kind === 'guides') && <Input label="Translated body" value={value(fields, 'body')} onChange={(v) => set({ body: v })} multiline />}
            </div>;
          })}
        </fieldset>
        <div className="flex flex-wrap gap-3"><button disabled={busy || !sha} className="px-4 h-10 rounded-md bg-signal text-primary-foreground disabled:opacity-50" onClick={() => void save()}>Save private draft</button><button className="px-4 h-10 border border-hairline rounded-md" onClick={() => setPreview((v) => !v)}>Preview</button><button disabled={busy || !saved || revision === null} className="px-4 h-10 border border-hairline rounded-md disabled:opacity-50" onClick={() => void publish()}>Publish to Git</button>{revision !== null && <button disabled={busy} className="text-destructive" onClick={() => void discard()}>Discard draft</button>}</div>
        {preview && <article className="border border-hairline rounded-lg p-6 space-y-3" aria-label="Content preview"><p className="label-mono">Private preview · {kind}</p><h3 className="text-2xl font-semibold">{value(entry, 'name')}</h3><p>{value(entry, 'summary')}</p><RichMarkdown markdown={value(entry, 'body') || value(entry, 'description')} /></article>}
      </>}
    </section>
  </div>;
}
