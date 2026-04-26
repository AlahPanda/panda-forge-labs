import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SiteLayout from '@/components/layout/SiteLayout';
import Seo from '@/components/Seo';
import { adminApi, adminAuth } from '@/lib/adminApi';
import siteJson from '@/content/site.json';
import modpacksJson from '@/content/modpacks.json';
import newsJson from '@/content/news.json';
import faqJson from '@/content/faq.json';
import reviewsJson from '@/content/reviews.json';
import { Save, Rocket, Loader2, LogOut, Plus, Trash2, Pencil, X, ChevronLeft, Box, Newspaper, HelpCircle, Star, Settings as SettingsIcon } from 'lucide-react';
import MarkdownEditor from '@/components/MarkdownEditor';
import { toast } from 'sonner';

type TabKey = 'modpacks' | 'news' | 'faq' | 'reviews' | 'settings';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'modpacks', label: 'Modpacks', icon: <Box className="h-4 w-4" /> },
  { key: 'news', label: 'News', icon: <Newspaper className="h-4 w-4" /> },
  { key: 'faq', label: 'FAQ', icon: <HelpCircle className="h-4 w-4" /> },
  { key: 'reviews', label: 'Reviews', icon: <Star className="h-4 w-4" /> },
  { key: 'settings', label: 'Settings', icon: <SettingsIcon className="h-4 w-4" /> },
];

export default function AdminEditor() {
  const nav = useNavigate();
  const [tab, setTab] = useState<TabKey>('modpacks');
  const [redeploying, setRedeploying] = useState(false);

  // Draft state for each content file
  const [modpacks, setModpacks] = useState<any[]>(modpacksJson.modpacks);
  const [articles, setArticles] = useState<any[]>(newsJson.articles);
  const [faqCats, setFaqCats] = useState<any[]>(faqJson.categories);
  const [reviews, setReviews] = useState<any[]>(reviewsJson.reviews);
  const [siteCfg, setSiteCfg] = useState<any>(siteJson.site);

  useEffect(() => {
    if (!adminAuth.isLoggedIn()) nav('/admin', { replace: true });
  }, [nav]);

  const redeploy = async () => {
    setRedeploying(true);
    try {
      await adminApi.redeploy();
      toast.success('Vercel rebuild triggered. Live in ~30–60s.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Redeploy failed');
    } finally { setRedeploying(false); }
  };

  const logout = () => { adminAuth.clear(); nav('/admin', { replace: true }); };

  return (
    <SiteLayout>
      <Seo title="Dashboard — AlahPanda Admin" />
      <section className="container py-10">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="label-mono flex items-center gap-2"><span className="signal-dot" /> Admin · Signed in</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Lab Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={redeploy} disabled={redeploying}
              className="inline-flex items-center gap-2 px-4 h-10 rounded-md border border-hairline hover:bg-secondary/60 transition-colors disabled:opacity-60">
              {redeploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
              Redeploy
            </button>
            <button onClick={logout}
              className="inline-flex items-center gap-2 px-4 h-10 rounded-md border border-hairline hover:bg-secondary/60 text-muted-foreground">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border border-hairline rounded-md p-1 bg-elev w-full overflow-x-auto flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 px-4 h-10 rounded text-sm font-medium whitespace-nowrap transition-colors active:scale-[0.98] ${
                tab === t.key ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === 'modpacks' && (
            <ModpacksTab items={modpacks} setItems={setModpacks} />
          )}
          {tab === 'news' && (
            <NewsTab items={articles} setItems={setArticles} />
          )}
          {tab === 'faq' && (
            <FaqTab items={faqCats} setItems={setFaqCats} />
          )}
          {tab === 'reviews' && (
            <ReviewsTab items={reviews} setItems={setReviews} modpacks={modpacks} />
          )}
          {tab === 'settings' && (
            <SettingsTab cfg={siteCfg} setCfg={setSiteCfg} />
          )}
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          Saving commits to GitHub. Trigger a redeploy to publish.
          Need raw JSON access? <Link to="#" className="text-signal underline">Coming soon</Link>.
        </p>
      </section>
    </SiteLayout>
  );
}

/* =========================================================================
   Save helper — commits the wrapped object to the right path
   ========================================================================= */
async function commitFile(path: string, obj: any, msg: string) {
  const content = JSON.stringify(obj, null, 2) + '\n';
  await adminApi.save(path, content, msg);
}

/* =========================================================================
   Generic primitives
   ========================================================================= */
function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="label-mono">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}
const inputCls =
  'w-full h-10 px-3 rounded-md border border-hairline bg-background focus:outline-none focus:border-signal transition-colors text-sm';
const textareaCls =
  'w-full px-3 py-2 rounded-md border border-hairline bg-background focus:outline-none focus:border-signal transition-colors text-sm font-mono';

function PrimaryBtn({ children, onClick, disabled, loading }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="inline-flex items-center gap-1.5 px-4 h-10 rounded-md bg-signal text-primary-foreground font-medium hover:bg-signal/90 disabled:opacity-50 transition-colors active:scale-[0.97]"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {children}
    </button>
  );
}
function GhostBtn({ children, ...rest }: any) {
  return (
    <button
      {...rest}
      className="inline-flex items-center gap-1.5 px-3 h-9 rounded-md border border-hairline text-sm hover:bg-secondary/60 transition-colors active:scale-[0.97]"
    >
      {children}
    </button>
  );
}
function DangerBtn({ children, ...rest }: any) {
  return (
    <button
      {...rest}
      className="inline-flex items-center gap-1.5 px-3 h-9 rounded-md border border-destructive/40 text-destructive text-sm hover:bg-destructive/10 transition-colors active:scale-[0.97]"
    >
      {children}
    </button>
  );
}

/* =========================================================================
   List + Editor scaffold
   ========================================================================= */
function ListShell<T>({
  title,
  items,
  renderItem,
  onCreate,
  onEdit,
  onDelete,
  onSave,
  saving,
  editor,
}: {
  title: string;
  items: T[];
  renderItem: (it: T) => { key: string; primary: string; secondary?: string };
  onCreate: () => void;
  onEdit: (key: string) => void;
  onDelete: (key: string) => void;
  onSave: () => void;
  saving: boolean;
  editor?: React.ReactNode;
}) {
  return (
    <div className="grid lg:grid-cols-[340px_1fr] gap-6">
      <div className="border border-hairline rounded-lg p-4 bg-elev h-fit">
        <div className="flex items-center justify-between mb-4">
          <div className="label-mono">{title} · {items.length}</div>
          <GhostBtn onClick={onCreate}><Plus className="h-3.5 w-3.5" /> New</GhostBtn>
        </div>
        <ul className="space-y-1">
          {items.map((it) => {
            const r = renderItem(it);
            return (
              <li key={r.key} className="flex items-center justify-between gap-2 px-2 py-2 rounded hover:bg-secondary/60 group">
                <button onClick={() => onEdit(r.key)} className="flex-1 text-left">
                  <div className="text-sm font-medium truncate">{r.primary}</div>
                  {r.secondary && <div className="text-[11px] text-muted-foreground truncate">{r.secondary}</div>}
                </button>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEdit(r.key)} className="p-1.5 text-muted-foreground hover:text-foreground" aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => onDelete(r.key)} className="p-1.5 text-muted-foreground hover:text-destructive" aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </li>
            );
          })}
          {items.length === 0 && (
            <li className="text-xs text-muted-foreground p-3 text-center">Nothing yet. Click <em>New</em>.</li>
          )}
        </ul>
        <div className="mt-4 pt-4 border-t border-hairline">
          <PrimaryBtn onClick={onSave} loading={saving}>Save & commit</PrimaryBtn>
        </div>
      </div>
      <div className="min-h-[400px]">
        {editor ?? (
          <div className="h-full border border-dashed border-hairline rounded-lg flex items-center justify-center text-sm text-muted-foreground p-12">
            Select an item on the left, or click <em className="mx-1">New</em> to create one.
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   MODPACKS TAB
   ========================================================================= */
function blankModpack() {
  return {
    slug: 'new-modpack',
    name: 'New Modpack',
    tagline: '',
    summary: '',
    description: '',
    version: '0.1.0',
    mcVersion: '1.21.1',
    loader: 'Fabric',
    modCount: 0,
    tags: [],
    accent: '190 95% 55%',
    featured: false,
    trending: false,
    downloads: '0',
    rating: 5,
    layoutType: 'standard',
    image: '',
    downloadLinks: { modrinth: '', curseforge: '', github: '', mirror: '' },
    benchmarks: [],
    features: [],
    specs: { minRam: '4 GB', recommendedRam: '8 GB', javaVersion: '21', size: '0 MB' },
    installGuide: '',
    changelog: [],
  };
}

function ModpacksTab({ items, setItems }: { items: any[]; setItems: (n: any[]) => void }) {
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const editing = useMemo(() => items.find((m) => m.slug === editingSlug) ?? null, [items, editingSlug]);

  const update = (patch: any) => {
    if (!editing) return;
    setItems(items.map((m) => (m.slug === editing.slug ? { ...m, ...patch } : m)));
    if (patch.slug && patch.slug !== editing.slug) setEditingSlug(patch.slug);
  };

  const create = () => {
    const np = blankModpack();
    let slug = np.slug;
    let i = 1;
    while (items.some((m) => m.slug === slug)) { slug = `${np.slug}-${i++}`; }
    np.slug = slug;
    setItems([...items, np]);
    setEditingSlug(slug);
  };

  const remove = (slug: string) => {
    if (!confirm(`Delete "${slug}"?`)) return;
    setItems(items.filter((m) => m.slug !== slug));
    if (editingSlug === slug) setEditingSlug(null);
  };

  const save = async () => {
    setSaving(true);
    try {
      await commitFile('src/content/modpacks.json', { modpacks: items }, 'cms: update modpacks');
      toast.success('Modpacks committed. Trigger redeploy to publish.');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <ListShell
      title="Modpacks"
      items={items}
      renderItem={(m: any) => ({
        key: m.slug,
        primary: m.name,
        secondary: `${m.layoutType} · v${m.version} · ${m.downloads} dl`,
      })}
      onCreate={create}
      onEdit={setEditingSlug}
      onDelete={remove}
      onSave={save}
      saving={saving}
      editor={editing && (
        <div className="border border-hairline rounded-lg p-6 bg-elev space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="label-mono">Editing modpack</div>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">{editing.name}</h2>
            </div>
            <GhostBtn onClick={() => setEditingSlug(null)}><ChevronLeft className="h-4 w-4" /> Close</GhostBtn>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Name"><input className={inputCls} value={editing.name} onChange={(e) => update({ name: e.target.value })} /></Field>
            <Field label="Slug" hint="URL identifier — lowercase, no spaces"><input className={inputCls} value={editing.slug} onChange={(e) => update({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} /></Field>
            <Field label="Tagline"><input className={inputCls} value={editing.tagline} onChange={(e) => update({ tagline: e.target.value })} /></Field>
            <Field label="Layout type">
              <select className={inputCls} value={editing.layoutType} onChange={(e) => update({ layoutType: e.target.value })}>
                <option value="performance">performance</option>
                <option value="immersion">immersion</option>
                <option value="standard">standard</option>
              </select>
            </Field>
            <Field label="Version"><input className={inputCls} value={editing.version} onChange={(e) => update({ version: e.target.value })} /></Field>
            <Field label="MC Version"><input className={inputCls} value={editing.mcVersion} onChange={(e) => update({ mcVersion: e.target.value })} /></Field>
            <Field label="Loader"><input className={inputCls} value={editing.loader} onChange={(e) => update({ loader: e.target.value })} /></Field>
            <Field label="Mod count"><input type="number" className={inputCls} value={editing.modCount} onChange={(e) => update({ modCount: +e.target.value })} /></Field>
            <Field label="Downloads (display)"><input className={inputCls} value={editing.downloads} onChange={(e) => update({ downloads: e.target.value })} /></Field>
            <Field label="Rating (0–5)"><input type="number" step="0.1" className={inputCls} value={editing.rating} onChange={(e) => update({ rating: +e.target.value })} /></Field>
            <Field label="Accent (HSL)" hint="e.g. 190 95% 55%"><input className={inputCls} value={editing.accent} onChange={(e) => update({ accent: e.target.value })} /></Field>
            <Field label="Tags (comma-separated)">
              <input className={inputCls} value={editing.tags.join(', ')} onChange={(e) => update({ tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
            </Field>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.featured} onChange={(e) => update({ featured: e.target.checked })} /> Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.trending} onChange={(e) => update({ trending: e.target.checked })} /> Trending
            </label>
          </div>

          <Field label="Cover image URL" hint="Square (1:1) — used as card thumbnail and OG share image"><input className={inputCls} value={editing.image ?? ''} onChange={(e) => update({ image: e.target.value })} placeholder="https://…" /></Field>
          <Field label="Summary"><textarea rows={2} className={textareaCls} value={editing.summary} onChange={(e) => update({ summary: e.target.value })} /></Field>
          <MarkdownEditor
            label="Description (Markdown)"
            value={editing.description}
            onChange={(v) => update({ description: v })}
            rows={10}
          />

          <div>
            <div className="label-mono mb-2">Download links</div>
            <div className="grid sm:grid-cols-2 gap-3">
              {(['modrinth', 'curseforge', 'github', 'mirror'] as const).map((k) => (
                <Field key={k} label={k}>
                  <input className={inputCls} value={editing.downloadLinks?.[k] ?? ''} onChange={(e) => update({ downloadLinks: { ...editing.downloadLinks, [k]: e.target.value } })} />
                </Field>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-4 gap-3">
            {(['minRam', 'recommendedRam', 'javaVersion', 'size'] as const).map((k) => (
              <Field key={k} label={k}>
                <input className={inputCls} value={editing.specs?.[k] ?? ''} onChange={(e) => update({ specs: { ...editing.specs, [k]: e.target.value } })} />
              </Field>
            ))}
          </div>

          {editing.layoutType === 'performance' && (
            <BenchmarksEditor data={editing.benchmarks} onChange={(b) => update({ benchmarks: b })} />
          )}
          {editing.layoutType === 'immersion' && (
            <FeaturesEditor data={editing.features} onChange={(f) => update({ features: f })} />
          )}

          <MarkdownEditor
            label="Installation guide (Markdown)"
            value={editing.installGuide}
            onChange={(v) => update({ installGuide: v })}
            rows={12}
          />

          <ChangelogEditor data={editing.changelog} onChange={(c) => update({ changelog: c })} />
        </div>
      )}
    />
  );
}

function BenchmarksEditor({ data, onChange }: { data: any[]; onChange: (n: any[]) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="label-mono">Benchmarks · single-machine FPS</div>
        <GhostBtn onClick={() => onChange([...data, { label: 'New rig', vanilla: 60, fabulous: 90, modded: 120 }])}>
          <Plus className="h-3.5 w-3.5" /> Row
        </GhostBtn>
      </div>
      <div className="space-y-2">
        {data.map((row, idx) => (
          <div key={idx} className="grid grid-cols-[1fr_80px_80px_80px_auto] gap-2 items-end">
            <Field label="Hardware"><input className={inputCls} value={row.label} onChange={(e) => { const n = [...data]; n[idx] = { ...row, label: e.target.value }; onChange(n); }} /></Field>
            <Field label="Vanilla"><input type="number" className={inputCls} value={row.vanilla} onChange={(e) => { const n = [...data]; n[idx] = { ...row, vanilla: +e.target.value }; onChange(n); }} /></Field>
            <Field label="Perf King"><input type="number" className={inputCls} value={row.fabulous ?? 0} onChange={(e) => { const n = [...data]; n[idx] = { ...row, fabulous: +e.target.value }; onChange(n); }} /></Field>
            <Field label="Modded"><input type="number" className={inputCls} value={row.modded} onChange={(e) => { const n = [...data]; n[idx] = { ...row, modded: +e.target.value }; onChange(n); }} /></Field>
            <button onClick={() => onChange(data.filter((_, i) => i !== idx))} className="h-10 px-2 text-destructive hover:bg-destructive/10 rounded-md"><X className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeaturesEditor({ data, onChange }: { data: any[]; onChange: (n: any[]) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="label-mono">Feature showcase</div>
        <GhostBtn onClick={() => onChange([...data, { title: 'New feature', description: '', icon: 'Sparkles' }])}>
          <Plus className="h-3.5 w-3.5" /> Feature
        </GhostBtn>
      </div>
      <div className="space-y-3">
        {data.map((f, idx) => (
          <div key={idx} className="grid sm:grid-cols-[1fr_1fr_140px_auto] gap-2 items-end border border-hairline rounded-md p-3 bg-background">
            <Field label="Title"><input className={inputCls} value={f.title} onChange={(e) => { const n = [...data]; n[idx] = { ...f, title: e.target.value }; onChange(n); }} /></Field>
            <Field label="Description"><input className={inputCls} value={f.description} onChange={(e) => { const n = [...data]; n[idx] = { ...f, description: e.target.value }; onChange(n); }} /></Field>
            <Field label="Icon (lucide)"><input className={inputCls} value={f.icon ?? ''} onChange={(e) => { const n = [...data]; n[idx] = { ...f, icon: e.target.value }; onChange(n); }} /></Field>
            <button onClick={() => onChange(data.filter((_, i) => i !== idx))} className="h-10 px-2 text-destructive hover:bg-destructive/10 rounded-md"><X className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChangelogEditor({ data, onChange }: { data: any[]; onChange: (n: any[]) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="label-mono">Changelog</div>
        <GhostBtn onClick={() => onChange([{ version: '0.0.0', date: new Date().toISOString().slice(0, 10), notes: '' }, ...data])}>
          <Plus className="h-3.5 w-3.5" /> Entry
        </GhostBtn>
      </div>
      <div className="space-y-3">
        {data.map((c, idx) => (
          <div key={idx} className="grid sm:grid-cols-[120px_140px_1fr_auto] gap-2 items-end border border-hairline rounded-md p-3 bg-background">
            <Field label="Version"><input className={inputCls} value={c.version} onChange={(e) => { const n = [...data]; n[idx] = { ...c, version: e.target.value }; onChange(n); }} /></Field>
            <Field label="Date"><input type="date" className={inputCls} value={c.date} onChange={(e) => { const n = [...data]; n[idx] = { ...c, date: e.target.value }; onChange(n); }} /></Field>
            <Field label="Notes"><input className={inputCls} value={c.notes} onChange={(e) => { const n = [...data]; n[idx] = { ...c, notes: e.target.value }; onChange(n); }} /></Field>
            <button onClick={() => onChange(data.filter((_, i) => i !== idx))} className="h-10 px-2 text-destructive hover:bg-destructive/10 rounded-md"><X className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   NEWS TAB
   ========================================================================= */
function blankArticle() {
  return {
    slug: 'new-article',
    title: 'New article',
    excerpt: '',
    body: '',
    category: 'Engineering',
    modpackSlug: null,
    author: 'AlahPanda',
    publishedAt: new Date().toISOString().slice(0, 10),
    readMinutes: 3,
    featured: false,
    draft: true,
    tags: [],
    image: '',
  };
}
function NewsTab({ items, setItems }: { items: any[]; setItems: (n: any[]) => void }) {
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const editing = useMemo(() => items.find((a) => a.slug === editingSlug) ?? null, [items, editingSlug]);

  const update = (patch: any) => {
    if (!editing) return;
    setItems(items.map((a) => (a.slug === editing.slug ? { ...a, ...patch } : a)));
    if (patch.slug && patch.slug !== editing.slug) setEditingSlug(patch.slug);
  };
  const create = () => {
    const np = blankArticle();
    let slug = np.slug; let i = 1;
    while (items.some((a) => a.slug === slug)) slug = `${np.slug}-${i++}`;
    np.slug = slug;
    setItems([np, ...items]);
    setEditingSlug(slug);
  };
  const remove = (slug: string) => {
    if (!confirm(`Delete "${slug}"?`)) return;
    setItems(items.filter((a) => a.slug !== slug));
    if (editingSlug === slug) setEditingSlug(null);
  };
  const save = async () => {
    setSaving(true);
    try {
      await commitFile('src/content/news.json', { articles: items }, 'cms: update news');
      toast.success('News committed.');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <ListShell
      title="Articles"
      items={items}
      renderItem={(a: any) => ({ key: a.slug, primary: a.title, secondary: `${a.category} · ${a.publishedAt}${a.draft ? ' · draft' : ''}` })}
      onCreate={create}
      onEdit={setEditingSlug}
      onDelete={remove}
      onSave={save}
      saving={saving}
      editor={editing && (
        <div className="border border-hairline rounded-lg p-6 bg-elev space-y-4">
          <div className="flex items-center justify-between">
            <div className="label-mono">Editing article</div>
            <GhostBtn onClick={() => setEditingSlug(null)}><ChevronLeft className="h-4 w-4" /> Close</GhostBtn>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Title"><input className={inputCls} value={editing.title} onChange={(e) => update({ title: e.target.value })} /></Field>
            <Field label="Slug"><input className={inputCls} value={editing.slug} onChange={(e) => update({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} /></Field>
            <Field label="Category"><input className={inputCls} value={editing.category} onChange={(e) => update({ category: e.target.value })} /></Field>
            <Field label="Author"><input className={inputCls} value={editing.author} onChange={(e) => update({ author: e.target.value })} /></Field>
            <Field label="Published at"><input type="date" className={inputCls} value={editing.publishedAt} onChange={(e) => update({ publishedAt: e.target.value })} /></Field>
            <Field label="Read minutes"><input type="number" className={inputCls} value={editing.readMinutes} onChange={(e) => update({ readMinutes: +e.target.value })} /></Field>
            <Field label="Modpack slug (optional)"><input className={inputCls} value={editing.modpackSlug ?? ''} onChange={(e) => update({ modpackSlug: e.target.value || null })} /></Field>
            <Field label="Tags (comma-separated)"><input className={inputCls} value={editing.tags.join(', ')} onChange={(e) => update({ tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} /></Field>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.featured} onChange={(e) => update({ featured: e.target.checked })} /> Featured</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.draft} onChange={(e) => update({ draft: e.target.checked })} /> Draft</label>
          </div>
          <Field label="Cover image URL" hint="16:9 aspect — used as card thumbnail and OG image"><input className={inputCls} value={editing.image ?? ''} onChange={(e) => update({ image: e.target.value })} placeholder="https://…" /></Field>
          <Field label="Excerpt"><textarea rows={2} className={textareaCls} value={editing.excerpt} onChange={(e) => update({ excerpt: e.target.value })} /></Field>
          <MarkdownEditor
            label="Body (Markdown)"
            value={editing.body}
            onChange={(v) => update({ body: v })}
            rows={14}
          />
        </div>
      )}
    />
  );
}

/* =========================================================================
   FAQ TAB
   ========================================================================= */
function FaqTab({ items, setItems }: { items: any[]; setItems: (n: any[]) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const editing = useMemo(() => items.find((c) => c.id === editingId) ?? null, [items, editingId]);

  const update = (patch: any) => {
    if (!editing) return;
    setItems(items.map((c) => (c.id === editing.id ? { ...c, ...patch } : c)));
    if (patch.id && patch.id !== editing.id) setEditingId(patch.id);
  };
  const create = () => {
    const id = `cat-${Date.now().toString(36)}`;
    setItems([...items, { id, title: 'New category', items: [] }]);
    setEditingId(id);
  };
  const remove = (id: string) => {
    if (!confirm(`Delete category?`)) return;
    setItems(items.filter((c) => c.id !== id));
    if (editingId === id) setEditingId(null);
  };
  const save = async () => {
    setSaving(true);
    try {
      await commitFile('src/content/faq.json', { categories: items }, 'cms: update faq');
      toast.success('FAQ committed.');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <ListShell
      title="FAQ categories"
      items={items}
      renderItem={(c: any) => ({ key: c.id, primary: c.title, secondary: `${c.items?.length ?? 0} questions` })}
      onCreate={create}
      onEdit={setEditingId}
      onDelete={remove}
      onSave={save}
      saving={saving}
      editor={editing && (
        <div className="border border-hairline rounded-lg p-6 bg-elev space-y-4">
          <div className="flex items-center justify-between">
            <div className="label-mono">Editing category</div>
            <GhostBtn onClick={() => setEditingId(null)}><ChevronLeft className="h-4 w-4" /> Close</GhostBtn>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="ID"><input className={inputCls} value={editing.id} onChange={(e) => update({ id: e.target.value })} /></Field>
            <Field label="Title"><input className={inputCls} value={editing.title} onChange={(e) => update({ title: e.target.value })} /></Field>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="label-mono">Questions</div>
              <GhostBtn onClick={() => update({ items: [...(editing.items ?? []), { q: '', a: '' }] })}><Plus className="h-3.5 w-3.5" /> Question</GhostBtn>
            </div>
            <div className="space-y-3">
              {(editing.items ?? []).map((qa: any, idx: number) => (
                <div key={idx} className="border border-hairline rounded-md p-3 bg-background space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="label-mono">Q{idx + 1}</span>
                    <button onClick={() => update({ items: editing.items.filter((_: any, i: number) => i !== idx) })} className="text-destructive hover:bg-destructive/10 p-1 rounded"><X className="h-4 w-4" /></button>
                  </div>
                  <input className={inputCls} placeholder="Question" value={qa.q} onChange={(e) => { const n = [...editing.items]; n[idx] = { ...qa, q: e.target.value }; update({ items: n }); }} />
                  <textarea rows={3} className={textareaCls} placeholder="Answer" value={qa.a} onChange={(e) => { const n = [...editing.items]; n[idx] = { ...qa, a: e.target.value }; update({ items: n }); }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    />
  );
}

/* =========================================================================
   REVIEWS TAB
   ========================================================================= */
function ReviewsTab({ items, setItems, modpacks }: { items: any[]; setItems: (n: any[]) => void; modpacks: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const editing = useMemo(() => items.find((r) => r.id === editingId) ?? null, [items, editingId]);

  const update = (patch: any) => {
    if (!editing) return;
    setItems(items.map((r) => (r.id === editing.id ? { ...r, ...patch } : r)));
  };
  const create = () => {
    const id = `rev-${Date.now().toString(36)}`;
    setItems([{ id, modpackSlug: modpacks[0]?.slug ?? '', author: '', rating: 5, body: '', publishedAt: new Date().toISOString().slice(0, 10) }, ...items]);
    setEditingId(id);
  };
  const remove = (id: string) => {
    if (!confirm('Delete review?')) return;
    setItems(items.filter((r) => r.id !== id));
    if (editingId === id) setEditingId(null);
  };
  const save = async () => {
    setSaving(true);
    try {
      await commitFile('src/content/reviews.json', { reviews: items }, 'cms: update reviews');
      toast.success('Reviews committed.');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <ListShell
      title="Reviews"
      items={items}
      renderItem={(r: any) => ({ key: r.id, primary: `${r.author || '—'} · ${r.modpackSlug}`, secondary: `★ ${r.rating} · ${r.publishedAt}` })}
      onCreate={create}
      onEdit={setEditingId}
      onDelete={remove}
      onSave={save}
      saving={saving}
      editor={editing && (
        <div className="border border-hairline rounded-lg p-6 bg-elev space-y-4">
          <div className="flex items-center justify-between">
            <div className="label-mono">Editing review</div>
            <GhostBtn onClick={() => setEditingId(null)}><ChevronLeft className="h-4 w-4" /> Close</GhostBtn>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Author"><input className={inputCls} value={editing.author} onChange={(e) => update({ author: e.target.value })} /></Field>
            <Field label="Modpack">
              <select className={inputCls} value={editing.modpackSlug} onChange={(e) => update({ modpackSlug: e.target.value })}>
                {modpacks.map((m) => <option key={m.slug} value={m.slug}>{m.name}</option>)}
              </select>
            </Field>
            <Field label="Rating (1–5)"><input type="number" min={1} max={5} step="0.1" className={inputCls} value={editing.rating} onChange={(e) => update({ rating: +e.target.value })} /></Field>
            <Field label="Published at"><input type="date" className={inputCls} value={editing.publishedAt} onChange={(e) => update({ publishedAt: e.target.value })} /></Field>
          </div>
          <Field label="Body"><textarea rows={5} className={textareaCls} value={editing.body} onChange={(e) => update({ body: e.target.value })} /></Field>
        </div>
      )}
    />
  );
}

/* =========================================================================
   SETTINGS TAB
   ========================================================================= */
function SettingsTab({ cfg, setCfg }: { cfg: any; setCfg: (n: any) => void }) {
  const [saving, setSaving] = useState(false);
  const upd = (patch: any) => setCfg({ ...cfg, ...patch });
  const updSocial = (patch: any) => upd({ social: { ...(cfg.social ?? {}), ...patch } });
  const updAds = (patch: any) => upd({ ads: { ...(cfg.ads ?? {}), ...patch } });
  const updPopups = (patch: any) => upd({ popups: { ...(cfg.popups ?? {}), ...patch } });
  const updStats = (patch: any) => upd({ stats: { ...(cfg.stats ?? {}), ...patch } });

  const save = async () => {
    setSaving(true);
    try {
      await commitFile('src/content/site.json', { site: cfg }, 'cms: update site settings');
      toast.success('Settings committed.');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Section title="Identity">
        <Field label="Site name"><input className={inputCls} value={cfg.name} onChange={(e) => upd({ name: e.target.value })} /></Field>
        <Field label="Tagline"><input className={inputCls} value={cfg.tagline} onChange={(e) => upd({ tagline: e.target.value })} /></Field>
        <Field label="Description"><textarea rows={3} className={textareaCls} value={cfg.description} onChange={(e) => upd({ description: e.target.value })} /></Field>
        <Field label="Contact email"><input className={inputCls} value={cfg.contactEmail} onChange={(e) => upd({ contactEmail: e.target.value })} /></Field>
      </Section>

      <Section title="Social links">
        <Field label="Discord URL"><input className={inputCls} value={cfg.discordUrl} onChange={(e) => upd({ discordUrl: e.target.value })} /></Field>
        <Field label="GitHub URL"><input className={inputCls} value={cfg.githubUrl} onChange={(e) => upd({ githubUrl: e.target.value })} /></Field>
        <Field label="Ko-fi URL"><input className={inputCls} value={cfg.supportUrl} onChange={(e) => upd({ supportUrl: e.target.value })} /></Field>
        <Field label="Twitter / X"><input className={inputCls} value={cfg.social?.twitter ?? ''} onChange={(e) => updSocial({ twitter: e.target.value })} /></Field>
        <Field label="YouTube"><input className={inputCls} value={cfg.social?.youtube ?? ''} onChange={(e) => updSocial({ youtube: e.target.value })} /></Field>
        <Field label="Twitch"><input className={inputCls} value={cfg.social?.twitch ?? ''} onChange={(e) => updSocial({ twitch: e.target.value })} /></Field>
      </Section>

      <Section title="Ads & monetization">
        <label className="flex items-center justify-between gap-4 p-3 border border-hairline rounded-md bg-background">
          <div>
            <div className="text-sm font-medium">Enable AdSense slots</div>
            <div className="text-[11px] text-muted-foreground">When off, every &lt;AdSlot /&gt; shows the placeholder.</div>
          </div>
          <input type="checkbox" checked={cfg.ads?.adsenseEnabled ?? false} onChange={(e) => updAds({ adsenseEnabled: e.target.checked })} className="h-5 w-5 accent-current text-signal" />
        </label>
        <Field label="AdSense Client ID" hint="e.g. ca-pub-1234567890123456">
          <input className={inputCls} value={cfg.ads?.adsenseClient ?? ''} onChange={(e) => updAds({ adsenseClient: e.target.value })} />
        </Field>
        <label className="flex items-center justify-between gap-4 p-3 border border-hairline rounded-md bg-background">
          <div>
            <div className="text-sm font-medium">Show Ko-fi support button</div>
            <div className="text-[11px] text-muted-foreground">Footer + modpack sidebar.</div>
          </div>
          <input type="checkbox" checked={cfg.ads?.showSupportButton ?? false} onChange={(e) => updAds({ showSupportButton: e.target.checked })} className="h-5 w-5 accent-current text-signal" />
        </label>
      </Section>

      <Section title="Popups & stats">
        <label className="flex items-center justify-between gap-4 p-3 border border-hairline rounded-md bg-background">
          <div className="text-sm font-medium">Discord popup on download</div>
          <input type="checkbox" checked={cfg.popups?.discordOnDownload ?? false} onChange={(e) => updPopups({ discordOnDownload: e.target.checked })} className="h-5 w-5" />
        </label>
        <Field label="Newsletter delay (seconds)"><input type="number" className={inputCls} value={cfg.popups?.newsletterDelaySec ?? 0} onChange={(e) => updPopups({ newsletterDelaySec: +e.target.value })} /></Field>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Downloads (display)"><input className={inputCls} value={cfg.stats?.downloads ?? ''} onChange={(e) => updStats({ downloads: e.target.value })} /></Field>
          <Field label="Modpacks (display)"><input className={inputCls} value={cfg.stats?.modpacks ?? ''} onChange={(e) => updStats({ modpacks: e.target.value })} /></Field>
          <Field label="Members (display)"><input className={inputCls} value={cfg.stats?.members ?? ''} onChange={(e) => updStats({ members: e.target.value })} /></Field>
          <Field label="Builds shipped"><input className={inputCls} value={cfg.stats?.buildsShipped ?? ''} onChange={(e) => updStats({ buildsShipped: e.target.value })} /></Field>
        </div>
      </Section>

      <div className="lg:col-span-2 flex justify-end">
        <PrimaryBtn onClick={save} loading={saving}>Save & commit settings</PrimaryBtn>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-hairline rounded-lg p-6 bg-elev space-y-4">
      <div className="label-mono">{title}</div>
      {children}
    </div>
  );
}
