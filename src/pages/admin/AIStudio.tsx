import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { collectionPath, CONTENT_KINDS, parseCollection, type ContentKind } from '@/content/v2/schema';
import { useAdminText } from './adminText';
import { reviewProposal, type Proposal } from './proposals';
import { ownerError } from './adminErrors';

const actions = ['articleAction', 'improveAction', 'translateAction', 'faqAction', 'guideAction', 'seoAction'] as const;

/** The provider is deliberately unconfigured. Owner-supplied proposals still use the authenticated draft API. */
export default function AIStudio({ onSaved }: { onSaved?: () => Promise<void> }) {
  const a = useAdminText();
  const [kind, setKind] = useState<ContentKind>('articles');
  const [instruction, setInstruction] = useState('');
  const [input, setInput] = useState('');
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [baseSha, setBaseSha] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const reset = () => { setProposal(null); setSaved(''); setError(''); };
  const validate = async () => {
    setBusy(true); reset();
    try {
      if (input.length > 120_000) throw new Error(a('validation'));
      const file = await adminApi.read(collectionPath(kind));
      const collection = parseCollection(kind, JSON.parse(file.content));
      const raw = JSON.parse(input) as unknown;
      const candidate = raw && typeof raw === 'object' && 'slug' in raw ? raw.slug : undefined;
      const previous = collection.items.find((item) => item.slug === candidate);
      const result = reviewProposal(kind, raw, previous);
      const drafts = await adminApi.draftList();
      if (drafts.drafts.some((draft) => draft.kind === kind && draft.slug === result.item.slug)) throw new Error(a('existingDraft'));
      setProposal(result); setBaseSha(file.sha);
    } catch (cause) { setError(ownerError(cause, a('validation'))); }
    finally { setBusy(false); }
  };
  const save = async () => {
    if (!proposal || !proposal.changes.length) return;
    setBusy(true); setError('');
    try {
      await adminApi.draftSave(kind, proposal.item.slug, proposal.item, baseSha, null);
      setSaved(proposal.item.slug); setProposal(null); await onSaved?.();
    } catch (cause) { setError(ownerError(cause, a('validation'))); }
    finally { setBusy(false); }
  };
  return <div className="admin-ai-page"><div className="admin-page-heading"><div><span className="admin-eyebrow">AlahPanda Labs · CMS V2</span><h1>{a('studio')}</h1><p>{a('aiUnavailable')}</p></div><Sparkles aria-hidden="true"/></div>
    <section className="admin-panel"><h2>{a('prompt')}</h2><label className="admin-field">{a('prompt')}<textarea value={instruction} onChange={(event) => setInstruction(event.target.value)} disabled placeholder={a('noProvider')} rows={3}/></label><div className="admin-ai-actions">{actions.map((action) => <button key={action} type="button" disabled title={a('noProvider')}>{a(action)}</button>)}</div><p className="admin-note">{a('noProvider')}</p></section>
    <section className="admin-panel"><h2>{a('proposal')}</h2><p>{a('proposalHelp')}</p><label className="admin-field">{a('collection')}<select value={kind} onChange={(event) => { setKind(event.target.value as ContentKind); reset(); }}>{CONTENT_KINDS.map((choice) => <option key={choice} value={choice}>{choice}</option>)}</select></label><label className="admin-field">{a('proposalInput')}<textarea value={input} onChange={(event) => { setInput(event.target.value); reset(); }} rows={6} spellCheck={false}/></label><button type="button" className="admin-button admin-button-secondary" disabled={!input.trim() || busy} onClick={() => void validate()}>{a('proposalReview')}</button>
      {error && <p role="alert" className="admin-error">{error}</p>}{saved && <p role="status">{a('draftSaved')} <Link to={`/admin/editor/${kind === 'projects' ? 'modpacks' : kind}?entry=${encodeURIComponent(saved)}`}>{a('open')}</Link></p>}
      {proposal && <div className="admin-proposal" aria-label={a('previewChanges')}><h3>{a('previewChanges')}: {kind}/{proposal.item.slug}</h3>{proposal.changes.length ? <div className="admin-table-wrap"><table><thead><tr><th>{a('field')}</th><th>{a('before')}</th><th>{a('after')}</th></tr></thead><tbody>{proposal.changes.map((change) => <tr key={change.field}><th scope="row">{change.field}</th><td><pre>{change.previous}</pre></td><td><pre>{change.proposed}</pre></td></tr>)}</tbody></table></div> : <p>{a('noChanges')}</p>}<div className="admin-ai-actions"><button className="admin-button admin-button-primary" disabled={busy || !proposal.changes.length} onClick={() => void save()}>{a('saveDraft')}</button><button className="admin-button admin-button-secondary" onClick={reset}>{a('discard')}</button></div><p>{a('releaseInfo')}</p></div>}</section>
  </div>;
}
