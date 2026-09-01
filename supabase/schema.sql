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
  audience text,
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
-- Seed data — mirrors the real content currently live on
-- summitperformancelab.vercel.app, so the admin panel starts populated
-- with accurate data instead of placeholders. Edit freely via /admin.
-- ============================================================
insert into coaches (name, title, certs, bio, sort_order) values
  ('Coach Andy', 'Head Coach & Founder', array[]::text[],
   'Founder of Summit Performance Lab with extensive tactical fitness experience. Dedicated to building world-class training programs that help first responders and military personnel perform at their peak while preventing injuries and extending careers. "Train like your life depends on it."',
   1),
  ('Coach Jones', 'Tactical Strength & Conditioning Specialist', array['CSCS', 'TSAC-F', 'USAW Sports Performance Coach', 'USR Certified Speed Coach'],
   'Provides world-class tactical strength & conditioning to first responders and military in Alaska. Over 10 years coaching Army, Air Force, collegiate, and private sectors — including top-10 Army Best Ranger & Best Sapper teams, Special Forces candidates, and F-22 pilot performance programs. "Maximize performance, build resilience, stay mission-ready."',
   2),
  ('Coach Nic', 'Military Fitness Specialist & Youth Development Coach', array[]::text[],
   'With 12 years of military experience maintaining the F-22 Raptor across multiple deployments, Nic is a dedicated Physical Training Leader who has programmed and managed the Fitness Improvement Program. Also experienced in adult strength coaching, 1:1 personal training, and youth sports development. "Live for something greater than yourself."',
   3);

insert into programs (name, type, price_cents, billing_interval, audience, description, features, sort_order) values
  ('Proactive Fit', 'subscription', 3000, 'month', 'For First Responders',
   'Tactical Athlete Training',
   array['Year-round live programming', '5 training sessions per week', 'Quarterly assessments & tracking', 'Power, speed, strength & conditioning', 'Mobility & recovery protocols'], 1),
  ('Total Force Strength & Conditioning', 'subscription', 3500, 'month', 'For Military',
   'Military Tactical Training',
   array['6 training days per week', 'Tactical conditioning & strength work', 'Functional mobility & recovery', 'Purpose-driven training blocks'], 2);
