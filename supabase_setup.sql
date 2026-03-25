-- =============================================================================
-- MaxOut Workout Tracker — Supabase Database Setup
-- Run this entire script in: Supabase Dashboard → SQL Editor → New Query → Run
-- =============================================================================

-- 1. TABLES

create table if not exists workouts (
  id            text        primary key,
  user_id       uuid        not null references auth.users on delete cascade,
  date          text        not null,
  muscle_groups jsonb,
  exercises     jsonb,
  created_at    timestamptz default now()
);

create table if not exists routines (
  id            text  primary key,
  user_id       uuid  not null references auth.users on delete cascade,
  name          text,
  muscle_groups jsonb,
  exercises     jsonb
);

create table if not exists bodyweights (
  id      text    primary key,
  user_id uuid    not null references auth.users on delete cascade,
  date    text,
  weight  float8
);

create table if not exists goals (
  id             text    primary key,
  user_id        uuid    not null references auth.users on delete cascade,
  exercise_name  text,
  target_weight  float8,
  deadline_date  text
);

create table if not exists programs (
  id             text   primary key,
  user_id        uuid   not null references auth.users on delete cascade,
  name           text,
  length_in_days int4,
  schedule       jsonb
);

create table if not exists active_program (
  user_id    uuid  primary key references auth.users on delete cascade,
  program_id text,
  start_date text
);

create table if not exists favorites (
  user_id   uuid  primary key references auth.users on delete cascade,
  exercises jsonb
);

-- 2. ROW-LEVEL SECURITY (each user can only access their own rows)

alter table workouts      enable row level security;
alter table routines      enable row level security;
alter table bodyweights   enable row level security;
alter table goals         enable row level security;
alter table programs      enable row level security;
alter table active_program enable row level security;
alter table favorites     enable row level security;

create policy "Users manage own workouts"       on workouts       for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own routines"       on routines       for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own bodyweights"    on bodyweights    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own goals"          on goals          for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own programs"       on programs       for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own active program" on active_program for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own favorites"      on favorites      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
