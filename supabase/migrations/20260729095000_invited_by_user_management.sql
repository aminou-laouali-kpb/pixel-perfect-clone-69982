-- Link invited agents to the commercial/admin who created them
alter table public.agents
  add column if not exists invited_by_user_id uuid;

do $$ begin
  alter table public.agents
    add constraint agents_invited_by_user_id_fkey
    foreign key (invited_by_user_id) references public.profiles(id) on delete set null;
exception when duplicate_object then null;
end $$;

create index if not exists idx_agents_invited_by_user_id
  on public.agents(invited_by_user_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_parrain_id uuid;
  v_dob date;
  v_invited_by_user_id uuid;
begin
  insert into public.profiles (id, email, nom, role)
  values (
    new.id,
    lower(new.email),
    coalesce(v_meta->>'nom', split_part(new.email, '@', 1)),
    'agent'
  )
  on conflict (id) do nothing;

  if v_meta ? 'code_parrainage' then
    select id into v_parrain_id from public.agents
    where code_parrainage = nullif(v_meta->>'parrain_code', '');

    begin
      v_dob := nullif(v_meta->>'date_naissance', '')::date;
    exception when others then
      v_dob := null;
    end;

    begin
      v_invited_by_user_id := nullif(v_meta->>'invited_by_user_id', '')::uuid;
    exception when others then
      v_invited_by_user_id := null;
    end;

    insert into public.agents (
      id,
      nom,
      email,
      whatsapp,
      pays,
      niveau_etudes,
      motivation,
      code_parrainage,
      parrain_id,
      date_naissance,
      periode_debut,
      invited_by_user_id
    )
    values (
      new.id,
      coalesce(v_meta->>'nom', split_part(new.email, '@', 1)),
      lower(new.email),
      coalesce(v_meta->>'whatsapp', ''),
      coalesce(v_meta->>'pays', ''),
      coalesce(v_meta->>'niveau_etudes', ''),
      nullif(v_meta->>'motivation', ''),
      v_meta->>'code_parrainage',
      v_parrain_id,
      v_dob,
      current_date,
      v_invited_by_user_id
    )
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;
