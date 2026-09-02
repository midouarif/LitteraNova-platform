-- Create reading_progress table
create table public.reading_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete cascade not null,
  work_id uuid references public.works(id) on delete cascade not null,
  scroll_percentage numeric(5,2) default 0,
  updated_at timestamp with time zone default now(),
  unique(student_id, work_id)
);

-- Enable RLS
alter table public.reading_progress enable row level security;

-- Policies for reading_progress
create policy "Students can view their own progress"
  on public.reading_progress for select
  using ( auth.uid() = student_id );

create policy "Students can insert their own progress"
  on public.reading_progress for insert
  with check ( auth.uid() = student_id );

create policy "Students can update their own progress"
  on public.reading_progress for update
  using ( auth.uid() = student_id );


-- Create annotations table
create table public.annotations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete cascade not null,
  work_id uuid references public.works(id) on delete cascade not null,
  type text check (type in ('highlight', 'note', 'bookmark')) not null,
  text_selection text,
  start_offset integer,
  end_offset integer,
  note_content text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.annotations enable row level security;

-- Policies for annotations
create policy "Students can view their own annotations"
  on public.annotations for select
  using ( auth.uid() = student_id );

create policy "Students can insert their own annotations"
  on public.annotations for insert
  with check ( auth.uid() = student_id );

create policy "Students can update their own annotations"
  on public.annotations for update
  using ( auth.uid() = student_id );

create policy "Students can delete their own annotations"
  on public.annotations for delete
  using ( auth.uid() = student_id );
