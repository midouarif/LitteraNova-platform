-- Create activities table
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references public.profiles(id) on delete cascade not null,
  work_id uuid references public.works(id) on delete cascade not null,
  title text not null,
  published boolean default false,
  created_at timestamp with time zone default now()
);

-- Enable RLS for activities
alter table public.activities enable row level security;

-- Policies for activities
create policy "Anyone can read published activities"
  on public.activities for select
  using ( published = true or auth.uid() = teacher_id );

create policy "Teachers can insert their own activities"
  on public.activities for insert
  with check ( auth.uid() = teacher_id );

create policy "Teachers can update their own activities"
  on public.activities for update
  using ( auth.uid() = teacher_id );

create policy "Teachers can delete their own activities"
  on public.activities for delete
  using ( auth.uid() = teacher_id );


-- Create questions table
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid references public.activities(id) on delete cascade not null,
  question_text text not null,
  options jsonb not null, -- Array of strings e.g. ["Paris", "Lyon", "Marseille"]
  correct_answer text not null,
  points integer default 1
);

-- Enable RLS for questions
alter table public.questions enable row level security;

-- Policies for questions
-- Important: We allow everyone to read the correct_answer for simplicity in this sprint,
-- but a more secure implementation would hide correct_answer from students and evaluate on the backend.
-- For this sprint, we evaluate on the backend anyway, but reading questions gives the full row.
create policy "Anyone can read questions of published activities"
  on public.questions for select
  using ( 
    exists (
      select 1 from public.activities
      where activities.id = questions.activity_id
      and (activities.published = true or activities.teacher_id = auth.uid())
    )
  );

create policy "Teachers can insert questions to their activities"
  on public.questions for insert
  with check ( 
    exists (
      select 1 from public.activities
      where activities.id = activity_id
      and activities.teacher_id = auth.uid()
    )
  );

create policy "Teachers can update questions of their activities"
  on public.questions for update
  using ( 
    exists (
      select 1 from public.activities
      where activities.id = activity_id
      and activities.teacher_id = auth.uid()
    )
  );

create policy "Teachers can delete questions of their activities"
  on public.questions for delete
  using ( 
    exists (
      select 1 from public.activities
      where activities.id = activity_id
      and activities.teacher_id = auth.uid()
    )
  );


-- Create submissions table
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete cascade not null,
  activity_id uuid references public.activities(id) on delete cascade not null,
  answers jsonb not null, -- { "question_id": "selected_answer" }
  score integer not null,
  submitted_at timestamp with time zone default now(),
  unique(student_id, activity_id) -- One submission per activity per student for now
);

-- Enable RLS for submissions
alter table public.submissions enable row level security;

-- Policies for submissions
create policy "Students can view their own submissions"
  on public.submissions for select
  using ( auth.uid() = student_id );

create policy "Teachers can view submissions for their activities"
  on public.submissions for select
  using ( 
    exists (
      select 1 from public.activities
      where activities.id = activity_id
      and activities.teacher_id = auth.uid()
    )
  );

create policy "Students can insert their own submissions"
  on public.submissions for insert
  with check ( auth.uid() = student_id );
