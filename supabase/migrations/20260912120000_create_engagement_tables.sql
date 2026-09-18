-- Migration: Create engagement tables (comments and upvotes)

-- 1. Add upvotes_count to works table
alter table public.works 
add column if not exists upvotes_count integer not null default 0;

-- 2. Create work_upvotes table
create table if not exists public.work_upvotes (
    work_id uuid not null references public.works(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    created_at timestamp with time zone not null default now(),
    primary key (work_id, user_id)
);

-- Enable RLS for work_upvotes
alter table public.work_upvotes enable row level security;

-- Policies for work_upvotes
create policy "Anyone can view upvotes"
    on public.work_upvotes for select
    using (true);

create policy "Users can insert their own upvotes"
    on public.work_upvotes for insert
    with check (auth.uid() = user_id);

create policy "Users can delete their own upvotes"
    on public.work_upvotes for delete
    using (auth.uid() = user_id);

-- 3. Create work_comments table
create table if not exists public.work_comments (
    id uuid primary key default gen_random_uuid(),
    work_id uuid not null references public.works(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    content text not null,
    created_at timestamp with time zone not null default now()
);

-- Enable RLS for work_comments
alter table public.work_comments enable row level security;

-- Policies for work_comments
create policy "Anyone can view comments"
    on public.work_comments for select
    using (true);

create policy "Authenticated users can insert comments"
    on public.work_comments for insert
    with check (auth.uid() = user_id);

create policy "Users can delete their own comments"
    on public.work_comments for delete
    using (auth.uid() = user_id);

create policy "Admins and teachers can delete any comment"
    on public.work_comments for delete
    using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role in ('admin', 'teacher')
        )
    );

-- 4. Triggers to maintain upvotes_count on works table
create or replace function public.increment_work_upvotes()
returns trigger as $$
begin
    update public.works
    set upvotes_count = upvotes_count + 1
    where id = new.work_id;
    return new;
end;
$$ language plpgsql security definer;

create or replace function public.decrement_work_upvotes()
returns trigger as $$
begin
    update public.works
    set upvotes_count = upvotes_count - 1
    where id = old.work_id;
    return old;
end;
$$ language plpgsql security definer;

-- Attach triggers
drop trigger if exists on_upvote_insert on public.work_upvotes;
create trigger on_upvote_insert
    after insert on public.work_upvotes
    for each row execute function public.increment_work_upvotes();

drop trigger if exists on_upvote_delete on public.work_upvotes;
create trigger on_upvote_delete
    after delete on public.work_upvotes
    for each row execute function public.decrement_work_upvotes();
