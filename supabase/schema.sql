-- Summit Performance Labs — Supabase schema
-- Run this once in the Supabase SQL editor (Project > SQL Editor > New Query) after creating the project.
--
-- After running this:
--   1. Go to Authentication > Users and manually create one admin user (email + password)
--      for Andrew to log into /admin with.
--   2. Go to Project Settings > API and copy the Project URL + anon public key into
--      js/supabase-client.js.

-- ============================================================
-- Coaches
-- ============================================================
create table coaches (
  id bigint generated always as identity primary key,
  name text not null,
  title text,
  certs text[] default '{}',
  bio text,
  photo_url text,
  sort_order int not null default 0,
  active boolean not null default true
);

alter table coaches enable row level security;

create policy "Public can read visible coaches"
  on coaches for select
  using (active = true);

create policy "Authenticated can manage coaches"
  on coaches for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================
-- Programs & Pricing
-- ============================================================
create table programs (
  id bigint generated always as identity primary key,
  name text not null,
  type text not null default 'program' check (type in ('subscription', 'program')),
  price_cents int not null default 0,
  billing_interval text not null default 'month' check (billing_interval in ('month', 'year', 'one-time')),
  description text,
  features text[] default '{}',
  stripe_link text,
  sort_order int not null default 0,
  active boolean not null default true
);

alter table programs enable row level security;

create policy "Public can read visible programs"
  on programs for select
  using (active = true);

create policy "Authenticated can manage programs"
  on programs for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================
-- Team / Unit Training Inquiries
-- Anonymous visitors can submit (insert) but never read other submissions.
-- Only the authenticated admin can view or update them.
-- ============================================================
create table team_training_inquiries (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  org_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  team_size text,
  preferred_dates text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'booked', 'closed'))
);

alter table team_training_inquiries enable row level security;

create policy "Public can submit inquiries"
  on team_training_inquiries for insert
  with check (true);

create policy "Authenticated can read inquiries"
  on team_training_inquiries for select
  using (auth.role() = 'authenticated');

create policy "Authenticated can update inquiries"
  on team_training_inquiries for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================
-- Workshop Schedule
-- ============================================================
create table workshops (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  date date not null,
  time text,
  location text,
  signup_link text,
  active boolean not null default true
);

alter table workshops enable row level security;

create policy "Public can read visible workshops"
  on workshops for select
  using (active = true);

create policy "Authenticated can manage workshops"
  on workshops for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================
-- Seed data — placeholders so pages aren't empty before Andrew edits them via /admin
-- ============================================================
insert into coaches (name, title, certs, bio, sort_order) values
  ('Coach Name', 'Head Strength & Conditioning Coach', array['CSCS', 'NSCA-CPT'], 'Add this coach''s background, specialties, and what drives them.', 1),
  ('Coach Name', 'Tactical Performance Specialist', array['TSAC-F', 'EMT'], 'Add this coach''s background, specialties, and what drives them.', 2),
  ('Coach Name', 'Group Fitness & Nutrition Coach', array['NASM-CPT', 'PN1'], 'Add this coach''s background, specialties, and what drives them.', 3);

insert into programs (name, type, price_cents, billing_interval, description, features, sort_order) values
  ('Personal Training', 'subscription', 20000, 'month',
   'One-on-one programming designed around your goals, your body, and your schedule.',
   array['Customized training programs', 'Nutrition & recovery guidance', 'Progress tracking & benchmarks', 'Flexible scheduling'], 1),
  ('Group Classes', 'subscription', 12000, 'month',
   'High-energy, coach-led sessions that build strength, conditioning, and community.',
   array['Structured strength & conditioning', 'Small group format (max 12)', 'Beginner to advanced levels', 'Community accountability'], 2),
  ('Tactical Training', 'program', 30000, 'one-time',
   'Purpose-built conditioning for military, law enforcement, fire, and EMS professionals.',
   array['Job-specific fitness standards', 'Occupational endurance & strength', 'Load-bearing & functional movement', 'Stress-inoculation protocols'], 3);
