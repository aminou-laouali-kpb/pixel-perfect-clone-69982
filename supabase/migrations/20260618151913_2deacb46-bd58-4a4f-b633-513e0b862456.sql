-- Consolidated KPB schema (initial + all hardening migrations)
create extension if not exists "pgcrypto";

create type agent_statut as enum ('quiz_pending','quiz_failed','essai','officiel');
create type agent_tier as enum ('bronze','argent','elite');
create type lead_statut as enum ('nouveau','contacte','qualifie','acompte_paye','place');
create type commission_type as enum ('bonus_dossier','placement','bonus_palier');
create type commission_statut as enum ('pending','paid');
create type user_role as enum ('agent','commercial','admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nom text not null,
  role user_role not null default 'agent',
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Profil visible par son owner" on public.profiles for select to authenticated using (auth.uid() = id);

create table public.agents (
  id uuid primary key references auth.users(id) on delete cascade,
  nom text not null,
  email text not null unique,
  whatsapp text not null,
  pays text not null,
  niveau_etudes text not null,
  motivation text,
  statut agent_statut not null default 'quiz_pending',
  tier agent_tier not null default 'bronze',
  code_parrainage text not null unique,
  quiz_score smallint,
  quiz_passed_at timestamptz,
  quiz_retry_at timestamptz,
  placements_count integer not null default 0,
  parrain_id uuid references public.agents(id) on delete set null,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.agents to authenticated;
grant all on public.agents to service_role;
create index idx_agents_code_parrainage on public.agents(code_parrainage);
create index idx_agents_parrain_id on public.agents(parrain_id);
alter table public.agents enable row level security;
create policy "Agent voit son propre profil" on public.agents for select to authenticated using (auth.uid() = id);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  assigned_to text not null,
  nom text not null,
  email text,
  whatsapp text,
  pays text not null,
  destination text not null,
  statut lead_statut not null default 'nouveau',
  bonus_paid boolean not null default false,
  commission_amount numeric(10,2) not null default 0,
  montant_service numeric(12,2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.leads to authenticated;
grant all on public.leads to service_role;
create index idx_leads_agent_id on public.leads(agent_id);
create index idx_leads_assigned_to on public.leads(assigned_to);
create index idx_leads_statut on public.leads(statut);
alter table public.leads enable row level security;
create policy "Agent voit ses propres leads" on public.leads for select to authenticated using (agent_id = auth.uid());
create policy "Insertion de lead via agent ou commercial" on public.leads for insert to authenticated with check (
  agent_id = auth.uid()
  or exists (select 1 from public.profiles where id = auth.uid() and role in ('commercial','admin'))
);

create table public.commissions (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  type commission_type not null,
  montant numeric(10,2) not null,
  statut commission_statut not null default 'pending',
  created_at timestamptz not null default now()
);
grant select, insert, update on public.commissions to authenticated;
grant all on public.commissions to service_role;
create index idx_commissions_agent_id on public.commissions(agent_id);
create unique index idx_commissions_one_per_lead_type on public.commissions (lead_id, type);
create unique index idx_commissions_bonus_palier on public.commissions (agent_id, montant) where type = 'bonus_palier';
alter table public.commissions enable row level security;
create policy "Agent voit ses commissions" on public.commissions for select to authenticated using (agent_id = auth.uid());

create table public.rr_state (
  id serial primary key,
  commercial text not null unique,
  rr_index integer not null default 0,
  leads_total integer not null default 0,
  email text not null,
  whatsapp text not null
);
grant select, insert, update, delete on public.rr_state to authenticated;
grant all on public.rr_state to service_role;
grant usage, select on sequence public.rr_state_id_seq to authenticated;
alter table public.rr_state enable row level security;

create or replace function public.current_user_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;
revoke all on function public.current_user_role() from public, anon;
grant execute on function public.current_user_role() to authenticated;

create policy "Admin voit tous les profils" on public.profiles for select to authenticated using (public.current_user_role() = 'admin');
create policy "Commercial et admin voient tous les agents" on public.agents for select to authenticated using (public.current_user_role() in ('commercial','admin'));
create policy "Admin voit toutes les commissions" on public.commissions for all to authenticated using (public.current_user_role() = 'admin');
create policy "Commercial et admin voient rr_state" on public.rr_state for select to authenticated using (public.current_user_role() in ('commercial','admin'));
create policy "Admin modifie rr_state" on public.rr_state for update to authenticated using (public.current_user_role() = 'admin');
create policy "Admin insere rr_state" on public.rr_state for insert to authenticated with check (public.current_user_role() = 'admin');
create policy "Admin supprime rr_state" on public.rr_state for delete to authenticated using (public.current_user_role() = 'admin');

create or replace function public.current_commercial_name()
returns text language sql stable security definer set search_path = public as $$
  select rr.commercial from public.rr_state rr
  join public.profiles p on lower(p.email) = lower(rr.email)
  where p.id = auth.uid() limit 1;
$$;
revoke all on function public.current_commercial_name() from public, anon;
grant execute on function public.current_commercial_name() to authenticated;

create policy "Admin voit tous les leads" on public.leads for select to authenticated using (public.current_user_role() = 'admin');
create policy "Commercial voit ses leads" on public.leads for select to authenticated using (assigned_to = public.current_commercial_name());
create policy "Admin modifie tous les leads" on public.leads for update to authenticated using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy "Commercial modifie ses leads" on public.leads for update to authenticated using (assigned_to = public.current_commercial_name()) with check (assigned_to = public.current_commercial_name());

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;
revoke all on function public.set_updated_at() from public, anon, authenticated;
create trigger leads_updated_at before update on public.leads for each row execute procedure public.set_updated_at();

create or replace function public.protect_profile_self_update()
returns trigger language plpgsql set search_path = public as $$
begin
  if auth.uid() is not null and auth.uid() = old.id then
    new.id := old.id; new.email := old.email; new.role := old.role; new.created_at := old.created_at;
  end if;
  return new;
end;
$$;
revoke all on function public.protect_profile_self_update() from public, anon, authenticated;
create trigger profiles_protect_self_update before update on public.profiles for each row execute procedure public.protect_profile_self_update();
create policy "Profil modifiable par son owner" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.normalize_agent_insert()
returns trigger language plpgsql set search_path = public as $$
begin
  if auth.uid() is not null and new.id <> auth.uid() then
    raise exception 'agent profile id must match authenticated user';
  end if;
  new.email := lower(new.email);
  new.statut := 'quiz_pending';
  new.tier := 'bronze';
  new.quiz_score := null;
  new.quiz_passed_at := null;
  new.quiz_retry_at := null;
  new.placements_count := 0;
  return new;
end;
$$;
revoke all on function public.normalize_agent_insert() from public, anon, authenticated;
create trigger agents_normalize_insert before insert on public.agents for each row execute procedure public.normalize_agent_insert();

create or replace function public.protect_agent_self_update()
returns trigger language plpgsql set search_path = public as $$
begin
  if auth.uid() is not null and auth.uid() = old.id then
    new.id := old.id; new.email := old.email; new.tier := old.tier;
    new.placements_count := old.placements_count; new.created_at := old.created_at;
    if coalesce(current_setting('app.quiz_via_rpc', true), 'off') <> 'on' then
      new.statut := old.statut; new.quiz_score := old.quiz_score;
      new.quiz_passed_at := old.quiz_passed_at; new.quiz_retry_at := old.quiz_retry_at;
    else
      if new.quiz_score is not null and (new.quiz_score < 0 or new.quiz_score > 5) then
        raise exception 'quiz_score must be between 0 and 5';
      end if;
      if new.statut = 'officiel' and old.statut <> 'officiel' then
        raise exception 'agents cannot self-promote to officiel';
      end if;
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.protect_agent_self_update() from public, anon, authenticated;
create trigger agents_protect_self_update before update on public.agents for each row execute procedure public.protect_agent_self_update();
create policy "Agent cree son propre profil" on public.agents for insert to authenticated with check (auth.uid() = id);
create policy "Agent modifie son propre profil" on public.agents for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_parrain_id uuid;
begin
  insert into public.profiles (id, email, nom, role)
  values (new.id, lower(new.email),
    coalesce(v_meta->>'nom', split_part(new.email, '@', 1)), 'agent')
  on conflict (id) do nothing;

  if v_meta ? 'code_parrainage' then
    select id into v_parrain_id from public.agents
    where code_parrainage = nullif(v_meta->>'parrain_code', '');
    insert into public.agents (id, nom, email, whatsapp, pays, niveau_etudes, motivation, code_parrainage, parrain_id)
    values (new.id,
      coalesce(v_meta->>'nom', split_part(new.email, '@', 1)),
      lower(new.email),
      coalesce(v_meta->>'whatsapp', ''),
      coalesce(v_meta->>'pays', ''),
      coalesce(v_meta->>'niveau_etudes', ''),
      nullif(v_meta->>'motivation', ''),
      v_meta->>'code_parrainage',
      v_parrain_id)
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.assign_lead_round_robin(p_lead_id uuid)
returns text language plpgsql security definer set search_path = public as $$
declare v_commercial text;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role in ('commercial','admin')) then
    raise exception 'Only commercial and admin users can assign leads';
  end if;
  select commercial into v_commercial from public.rr_state
  order by leads_total asc, id asc limit 1 for update;
  if v_commercial is null then raise exception 'No commercial configured in rr_state'; end if;
  update public.leads set assigned_to = v_commercial, updated_at = now() where id = p_lead_id;
  update public.rr_state set leads_total = leads_total + 1 where commercial = v_commercial;
  return v_commercial;
end;
$$;
revoke all on function public.assign_lead_round_robin(uuid) from public, anon;
grant execute on function public.assign_lead_round_robin(uuid) to authenticated;

create or replace function public.create_placement_commission(p_lead_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_agent_id uuid; v_statut lead_statut; v_montant numeric;
  v_placements integer; v_tier agent_tier; v_taux numeric; v_commission numeric;
begin
  select l.agent_id, l.statut, l.montant_service into v_agent_id, v_statut, v_montant
  from public.leads l where l.id = p_lead_id;
  if v_agent_id is null then return; end if;

  select count(*) into v_placements from public.leads
  where agent_id = v_agent_id and statut in ('acompte_paye','place');

  v_tier := case
    when v_placements >= 10 then 'elite'::agent_tier
    when v_placements >= 3 then 'argent'::agent_tier
    else 'bronze'::agent_tier end;

  update public.agents
  set placements_count = v_placements, tier = v_tier,
      statut = case when v_placements >= 1 then 'officiel'::agent_statut else statut end
  where id = v_agent_id;

  if v_statut in ('acompte_paye','place') and v_montant is not null and v_montant > 0 then
    v_taux := case v_tier when 'elite' then 0.15 when 'argent' then 0.12 else 0.10 end;
    v_commission := round(v_taux * v_montant, 2);
    insert into public.commissions (agent_id, lead_id, type, montant, statut)
    values (v_agent_id, p_lead_id, 'placement', v_commission, 'pending')
    on conflict (lead_id, type) do update set montant = excluded.montant;
    update public.leads set commission_amount = v_commission where id = p_lead_id;
  else
    delete from public.commissions where lead_id = p_lead_id and type = 'placement' and statut = 'pending';
    update public.leads set commission_amount = 0 where id = p_lead_id;
  end if;

  if v_placements >= 3 then
    insert into public.commissions (agent_id, lead_id, type, montant, statut)
    values (v_agent_id, null, 'bonus_palier', 20000, 'pending')
    on conflict (agent_id, montant) where type = 'bonus_palier' do nothing;
  end if;
  if v_placements >= 5 then
    insert into public.commissions (agent_id, lead_id, type, montant, statut)
    values (v_agent_id, null, 'bonus_palier', 50000, 'pending')
    on conflict (agent_id, montant) where type = 'bonus_palier' do nothing;
  end if;
  if v_placements >= 10 then
    insert into public.commissions (agent_id, lead_id, type, montant, statut)
    values (v_agent_id, null, 'bonus_palier', 100000, 'pending')
    on conflict (agent_id, montant) where type = 'bonus_palier' do nothing;
  end if;
end;
$$;
revoke all on function public.create_placement_commission(uuid) from public, anon, authenticated;

create or replace function public.on_lead_status_changed()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.statut is distinct from old.statut then perform public.create_placement_commission(new.id); end if;
  return new;
end;
$$;
revoke all on function public.on_lead_status_changed() from public, anon, authenticated;
create trigger lead_status_changed after update of statut on public.leads for each row execute procedure public.on_lead_status_changed();

create or replace function public.on_lead_amount_changed()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.montant_service is distinct from old.montant_service then perform public.create_placement_commission(new.id); end if;
  return new;
end;
$$;
revoke all on function public.on_lead_amount_changed() from public, anon, authenticated;
create trigger lead_amount_changed after update of montant_service on public.leads for each row execute procedure public.on_lead_amount_changed();

create or replace function public.get_agent_rank()
returns integer language sql security definer set search_path = public as $$
  select count(*)::integer + 1 from public.agents
  where placements_count > coalesce((select placements_count from public.agents where id = auth.uid()), -1);
$$;
revoke all on function public.get_agent_rank() from public, anon;
grant execute on function public.get_agent_rank() to authenticated;

create or replace function public.submit_quiz_attempt(p_answers smallint[])
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_key smallint[] := array[1,2,3,2,1];
  v_score smallint := 0; v_passed boolean;
  v_statut agent_statut; v_retry timestamptz; i int;
begin
  if auth.uid() is null then raise exception 'Authentification requise' using errcode='P0001'; end if;
  select statut, quiz_retry_at into v_statut, v_retry from public.agents where id = auth.uid();
  if not found then raise exception 'Profil agent introuvable' using errcode='P0001'; end if;
  if v_statut not in ('quiz_pending','quiz_failed') then raise exception 'Quiz deja valide' using errcode='P0001'; end if;
  if v_statut = 'quiz_failed' and v_retry is not null and v_retry > now() then
    raise exception 'Nouvelle tentative non encore disponible' using errcode='P0001'; end if;
  for i in 1 .. array_length(v_key, 1) loop
    if p_answers[i] is not null and p_answers[i] = v_key[i] then v_score := v_score + 1; end if;
  end loop;
  v_passed := v_score >= 4;
  perform set_config('app.quiz_via_rpc','on',true);
  update public.agents
  set quiz_score = v_score,
      statut = case when v_passed then 'essai'::agent_statut else 'quiz_failed'::agent_statut end,
      quiz_passed_at = case when v_passed then now() else null end,
      quiz_retry_at = case when v_passed then null else now() + interval '7 days' end
  where id = auth.uid();
  return jsonb_build_object('score', v_score, 'passed', v_passed);
end;
$$;
revoke all on function public.submit_quiz_attempt(smallint[]) from public, anon;
grant execute on function public.submit_quiz_attempt(smallint[]) to authenticated;

create or replace function public.submit_referral_lead(
  p_code text, p_nom text, p_whatsapp text,
  p_email text default null, p_pays text default null,
  p_destination text default null, p_notes text default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_agent_id uuid; v_lead_id uuid; v_commercial text;
  v_whatsapp text := nullif(trim(p_whatsapp), '');
begin
  select id into v_agent_id from public.agents where code_parrainage = trim(p_code);
  if v_agent_id is null then raise exception 'Code de parrainage invalide ou introuvable' using errcode='P0001'; end if;
  if coalesce(trim(p_nom),'') = '' then raise exception 'Le nom est requis' using errcode='P0001'; end if;
  if v_whatsapp is null and coalesce(trim(p_email),'') = '' then
    raise exception 'Un moyen de contact (WhatsApp ou email) est requis' using errcode='P0001';
  end if;
  if v_whatsapp is not null then
    select id into v_lead_id from public.leads where agent_id = v_agent_id and whatsapp = v_whatsapp limit 1;
    if v_lead_id is not null then return jsonb_build_object('ok',true,'lead_id',v_lead_id,'duplicate',true); end if;
  end if;
  insert into public.leads (agent_id, assigned_to, nom, email, whatsapp, pays, destination, statut, commission_amount, notes)
  values (v_agent_id, 'pending', trim(p_nom), nullif(trim(p_email),''), v_whatsapp,
    coalesce(nullif(trim(p_pays),''), 'Non precise'),
    coalesce(nullif(trim(p_destination),''), 'Non precise'),
    'nouveau', 0, nullif(trim(p_notes),''))
  returning id into v_lead_id;
  select commercial into v_commercial from public.rr_state order by leads_total asc, id asc limit 1 for update;
  if v_commercial is not null then
    update public.leads set assigned_to = v_commercial, updated_at = now() where id = v_lead_id;
    update public.rr_state set leads_total = leads_total + 1 where commercial = v_commercial;
  end if;
  return jsonb_build_object('ok', true, 'lead_id', v_lead_id);
end;
$$;
revoke all on function public.submit_referral_lead(text,text,text,text,text,text,text) from public;
grant execute on function public.submit_referral_lead(text,text,text,text,text,text,text) to anon, authenticated;

create or replace function public.get_leaderboard(p_start timestamptz, p_end timestamptz, p_limit int default 10)
returns table(rang int, prenom text, placements int)
language sql stable security definer set search_path = public as $$
  select (row_number() over (order by count(*) desc, min(c.created_at)))::int as rang,
    split_part(a.nom, ' ', 1) as prenom, count(*)::int as placements
  from public.commissions c
  join public.agents a on a.id = c.agent_id
  where c.type = 'placement' and c.created_at >= p_start and c.created_at < p_end
  group by a.id, a.nom
  order by placements desc, min(c.created_at)
  limit greatest(p_limit, 1);
$$;
revoke all on function public.get_leaderboard(timestamptz,timestamptz,int) from public, anon;
grant execute on function public.get_leaderboard(timestamptz,timestamptz,int) to authenticated;

alter publication supabase_realtime add table public.leads;
alter publication supabase_realtime add table public.commissions;