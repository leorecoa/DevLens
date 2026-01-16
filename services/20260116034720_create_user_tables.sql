-- Migration script for creating initial user-related tables

-- 1. Create a shared function to handle 'updated_at' timestamps automatically.
create function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 2. Create the 'users' table to store subscription and usage info.
-- This table is linked to the authentication user.
create table public.users (
  id uuid not null primary key references auth.users(id) on delete cascade,
  tier text not null default 'FREE',
  credits_remaining integer not null default 10,
  total_analyses integer not null default 0,
  updated_at timestamptz not null default now()
);

-- Add trigger to automatically update 'updated_at' on row change.
create trigger on_users_updated
  before update on public.users
  for each row execute procedure public.handle_updated_at();

-- 3. Enable Row Level Security (RLS) for the 'users' table.
alter table public.users enable row level security;

-- Create policy: Users can view and modify only their own data.
create policy "Allow individual user access to their own data"
  on public.users for all
  using (auth.uid() = id);

-- 4. Create the 'user_pipelines' table to store user-specific candidate folders.
create table public.user_pipelines (
  user_id uuid not null primary key references auth.users(id) on delete cascade,
  folders_json jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Add trigger to automatically update 'updated_at' on row change.
create trigger on_user_pipelines_updated
  before update on public.user_pipelines
  for each row execute procedure public.handle_updated_at();

-- 5. Enable RLS for the 'user_pipelines' table.
alter table public.user_pipelines enable row level security;

-- Create policy: Users can view and modify only their own pipeline data.
create policy "Allow individual user access to their own pipelines"
  on public.user_pipelines for all
  using (auth.uid() = user_id);