-- ============================================================
-- AtomQuest Goal Setting & Tracking Portal — SAFE PHASE 1 SCHEMA
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUM TYPES (SAFE)
-- ============================================================

DO $$
BEGIN
  CREATE TYPE user_role AS ENUM ('employee', 'manager', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE uom_type AS ENUM ('numeric_min', 'numeric_max', 'timeline', 'zero');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE goal_sheet_status AS ENUM ('draft', 'submitted', 'approved', 'returned');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE goal_status AS ENUM ('active', 'locked');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE approval_action AS ENUM ('approved', 'returned');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- PROFILES
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role user_role not null default 'employee',
  manager_id uuid references public.profiles(id),
  department text,
  created_at timestamptz default now()
);

-- ============================================================
-- THRUST AREAS
-- ============================================================

create table if not exists public.thrust_areas (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

insert into public.thrust_areas (name)
values
  ('Revenue Growth'),
  ('Cost Optimisation'),
  ('Customer Satisfaction'),
  ('Employee Development'),
  ('Process Improvement'),
  ('Innovation'),
  ('Safety & Compliance'),
  ('Digital Transformation')
on conflict (name) do nothing;

-- ============================================================
-- GOAL CYCLES
-- ============================================================

create table if not exists public.goal_cycles (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  year int not null,
  is_active boolean default true,
  opens_at date not null,
  closes_at date,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

insert into public.goal_cycles
(name, year, opens_at, closes_at)
values
('FY 2025-26 Goal Setting', 2025, '2025-05-01', '2025-06-30')
on conflict do nothing;

-- ============================================================
-- GOAL SHEETS
-- ============================================================

create table if not exists public.goal_sheets (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid not null references public.profiles(id),
  cycle_id uuid not null references public.goal_cycles(id),
  status goal_sheet_status not null default 'draft',
  submitted_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (employee_id, cycle_id)
);

-- ============================================================
-- GOALS
-- ============================================================

create table if not exists public.goals (
  id uuid primary key default uuid_generate_v4(),
  goal_sheet_id uuid not null references public.goal_sheets(id) on delete cascade,
  thrust_area_id uuid references public.thrust_areas(id),
  title text not null,
  description text,
  uom_type uom_type not null,
  target_value numeric,
  target_date date,
  weightage numeric not null check (weightage >= 10 and weightage <= 100),
  status goal_status default 'active',
  is_shared boolean default false,
  shared_from_id uuid references public.goals(id),
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- GOAL APPROVALS
-- ============================================================

create table if not exists public.goal_approvals (
  id uuid primary key default uuid_generate_v4(),
  goal_sheet_id uuid not null references public.goal_sheets(id),
  manager_id uuid not null references public.profiles(id),
  action approval_action not null,
  comment text,
  acted_at timestamptz default now()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================

create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  table_name text not null,
  record_id uuid not null,
  changed_by uuid references public.profiles(id),
  change_type text not null,
  old_value jsonb,
  new_value jsonb,
  changed_at timestamptz default now()
);

-- ============================================================
-- ENABLE RLS
-- ============================================================

alter table public.profiles enable row level security;
alter table public.thrust_areas enable row level security;
alter table public.goal_cycles enable row level security;
alter table public.goal_sheets enable row level security;
alter table public.goals enable row level security;
alter table public.goal_approvals enable row level security;
alter table public.audit_logs enable row level security;

-- ============================================================
-- DROP OLD POLICIES (SAFE)
-- ============================================================

drop policy if exists "Profiles readable by authenticated" on public.profiles;
drop policy if exists "Profiles updatable by owner" on public.profiles;

drop policy if exists "Thrust areas readable" on public.thrust_areas;
drop policy if exists "Thrust areas writable by admin" on public.thrust_areas;

drop policy if exists "Cycles readable" on public.goal_cycles;
drop policy if exists "Cycles writable by admin" on public.goal_cycles;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================

create policy "Profiles readable by authenticated"
on public.profiles
for select
using (auth.uid() IS NOT NULL);

create policy "Profiles updatable by owner"
on public.profiles
for update
using (auth.uid() = id);

-- ============================================================
-- THRUST AREA POLICIES
-- ============================================================

create policy "Thrust areas readable"
on public.thrust_areas
for select
using (auth.uid() IS NOT NULL);

create policy "Thrust areas writable by admin"
on public.thrust_areas
for insert
with check (
  exists (
    select 1
    from public.profiles
    where id = auth.uid()
    and role = 'admin'
  )
);

-- ============================================================
-- GOAL CYCLE POLICIES
-- ============================================================

create policy "Cycles readable"
on public.goal_cycles
for select
using (auth.uid() IS NOT NULL);

create policy "Cycles writable by admin"
on public.goal_cycles
for all
using (
  exists (
    select 1
    from public.profiles
    where id = auth.uid()
    and role = 'admin'
  )
);

-- ============================================================
-- UPDATED_AT FUNCTION
-- ============================================================

create or replace function update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- SAFE TRIGGERS
-- ============================================================

drop trigger if exists trg_goal_sheets_updated_at on public.goal_sheets;
drop trigger if exists trg_goals_updated_at on public.goals;

create trigger trg_goal_sheets_updated_at
before update on public.goal_sheets
for each row
execute function update_updated_at();

create trigger trg_goals_updated_at
before update on public.goals
for each row
execute function update_updated_at();

-- ============================================================
-- INSERT DEMO USERS
-- ============================================================

insert into public.profiles
(id, full_name, email, role, department)
values
(
  '8254b37e-5fdc-4011-99b5-8f36b853a3cb',
  'Alice Employee',
  'alice@demo.com',
  'employee',
  'Sales'
),
(
  '23521bbd-2e01-4049-94fb-38813187704c',
  'Bob Manager',
  'bob@demo.com',
  'manager',
  'Sales'
),
(
  '1a663405-9ca6-4ccd-a0e9-7bf6bfc1acb3',
  'Carol Admin',
  'carol@demo.com',
  'admin',
  'HR'
)
on conflict (id) do nothing;

-- ============================================================
-- ASSIGN MANAGER
-- ============================================================

update public.profiles
set manager_id = '23521bbd-2e01-4049-94fb-38813187704c'
where email = 'alice@demo.com';

-- ============================================================
-- VERIFY DATA
-- ============================================================

SELECT
  employee.full_name AS employee_name,
  employee.role,
  employee.department,
  manager.full_name AS manager_name
FROM public.profiles employee
LEFT JOIN public.profiles manager
ON employee.manager_id = manager.id;