-- Private editorial workspace. Only the Edge Function's service role may access this table.
create table if not exists public.cms_drafts (
  kind text not null check (kind in ('projects','releases','launchers','articles','guides','faq','homepage','settings')),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  content jsonb not null,
  base_sha text,
  revision bigint not null default 1,
  updated_at timestamptz not null default now(),
  primary key (kind, slug)
);
alter table public.cms_drafts enable row level security;
revoke all on public.cms_drafts from anon, authenticated;
grant select, insert, update, delete on public.cms_drafts to service_role;
-- No RLS policies: browser clients cannot read or write drafts.
