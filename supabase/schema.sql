create table if not exists trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  source text default 'manual',
  mt5_ticket text unique,
  symbol text,
  side text check (side in ('buy','sell','long','short')),
  lot numeric default 0,
  entry_price numeric default 0,
  exit_price numeric default 0,
  stop_loss numeric default 0,
  take_profit numeric default 0,
  pnl numeric default 0,
  commission numeric default 0,
  swap numeric default 0,
  setup text,
  mistake text,
  emotion_before text,
  emotion_after text,
  screenshot_url text,
  notes text,
  status text default 'open',
  opened_at timestamptz default now(),
  closed_at timestamptz,
  created_at timestamptz default now()
);

alter table trades enable row level security;

create policy "Users can read own trades"
on trades for select
using (auth.uid() = user_id or user_id is null);

create policy "Users can insert own trades"
on trades for insert
with check (auth.uid() = user_id or user_id is null);

create policy "Users can update own trades"
on trades for update
using (auth.uid() = user_id or user_id is null);

create table if not exists journal_screenshots (
  id uuid primary key default gen_random_uuid(),
  trade_id uuid references trades(id) on delete cascade,
  url text not null,
  created_at timestamptz default now()
);

create bucket if not exists trade-screenshots;
