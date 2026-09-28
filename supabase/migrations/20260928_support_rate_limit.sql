-- Private, persistent quota for the public support endpoint. Only the server service role can call it.
create table if not exists public.support_rate_limit (
  fingerprint text not null,
  window_start timestamptz not null,
  attempts integer not null default 0,
  primary key (fingerprint, window_start)
);
alter table public.support_rate_limit enable row level security;
revoke all on public.support_rate_limit from anon, authenticated;

create or replace function public.consume_support_quota(fingerprint text)
returns boolean language plpgsql security definer set search_path = public as $$
declare current_attempts integer;
begin
  if fingerprint !~ '^[0-9a-f]{64}$' then return false; end if;
  insert into public.support_rate_limit as quota (fingerprint, window_start, attempts)
  values (fingerprint, date_trunc('hour', now()), 1)
  on conflict (fingerprint, window_start) do update set attempts = quota.attempts + 1
  returning attempts into current_attempts;
  return current_attempts <= 3;
end $$;
revoke all on function public.consume_support_quota(text) from public, anon, authenticated;
grant execute on function public.consume_support_quota(text) to service_role;
