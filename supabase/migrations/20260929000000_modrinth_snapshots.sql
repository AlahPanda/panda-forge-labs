create table if not exists public.modrinth_snapshots (
  project_slug text primary key,
  project_id text not null,
  snapshot jsonb not null,
  fetched_at timestamptz not null
);
alter table public.modrinth_snapshots enable row level security;
revoke all on public.modrinth_snapshots from anon, authenticated;
grant select, insert, update on public.modrinth_snapshots to service_role;
-- Only the server-side service role reads and writes this table.
