
-- Allow admins to list all users with role + basic info
create or replace function public.list_users_for_admin()
returns table(id uuid, email text, nom text, role user_role, created_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.email, p.nom, p.role, p.created_at
  from public.profiles p
  where public.current_user_role() = 'admin'
  order by p.created_at desc;
$$;

-- Allow admins to change a user's role
create or replace function public.set_user_role(p_user_id uuid, p_role user_role)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_user_role() <> 'admin' then
    raise exception 'Only admins can change user roles' using errcode='P0001';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'You cannot change your own role' using errcode='P0001';
  end if;
  update public.profiles set role = p_role where id = p_user_id;
  if not found then
    raise exception 'User not found' using errcode='P0001';
  end if;
end;
$$;

grant execute on function public.list_users_for_admin() to authenticated;
grant execute on function public.set_user_role(uuid, user_role) to authenticated;
