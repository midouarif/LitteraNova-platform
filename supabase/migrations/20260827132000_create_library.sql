create table public.works (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  category text check (category in ('roman', 'poesie', 'theatre', 'article', 'memoire', 'these')) not null,
  description text,
  cover_url text,
  created_by uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.works enable row level security;

create policy "Works are viewable by everyone." on public.works
  for select using (true);

create policy "Teachers and admins can insert works." on public.works
  for insert with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role in ('teacher', 'admin')
    )
  );

create policy "Teachers and admins can update works." on public.works
  for update using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role in ('teacher', 'admin')
    )
  );

create policy "Teachers and admins can delete works." on public.works
  for delete using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role in ('teacher', 'admin')
    )
  );

create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  work_id uuid references public.works(id) on delete cascade not null,
  title text not null,
  order_index integer not null,
  content_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.chapters enable row level security;

create policy "Chapters are viewable by everyone." on public.chapters
  for select using (true);

create policy "Teachers and admins can insert chapters." on public.chapters
  for insert with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role in ('teacher', 'admin')
    )
  );

create policy "Teachers and admins can update chapters." on public.chapters
  for update using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role in ('teacher', 'admin')
    )
  );

create policy "Teachers and admins can delete chapters." on public.chapters
  for delete using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role in ('teacher', 'admin')
    )
  );
