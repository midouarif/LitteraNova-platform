-- Migration: Add comment replies

-- 1. Add parent_id to work_comments
alter table public.work_comments 
add column if not exists parent_id uuid references public.work_comments(id) on delete cascade;
