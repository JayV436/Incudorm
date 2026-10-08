-- =====================================================================
-- Incudorm: Supabase schema
-- Run this whole file once in Supabase: SQL Editor -> New query -> Run.
-- It is safe to run again later (it uses "if not exists" / "create or replace").
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Helpers
-- ---------------------------------------------------------------------

-- Skills are stored as text[]: at most N items, each 1 to 40 characters.
create or replace function public.valid_skills(s text[], max_items int)
returns boolean
language sql
immutable
as $$
  select s is not null
    and coalesce(array_length(s, 1), 0) <= max_items
    and not exists (select 1 from unnest(s) x where char_length(x) not between 1 and 40);
$$;

-- ---------------------------------------------------------------------
-- 1. Tables
-- ---------------------------------------------------------------------

-- One row per confirmed student. Created automatically by a trigger on auth.users.
-- The email address stays in auth.users and is never exposed to other students.
create table if not exists public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  name           text        not null check (char_length(name) between 1 and 80),
  college        text        not null default '' check (char_length(college) <= 120),
  course         text        not null default '' check (char_length(course) <= 120),
  year           text        not null default '1st year' check (char_length(year) <= 20),
  bio            text        not null default '' check (char_length(bio) <= 280),
  skills         text[]      not null default '{}' check (public.valid_skills(skills, 10)),
  hours_per_week int         not null default 6 check (hours_per_week between 1 and 60),
  github         text        not null default '' check (char_length(github) <= 200),
  linkedin       text        not null default '' check (char_length(linkedin) <= 200),
  website        text        not null default '' check (char_length(website) <= 200),
  goal           text        not null default 'both' check (goal in ('both', 'post', 'join')),
  onboarded      boolean     not null default false,
  portfolio      jsonb       not null default '[]'
                 check (jsonb_typeof(portfolio) = 'array' and jsonb_array_length(portfolio) <= 20),
  created_at     timestamptz not null default now()
);

create table if not exists public.projects (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid        not null references public.profiles (id) on delete cascade,
  title          text        not null check (char_length(title) between 3 and 80),
  pitch          text        not null check (char_length(pitch) between 10 and 140),
  description    text        not null check (char_length(description) between 30 and 5000),
  stage          text        not null check (stage in ('Just an idea', 'Prototype', 'Validating', 'Building')),
  hours_per_week int         not null check (hours_per_week between 1 and 60),
  color          text        not null default 'sun'
                 check (color in ('sun', 'mint', 'lilac', 'pink', 'sky', 'orange', 'lime', 'coral')),
  status         text        not null default 'open' check (status in ('open', 'closed')),
  created_at     timestamptz not null default now()
);

create table if not exists public.project_roles (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid   not null references public.projects (id) on delete cascade,
  title      text   not null check (char_length(title) between 1 and 60),
  skills     text[] not null default '{}' check (public.valid_skills(skills, 6)),
  position   int    not null default 0
);

-- Students who joined a project (accepted applicants). The owner is not listed here.
create table if not exists public.project_members (
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  role_id    uuid references public.project_roles (id) on delete set null,
  joined_at  timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table if not exists public.applications (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects (id) on delete cascade,
  role_id      uuid references public.project_roles (id) on delete set null,
  applicant_id uuid not null references public.profiles (id) on delete cascade,
  message      text not null check (char_length(message) between 20 and 2000),
  status       text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at   timestamptz not null default now(),
  unique (project_id, applicant_id)
);

create table if not exists public.threads (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.thread_participants (
  thread_id uuid not null references public.threads (id) on delete cascade,
  user_id   uuid not null references public.profiles (id) on delete cascade,
  primary key (thread_id, user_id)
);

-- sender_id is null for system notes such as "Aanya joined Study buddy as Frontend developer".
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  thread_id  uuid not null references public.threads (id) on delete cascade,
  sender_id  uuid references public.profiles (id) on delete set null,
  body       text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

-- Optional: limit sign up to college email domains.
-- Empty table = anyone can sign up. Add rows to turn the check on (see the end of this file).
create table if not exists public.allowed_email_domains (
  domain text primary key check (domain = lower(domain) and domain !~ '[@[:space:]]')
);

-- ---------------------------------------------------------------------
-- 2. Indexes
-- ---------------------------------------------------------------------
create index if not exists projects_owner_idx        on public.projects (owner_id);
create index if not exists projects_created_idx      on public.projects (created_at desc);
create index if not exists project_roles_project_idx on public.project_roles (project_id);
create index if not exists project_members_user_idx  on public.project_members (user_id);
create index if not exists applications_project_idx  on public.applications (project_id);
create index if not exists applications_applicant_idx on public.applications (applicant_id);
create index if not exists thread_participants_user_idx on public.thread_participants (user_id);
create index if not exists messages_thread_idx       on public.messages (thread_id, created_at);

-- ---------------------------------------------------------------------
-- 3. Helper functions used by policies and RPCs
-- ---------------------------------------------------------------------

-- Is the signed in student in this conversation?
create or replace function public.is_thread_member(t uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.thread_participants
    where thread_id = t and user_id = (select auth.uid())
  );
$$;

-- Is this student the owner or a member of the project?
create or replace function public.is_project_party(proj uuid, uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.projects where id = proj and owner_id = uid)
      or exists (select 1 from public.project_members where project_id = proj and user_id = uid);
$$;

-- Internal: find the conversation between two students (about one project, or a direct chat), or create it.
-- Not callable from the app. Only the functions below use it.
create or replace function public.get_or_create_thread(a uuid, b uuid, proj uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v uuid;
begin
  perform pg_advisory_xact_lock(hashtext(least(a, b)::text || greatest(a, b)::text || coalesce(proj::text, '')));

  select t.id into v
  from public.threads t
  where t.project_id is not distinct from proj
    and exists (select 1 from public.thread_participants x where x.thread_id = t.id and x.user_id = a)
    and exists (select 1 from public.thread_participants y where y.thread_id = t.id and y.user_id = b)
  limit 1;

  if v is null then
    insert into public.threads (project_id) values (proj) returning id into v;
    insert into public.thread_participants (thread_id, user_id) values (v, a), (v, b);
  end if;
  return v;
end;
$$;

-- ---------------------------------------------------------------------
-- 4. Sign up: college email check and automatic profile creation
-- ---------------------------------------------------------------------

-- True when the email ends with one of the allowed domains, or when no domains are listed.
-- Matches "edu" against "student@uni.edu" and "student@cs.uni.edu" but not "student@notedu.com".
create or replace function public.is_college_email(p_email text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  d text := lower(split_part(btrim(p_email), '@', 2));
begin
  if not exists (select 1 from public.allowed_email_domains) then
    return true;
  end if;
  return exists (
    select 1 from public.allowed_email_domains a
    where d = a.domain or right(d, char_length(a.domain) + 1) = '.' || a.domain
  );
end;
$$;

create or replace function public.enforce_college_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_college_email(new.email) then
    raise exception 'Sign up with your college email address.';
  end if;
  return new;
end;
$$;

-- Create the student's profile once their email is confirmed, so unconfirmed sign ups never appear in the app.
create or replace function public.handle_user_confirmed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is null then
    return new;
  end if;

  insert into public.profiles (id, name, college, course, year)
  values (
    new.id,
    left(coalesce(nullif(btrim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1)), 80),
    left(coalesce(btrim(new.raw_user_meta_data ->> 'college'), ''), 120),
    left(coalesce(btrim(new.raw_user_meta_data ->> 'course'), ''), 120),
    left(coalesce(nullif(btrim(new.raw_user_meta_data ->> 'year'), ''), '1st year'), 20)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists enforce_college_email_on_signup on auth.users;
create trigger enforce_college_email_on_signup
  before insert on auth.users
  for each row execute function public.enforce_college_email();

drop trigger if exists create_profile_on_insert on auth.users;
create trigger create_profile_on_insert
  after insert on auth.users
  for each row execute function public.handle_user_confirmed();

drop trigger if exists create_profile_on_confirm on auth.users;
create trigger create_profile_on_confirm
  after update of email_confirmed_at on auth.users
  for each row
  when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute function public.handle_user_confirmed();

-- ---------------------------------------------------------------------
-- 5. Row level security
-- Every table has RLS on. A student can only do what a policy below allows.
-- ---------------------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.projects            enable row level security;
alter table public.project_roles       enable row level security;
alter table public.project_members     enable row level security;
alter table public.applications        enable row level security;
alter table public.threads             enable row level security;
alter table public.thread_participants enable row level security;
alter table public.messages            enable row level security;
alter table public.allowed_email_domains enable row level security;  -- no policies: only the functions above read it

-- profiles: every signed in student can read profiles; you can create and edit only your own.
drop policy if exists "profiles are readable by students" on public.profiles;
create policy "profiles are readable by students" on public.profiles
  for select to authenticated using (true);

drop policy if exists "students create their own profile" on public.profiles;
create policy "students create their own profile" on public.profiles
  for insert to authenticated with check (id = (select auth.uid()));

drop policy if exists "students edit their own profile" on public.profiles;
create policy "students edit their own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- projects: readable by students; only the owner can create, edit or delete.
drop policy if exists "projects are readable by students" on public.projects;
create policy "projects are readable by students" on public.projects
  for select to authenticated using (true);

drop policy if exists "owners create projects" on public.projects;
create policy "owners create projects" on public.projects
  for insert to authenticated with check (owner_id = (select auth.uid()));

drop policy if exists "owners edit projects" on public.projects;
create policy "owners edit projects" on public.projects
  for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

drop policy if exists "owners delete projects" on public.projects;
create policy "owners delete projects" on public.projects
  for delete to authenticated using (owner_id = (select auth.uid()));

-- project_roles: readable by students; only the project owner can change them.
drop policy if exists "roles are readable by students" on public.project_roles;
create policy "roles are readable by students" on public.project_roles
  for select to authenticated using (true);

drop policy if exists "owners add roles" on public.project_roles;
create policy "owners add roles" on public.project_roles
  for insert to authenticated
  with check (exists (select 1 from public.projects p where p.id = project_roles.project_id and p.owner_id = (select auth.uid())));

drop policy if exists "owners edit roles" on public.project_roles;
create policy "owners edit roles" on public.project_roles
  for update to authenticated
  using (exists (select 1 from public.projects p where p.id = project_roles.project_id and p.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.projects p where p.id = project_roles.project_id and p.owner_id = (select auth.uid())));

drop policy if exists "owners delete roles" on public.project_roles;
create policy "owners delete roles" on public.project_roles
  for delete to authenticated
  using (exists (select 1 from public.projects p where p.id = project_roles.project_id and p.owner_id = (select auth.uid())));

-- project_members: readable by students. Rows are only added by respond_to_application().
drop policy if exists "members are readable by students" on public.project_members;
create policy "members are readable by students" on public.project_members
  for select to authenticated using (true);

-- applications: the applicant and the project owner can read; you can apply to open projects that are not
-- yours; you can withdraw a pending application. The owner answers through respond_to_application().
drop policy if exists "applications are visible to the two sides" on public.applications;
create policy "applications are visible to the two sides" on public.applications
  for select to authenticated
  using (
    applicant_id = (select auth.uid())
    or exists (select 1 from public.projects p where p.id = applications.project_id and p.owner_id = (select auth.uid()))
  );

drop policy if exists "students apply to open projects" on public.applications;
create policy "students apply to open projects" on public.applications
  for insert to authenticated
  with check (
    applicant_id = (select auth.uid())
    and status = 'pending'
    and exists (
      select 1 from public.projects p
      where p.id = applications.project_id and p.status = 'open' and p.owner_id <> (select auth.uid())
    )
    and (
      role_id is null
      or exists (select 1 from public.project_roles r where r.id = applications.role_id and r.project_id = applications.project_id)
    )
  );

drop policy if exists "applicants withdraw pending applications" on public.applications;
create policy "applicants withdraw pending applications" on public.applications
  for delete to authenticated
  using (applicant_id = (select auth.uid()) and status = 'pending');

-- Conversations: only the people in them can see them. Threads are created by start_thread()
-- and respond_to_application(). System notes are written by respond_to_application().
drop policy if exists "members read their threads" on public.threads;
create policy "members read their threads" on public.threads
  for select to authenticated using (public.is_thread_member(id));

drop policy if exists "members read participants" on public.thread_participants;
create policy "members read participants" on public.thread_participants
  for select to authenticated using (public.is_thread_member(thread_id));

drop policy if exists "members read messages" on public.messages;
create policy "members read messages" on public.messages
  for select to authenticated using (public.is_thread_member(thread_id));

drop policy if exists "members send messages" on public.messages;
create policy "members send messages" on public.messages
  for insert to authenticated
  with check (sender_id = (select auth.uid()) and public.is_thread_member(thread_id));

-- ---------------------------------------------------------------------
-- 6. Functions the app calls (supabase.rpc)
-- ---------------------------------------------------------------------

-- Post an idea and its roles in one step. p_roles looks like [{"title": "Frontend developer", "skills": ["Frontend"]}].
-- Runs as the signed in student, so the policies above still apply.
create or replace function public.create_project(
  p_title text,
  p_pitch text,
  p_description text,
  p_stage text,
  p_hours int,
  p_color text,
  p_roles jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid;
  r jsonb;
  i int := 0;
begin
  if auth.uid() is null then
    raise exception 'Log in to post an idea.';
  end if;
  if jsonb_typeof(p_roles) <> 'array' or jsonb_array_length(p_roles) not between 1 and 6 then
    raise exception 'Add between 1 and 6 roles.';
  end if;

  insert into public.projects (owner_id, title, pitch, description, stage, hours_per_week, color)
  values (auth.uid(), btrim(p_title), btrim(p_pitch), btrim(p_description), p_stage, p_hours, p_color)
  returning id into v_id;

  for r in select * from jsonb_array_elements(p_roles) loop
    insert into public.project_roles (project_id, title, skills, position)
    values (
      v_id,
      btrim(r ->> 'title'),
      coalesce(array(select jsonb_array_elements_text(coalesce(r -> 'skills', '[]'::jsonb))), '{}'),
      i
    );
    i := i + 1;
  end loop;

  return v_id;
end;
$$;

-- The owner accepts or declines a request. Accepting adds the student to the team and opens a chat.
create or replace function public.respond_to_application(p_application uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  a        public.applications;
  p        public.projects;
  v_thread uuid;
  v_name   text;
  v_role   text;
begin
  if auth.uid() is null then
    raise exception 'Log in first.';
  end if;
  if p_status not in ('accepted', 'declined') then
    raise exception 'Invalid answer.';
  end if;

  select * into a from public.applications where id = p_application for update;
  if not found then
    raise exception 'This request no longer exists.';
  end if;

  select * into p from public.projects where id = a.project_id;
  if p.owner_id <> auth.uid() then
    raise exception 'Only the idea owner can answer requests.';
  end if;
  if a.status <> 'pending' then
    raise exception 'This request was already answered.';
  end if;

  update public.applications set status = p_status where id = a.id;

  if p_status = 'accepted' then
    insert into public.project_members (project_id, user_id, role_id)
    values (p.id, a.applicant_id, a.role_id)
    on conflict do nothing;

    v_thread := public.get_or_create_thread(p.owner_id, a.applicant_id, p.id);
    select name  into v_name from public.profiles      where id = a.applicant_id;
    select title into v_role from public.project_roles where id = a.role_id;

    insert into public.messages (thread_id, sender_id, body)
    values (v_thread, null, v_name || ' joined ' || p.title || coalesce(' as ' || v_role, '') || '. Say hello.');
  end if;
end;
$$;

-- Open (or find) a chat with another student. For a project chat, both must be on that project's team.
create or replace function public.start_thread(p_other uuid, p_project uuid default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
begin
  if me is null then
    raise exception 'Log in first.';
  end if;
  if p_other = me then
    raise exception 'You can''t message yourself.';
  end if;
  if not exists (select 1 from public.profiles where id = p_other) then
    raise exception 'That student no longer exists.';
  end if;
  if p_project is not null
     and not (public.is_project_party(p_project, me) and public.is_project_party(p_project, p_other)) then
    raise exception 'You can only chat about a project with its team.';
  end if;

  return public.get_or_create_thread(me, p_other, p_project);
end;
$$;

-- Delete the signed in student and everything they created. Chats they were in are removed for both sides.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
begin
  if me is null then
    raise exception 'Log in first.';
  end if;

  delete from public.threads t
  where exists (select 1 from public.thread_participants p where p.thread_id = t.id and p.user_id = me);

  -- Cascades to the profile, their projects, applications and team memberships.
  delete from auth.users where id = me;
end;
$$;

-- ---------------------------------------------------------------------
-- 7. Permissions
-- Tables: signed in students only, and only the operations the policies allow.
-- Functions: nobody by default, then grant exactly what the app needs.
-- ---------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

revoke all on all tables in schema public from anon, authenticated;
grant select, insert, update          on public.profiles            to authenticated;
grant select, insert, update, delete  on public.projects            to authenticated;
grant select, insert, update, delete  on public.project_roles       to authenticated;
grant select                          on public.project_members     to authenticated;
grant select, insert, delete          on public.applications        to authenticated;
grant select                          on public.threads             to authenticated;
grant select                          on public.thread_participants to authenticated;
grant select, insert                  on public.messages            to authenticated;

revoke all on function public.valid_skills(text[], int)               from public, anon, authenticated;
revoke all on function public.is_thread_member(uuid)                  from public, anon, authenticated;
revoke all on function public.is_project_party(uuid, uuid)            from public, anon, authenticated;
revoke all on function public.get_or_create_thread(uuid, uuid, uuid)  from public, anon, authenticated;
revoke all on function public.is_college_email(text)                  from public, anon, authenticated;
revoke all on function public.enforce_college_email()                 from public, anon, authenticated;
revoke all on function public.handle_user_confirmed()                 from public, anon, authenticated;
revoke all on function public.create_project(text, text, text, text, int, text, jsonb) from public, anon, authenticated;
revoke all on function public.respond_to_application(uuid, text)      from public, anon, authenticated;
revoke all on function public.start_thread(uuid, uuid)                from public, anon, authenticated;
revoke all on function public.delete_my_account()                     from public, anon, authenticated;

grant execute on function public.valid_skills(text[], int)            to authenticated;
grant execute on function public.is_thread_member(uuid)               to authenticated;
grant execute on function public.is_project_party(uuid, uuid)         to authenticated;
-- The sign up page asks this before creating an account, so it must work while logged out.
grant execute on function public.is_college_email(text)               to anon, authenticated;
grant execute on function public.create_project(text, text, text, text, int, text, jsonb) to authenticated;
grant execute on function public.respond_to_application(uuid, text)   to authenticated;
grant execute on function public.start_thread(uuid, uuid)             to authenticated;
grant execute on function public.delete_my_account()                  to authenticated;

-- ---------------------------------------------------------------------
-- 8. Realtime: live updates for chats, requests and new ideas
-- ---------------------------------------------------------------------
do $$
declare
  t text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach t in array array['messages', 'applications', 'threads', 'thread_participants',
                             'project_members', 'projects', 'profiles']
    loop
      if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
      ) then
        execute format('alter publication supabase_realtime add table public.%I', t);
      end if;
    end loop;
  end if;
end
$$;

-- ---------------------------------------------------------------------
-- 9. Optional: students only
-- When you are ready, run these lines (change them to match your colleges) to allow only college emails.
-- "edu" also allows cs.uni.edu. Leave the table empty while you are testing with a personal email.
--
--   insert into public.allowed_email_domains (domain) values ('edu'), ('ac.in'), ('edu.in');
--
-- To turn the check off again:   delete from public.allowed_email_domains;
-- ---------------------------------------------------------------------

-- ---------------------------------------------------------------------
-- 10. User Feedback
-- ---------------------------------------------------------------------
create table if not exists public.feedback (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles (id) on delete set null,
  user_name     text,
  contact_email text,
  category      text not null check (category in ('feature', 'bug', 'college', 'general')),
  rating        int check (rating between 1 and 5),
  message       text not null check (char_length(message) between 5 and 3000),
  created_at    timestamptz not null default now()
);

alter table public.feedback enable row level security;

-- Anyone (signed in or guest) can insert feedback
drop policy if exists "anyone can submit feedback" on public.feedback;
create policy "anyone can submit feedback" on public.feedback
  for insert to anon, authenticated with check (true);

grant insert on public.feedback to anon, authenticated;

