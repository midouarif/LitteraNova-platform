-- Migration: Add teacher_request_status to profiles

-- 1. Add column to profiles
alter table public.profiles 
add column teacher_request_status text 
check (teacher_request_status in ('none', 'pending', 'approved', 'rejected')) 
default 'none' not null;

-- 2. User RPC: request teacher status
create or replace function public.request_teacher_status()
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles 
  set teacher_request_status = 'pending' 
  where id = auth.uid() and role = 'student';
end;
$$;

-- 3. Admin RPC: resolve teacher request
create or replace function public.admin_resolve_teacher_request(target_user_id uuid, resolve_status text)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    if resolve_status = 'approved' then
      update public.profiles 
      set role = 'teacher', teacher_request_status = 'approved' 
      where id = target_user_id;
    elsif resolve_status = 'rejected' then
      update public.profiles 
      set teacher_request_status = 'rejected' 
      where id = target_user_id;
    else
      raise exception 'Invalid resolve_status. Must be approved or rejected.';
    end if;
  else
    raise exception 'Unauthorized: Only admins can resolve requests.';
  end if;
end;
$$;
