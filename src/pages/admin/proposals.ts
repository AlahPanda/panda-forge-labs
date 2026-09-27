import { parseItem, type ContentKind, type ValidatedItem } from '@/content/v2/schema';

export type ProposedChange = { field: string; previous: string; proposed: string };
export type Proposal = { item: ValidatedItem; changes: ProposedChange[] };

// The future provider must return untrusted data to this validator; it never receives publish credentials.
export interface ContentProposalProvider {
  propose(request: { instruction: string; kind: ContentKind; slug?: string }): Promise<unknown>;
}

const printable = (value: unknown) => value === undefined ? '—' : typeof value === 'string' ? value : JSON.stringify(value, null, 2);
const object = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);

/** A proposal is an entire schema-valid V2 item. Missing properties cannot silently delete existing fields. */
export function reviewProposal(kind: ContentKind, raw: unknown, current?: ValidatedItem): Proposal {
  const item = parseItem(kind, raw);
  if (current && item.slug !== current.slug) throw new Error('The proposal changed the published slug.');
  if (current && Object.keys(current).some((key) => item[key] === undefined)) throw new Error('The proposal omits existing fields; copy the whole current item before editing.');
  const changes: ProposedChange[] = [];
  const visit = (field: string, previous: unknown, proposed: unknown) => {
    if (object(previous) && object(proposed) && Object.keys(previous).some((key) => !(key in proposed))) throw new Error(`The proposal omits an existing field in ${field || 'item'}.`);
    if (object(proposed) && (!previous || object(previous))) {
      for (const key of Object.keys(proposed)) visit(field ? `${field}.${key}` : key, object(previous) ? previous[key] : undefined, proposed[key]);
    } else if (printable(previous) !== printable(proposed)) changes.push({ field, previous: printable(previous), proposed: printable(proposed) });
  };
  visit('', current, item);
  return { item, changes };
}
