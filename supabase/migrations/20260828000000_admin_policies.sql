-- Admin RLS Policies for Content Management

create policy "Admins can delete any work"
  on public.works for delete
  using ( exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') );

create policy "Admins can delete any activity"
  on public.activities for delete
  using ( exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') );

-- Security Definer Functions for User Management

-- Update User Role
create or replace function public.admin_update_user_role(target_user_id uuid, new_role text)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    update public.profiles set role = new_role where id = target_user_id;
  else
    raise exception 'Unauthorized: Only admins can change roles.';
  end if;
end;
$$;

-- Delete User
create or replace function public.admin_delete_user(target_user_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    -- Deleting from auth.users cascades to public.profiles and everything else
    delete from auth.users where id = target_user_id;
  else
    raise exception 'Unauthorized: Only admins can delete users.';
  end if;
end;
$$;
