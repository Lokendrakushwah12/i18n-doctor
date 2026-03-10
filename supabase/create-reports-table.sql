-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- Reports table (works for both anonymous and logged-in users)
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  repo_url text not null,
  repo_owner text not null,
  repo_name text not null,
  report jsonb not null,
  user_id uuid references auth.users(id), -- nullable = anonymous scan
  created_at timestamptz default now()
);

-- Index for looking up reports by repo
create index if not exists idx_reports_repo on reports(repo_owner, repo_name);

-- Index for user scan history
create index if not exists idx_reports_user on reports(user_id) where user_id is not null;

-- Enable RLS
alter table reports enable row level security;

-- Anyone can read any report (for shareable URLs)
create policy "Public reports are viewable by anyone"
  on reports for select using (true);

-- Anyone (including anon) can insert
create policy "Anyone can create a report"
  on reports for insert with check (true);
