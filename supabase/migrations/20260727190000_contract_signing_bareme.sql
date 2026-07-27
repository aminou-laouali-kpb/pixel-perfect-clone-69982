-- Spec v1.1: barème 15/20/30, contracts, ecoles, commission model extensions

create extension if not exists pgcrypto;
create extension if not exists unaccent;

-- ---------------------------------------------------------------------------
-- bareme_versions
-- ---------------------------------------------------------------------------
create table if not exists public.bareme_versions (
  version text primary key,
  effective_from date not null,
  contenu jsonb not null,
  is_current boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists bareme_one_current
  on public.bareme_versions (is_current) where is_current;

insert into public.bareme_versions (version, effective_from, contenu, is_current)
values (
  'v3.1',
  current_date,
  '{
    "tiers": [
      {"id":"bronze","min":1,"max":5,"taux":0.15},
      {"id":"argent","min":6,"max":10,"taux":0.20},
      {"id":"elite","min":11,"max":null,"taux":0.30}
    ],
    "bonus": [
      {"placements":3,"montant":20000,"devise":"XOF"},
      {"placements":5,"montant":50000,"devise":"XOF"},
      {"placements":10,"montant":100000,"devise":"XOF"}
    ],
    "prime": {"montant":150,"devise":"USD","eligible":"campus_france"},
    "delais": {"securite_jours":45,"caducite_mois":24,"seuil_versement_xof":30000}
  }'::jsonb,
  true
)
on conflict (version) do update set contenu = excluded.contenu, is_current = true;

-- ---------------------------------------------------------------------------
-- ecoles / campuses
-- ---------------------------------------------------------------------------
create table if not exists public.ecoles (
  id uuid primary key default gen_random_uuid(),
  nom text not null unique,
  groupe text,
  created_at timestamptz not null default now()
);

create table if not exists public.ecoles_campus (
  id uuid primary key default gen_random_uuid(),
  ecole_id uuid not null references public.ecoles(id) on delete cascade,
  ville text not null,
  pays text not null,
  eligible_prime boolean not null default false,
  actif boolean not null default true
);
create unique index if not exists ecoles_campus_uk on public.ecoles_campus(ecole_id, ville);

-- Seed établissements clés (eligible_prime = campus FR validés)
with seeded as (
  insert into public.ecoles (nom, groupe) values
    ('INSEEC Grande École', 'OMNES Education'),
    ('ECE', 'OMNES Education'),
    ('ESCE', 'OMNES Education'),
    ('Sup de Pub', 'OMNES Education'),
    ('HEIP', 'OMNES Education'),
    ('ICN Business School', null),
    ('Schiller International University', 'Schiller'),
    ('ISMAGI', null),
    ('ESA Casablanca', null),
    ('BAU Istanbul', null),
    ('GBS Dubai', null)
  on conflict (nom) do update set groupe = excluded.groupe
  returning id, nom
)
insert into public.ecoles_campus (ecole_id, ville, pays, eligible_prime)
select s.id, c.ville, c.pays, c.eligible
from seeded s
join (values
  ('INSEEC Grande École', 'Paris', 'France', true),
  ('ECE', 'Paris', 'France', true),
  ('ESCE', 'Paris', 'France', true),
  ('Sup de Pub', 'Paris', 'France', true),
  ('HEIP', 'Paris', 'France', true),
  ('ICN Business School', 'Paris La Défense', 'France', true),
  ('ICN Business School', 'Berlin', 'Allemagne', false),
  ('Schiller International University', 'Paris', 'France', false),
  ('Schiller International University', 'Madrid', 'Espagne', false),
  ('Schiller International University', 'Heidelberg', 'Allemagne', false),
  ('Schiller International University', 'Tampa', 'USA', false),
  ('ISMAGI', 'Rabat', 'Maroc', false),
  ('ESA Casablanca', 'Casablanca', 'Maroc', false),
  ('BAU Istanbul', 'Istanbul', 'Turquie', false),
  ('GBS Dubai', 'Dubai', 'Dubaï', false)
) as c(nom, ville, pays, eligible) on c.nom = s.nom
on conflict (ecole_id, ville) do update set eligible_prime = excluded.eligible_prime, pays = excluded.pays;

grant select on public.ecoles to authenticated, anon;
grant select on public.ecoles_campus to authenticated, anon;
alter table public.ecoles enable row level security;
alter table public.ecoles_campus enable row level security;
drop policy if exists ecoles_read on public.ecoles;
create policy ecoles_read on public.ecoles for select using (true);
drop policy if exists ecoles_campus_read on public.ecoles_campus;
create policy ecoles_campus_read on public.ecoles_campus for select using (true);

-- ---------------------------------------------------------------------------
-- contracts
-- ---------------------------------------------------------------------------
create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  version text not null,
  bareme_snapshot jsonb not null,
  pdf_path text not null,
  sha256 text not null,
  accepted_full_name text not null default '',
  accepted_terms boolean not null default false,
  accepted_age_18 boolean not null default false,
  accepted_image boolean not null default false,
  signature_path text,
  signed_at timestamptz,
  signed_ip inet,
  signed_user_agent text,
  kpb_signatory_name text not null default 'Aminou Laouali Abdou',
  kpb_signatory_role text not null default 'General Manager',
  kpb_signature_path text,
  status text not null default 'draft'
    check (status in ('draft','signed','superseded','revoked')),
  superseded_by uuid references public.contracts(id),
  created_at timestamptz not null default now()
);
create unique index if not exists contracts_agent_version_uk on public.contracts(agent_id, version);
create index if not exists contracts_agent_status_ix on public.contracts(agent_id, status);

alter table public.contracts enable row level security;
drop policy if exists contracts_agent_read on public.contracts;
create policy contracts_agent_read on public.contracts
  for select to authenticated using (agent_id = auth.uid());
drop policy if exists contracts_agent_insert on public.contracts;
create policy contracts_agent_insert on public.contracts
  for insert to authenticated with check (agent_id = auth.uid());
drop policy if exists contracts_agent_update on public.contracts;
create policy contracts_agent_update on public.contracts
  for update to authenticated using (agent_id = auth.uid());
drop policy if exists contracts_admin_all on public.contracts;
create policy contracts_admin_all on public.contracts
  for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

grant select, insert, update on public.contracts to authenticated;
grant all on public.contracts to service_role;

-- ---------------------------------------------------------------------------
-- agents columns
-- ---------------------------------------------------------------------------
alter table public.agents
  add column if not exists date_naissance date,
  add column if not exists contrat_signe_at timestamptz,
  add column if not exists contrat_id uuid,
  add column if not exists periode_debut date,
  add column if not exists placements_periode int not null default 0;

do $$ begin
  alter table public.agents
    add constraint agents_contrat_id_fkey foreign key (contrat_id) references public.contracts(id);
exception when duplicate_object then null;
end $$;

update public.agents set periode_debut = coalesce(periode_debut, current_date)
where periode_debut is null;

-- ---------------------------------------------------------------------------
-- commissions columns + constraints
-- ---------------------------------------------------------------------------
alter table public.commissions
  add column if not exists taux_applique numeric(5,2),
  add column if not exists bareme_version text,
  add column if not exists devise text not null default 'XOF',
  add column if not exists assiette text not null default 'honoraires_kpb',
  add column if not exists condition_paiement text not null default 'delai_securite',
  add column if not exists montant_previsionnel numeric(12,2),
  add column if not exists payable_at timestamptz,
  add column if not exists justificatif_path text,
  add column if not exists motif_annulation text,
  add column if not exists reversal_of uuid;

do $$ begin
  alter table public.commissions
    add constraint commissions_bareme_version_fkey
    foreign key (bareme_version) references public.bareme_versions(version);
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.commissions
    add constraint commissions_reversal_of_fkey
    foreign key (reversal_of) references public.commissions(id);
exception when duplicate_object then null;
end $$;

-- Drop/recreate checks for statut & type (Postgres enums may already exist as text checks)
alter table public.commissions drop constraint if exists commissions_statut_check;
alter table public.commissions drop constraint if exists commissions_type_check;
alter table public.commissions drop constraint if exists commissions_assiette_check;
alter table public.commissions drop constraint if exists commissions_condition_paiement_check;

-- type column may be an enum commission_type — widen via alter type if needed
do $$ begin
  alter type public.commission_type add value if not exists 'apport_ecole';
exception when others then null;
end $$;
do $$ begin
  alter type public.commission_statut add value if not exists 'attente_ecole';
exception when others then null;
end $$;
do $$ begin
  alter type public.commission_statut add value if not exists 'payable';
exception when others then null;
end $$;
do $$ begin
  alter type public.commission_statut add value if not exists 'gelee';
exception when others then null;
end $$;
do $$ begin
  alter type public.commission_statut add value if not exists 'annulee';
exception when others then null;
end $$;
do $$ begin
  alter type public.commission_statut add value if not exists 'caduque';
exception when others then null;
end $$;
do $$ begin
  alter type public.commission_type add value if not exists 'prime_scolarite';
exception when others then null;
end $$;

-- ---------------------------------------------------------------------------
-- leads campus / school commission fields
-- ---------------------------------------------------------------------------
alter table public.leads
  add column if not exists ecole_campus_id uuid,
  add column if not exists admission_confirmee_at timestamptz,
  add column if not exists scolarite_soldee_at timestamptz,
  add column if not exists justificatif_paiement_path text,
  add column if not exists ecole_commission_attendue numeric(12,2),
  add column if not exists ecole_commission_devise text,
  add column if not exists ecole_commission_recue_at timestamptz,
  add column if not exists ecole_commission_montant numeric(12,2);

do $$ begin
  alter table public.leads
    add constraint leads_ecole_campus_id_fkey
    foreign key (ecole_campus_id) references public.ecoles_campus(id);
exception when duplicate_object then null;
end $$;

-- Bonus palier uniqueness per period: add periode_debut column on commissions for bonuses
alter table public.commissions
  add column if not exists periode_debut date;

drop index if exists idx_commissions_bonus_palier;
create unique index if not exists idx_commissions_bonus_palier_periode
  on public.commissions (agent_id, montant, periode_debut)
  where type = 'bonus_palier';

-- ---------------------------------------------------------------------------
-- Helper: rate from period placements (1-based count)
-- ---------------------------------------------------------------------------
create or replace function public.taux_for_placements(p_count int)
returns numeric language sql immutable as $$
  select case
    when p_count >= 11 then 0.30
    when p_count >= 6 then 0.20
    else 0.15
  end;
$$;

create or replace function public.tier_for_placements(p_count int)
returns public.agent_tier language sql immutable as $$
  select case
    when p_count >= 11 then 'elite'::public.agent_tier
    when p_count >= 6 then 'argent'::public.agent_tier
    else 'bronze'::public.agent_tier
  end;
$$;

-- ---------------------------------------------------------------------------
-- Rework create_placement_commission (frozen rate, period, dual lines)
-- ---------------------------------------------------------------------------
create or replace function public.create_placement_commission(p_lead_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_agent_id uuid; v_statut public.lead_statut; v_montant numeric;
  v_periode date; v_placements_periode int; v_placements_life int;
  v_tier public.agent_tier; v_taux numeric; v_commission numeric;
  v_bareme text; v_admission timestamptz; v_justif text;
begin
  select l.agent_id, l.statut, l.montant_service, l.admission_confirmee_at, l.justificatif_paiement_path
  into v_agent_id, v_statut, v_montant, v_admission, v_justif
  from public.leads l where l.id = p_lead_id;
  if v_agent_id is null then return; end if;

  select coalesce(periode_debut, current_date) into v_periode from public.agents where id = v_agent_id;

  select count(*) into v_placements_life from public.leads
  where agent_id = v_agent_id and statut in ('acompte_paye','place');

  -- Period count: validated leads since periode_debut
  select count(*) into v_placements_periode from public.leads
  where agent_id = v_agent_id
    and statut in ('acompte_paye','place')
    and coalesce(admission_confirmee_at, updated_at, created_at)::date >= v_periode;

  v_tier := public.tier_for_placements(greatest(v_placements_periode, 1));
  v_taux := public.taux_for_placements(greatest(v_placements_periode, 1));

  select version into v_bareme from public.bareme_versions where is_current limit 1;

  update public.agents
  set placements_count = v_placements_life,
      placements_periode = v_placements_periode,
      tier = v_tier,
      periode_debut = coalesce(periode_debut, current_date),
      statut = case when v_placements_life >= 1 then 'officiel'::public.agent_statut else statut end
  where id = v_agent_id;

  -- Spec: admission + montant + justificatif required for new commissions
  if v_statut in ('acompte_paye','place')
     and v_montant is not null and v_montant > 0
     and v_admission is not null
     and coalesce(nullif(trim(v_justif), ''), '') <> ''
  then
    v_commission := round(v_taux * v_montant, 2);

    insert into public.commissions (
      agent_id, lead_id, type, montant, statut,
      taux_applique, bareme_version, devise, assiette, condition_paiement, payable_at, periode_debut
    ) values (
      v_agent_id, p_lead_id, 'placement', v_commission, 'pending',
      v_taux * 100, v_bareme, 'XOF', 'honoraires_kpb', 'delai_securite',
      now() + interval '45 days', v_periode
    )
    on conflict (lead_id, type) do update
      set montant = case
            when public.commissions.statut in ('paid','payable','gelee','annulee','caduque')
            then public.commissions.montant
            else excluded.montant
          end,
          -- Never rewrite frozen rate on existing rows once set
          taux_applique = coalesce(public.commissions.taux_applique, excluded.taux_applique),
          bareme_version = coalesce(public.commissions.bareme_version, excluded.bareme_version),
          payable_at = coalesce(public.commissions.payable_at, excluded.payable_at);

    update public.leads set commission_amount = v_commission where id = p_lead_id;

    -- Parallel school-apport line (prévisionnelle, jamais sommée au disponible)
    insert into public.commissions (
      agent_id, lead_id, type, montant, statut,
      taux_applique, bareme_version, devise, assiette, condition_paiement,
      montant_previsionnel, payable_at, periode_debut
    )
    select
      v_agent_id, p_lead_id, 'apport_ecole', 0, 'attente_ecole',
      null, v_bareme,
      coalesce(nullif(l.ecole_commission_devise, ''), 'XOF'),
      'commission_ecole', 'encaissement_ecole',
      l.ecole_commission_attendue, null, v_periode
    from public.leads l where l.id = p_lead_id
    on conflict (lead_id, type) do update
      set montant_previsionnel = coalesce(
            excluded.montant_previsionnel,
            public.commissions.montant_previsionnel
          );

  elsif v_statut in ('acompte_paye','place') and v_montant is not null and v_montant > 0 then
    -- Legacy path without admission/justificatif yet: keep amount on lead but no new commission
    update public.leads set commission_amount = round(v_taux * v_montant, 2) where id = p_lead_id;
  else
    delete from public.commissions
    where lead_id = p_lead_id and type = 'placement' and statut = 'pending';
    update public.leads set commission_amount = 0 where id = p_lead_id;
  end if;

  -- Bonus paliers (once per contractual year)
  if v_placements_periode >= 3 then
    insert into public.commissions (agent_id, lead_id, type, montant, statut, devise, assiette, condition_paiement, payable_at, bareme_version, periode_debut)
    values (v_agent_id, null, 'bonus_palier', 20000, 'pending', 'XOF', 'na', 'delai_securite', now() + interval '45 days', v_bareme, v_periode)
    on conflict (agent_id, montant, periode_debut) where type = 'bonus_palier' do nothing;
  end if;
  if v_placements_periode >= 5 then
    insert into public.commissions (agent_id, lead_id, type, montant, statut, devise, assiette, condition_paiement, payable_at, bareme_version, periode_debut)
    values (v_agent_id, null, 'bonus_palier', 50000, 'pending', 'XOF', 'na', 'delai_securite', now() + interval '45 days', v_bareme, v_periode)
    on conflict (agent_id, montant, periode_debut) where type = 'bonus_palier' do nothing;
  end if;
  if v_placements_periode >= 10 then
    insert into public.commissions (agent_id, lead_id, type, montant, statut, devise, assiette, condition_paiement, payable_at, bareme_version, periode_debut)
    values (v_agent_id, null, 'bonus_palier', 100000, 'pending', 'XOF', 'na', 'delai_securite', now() + interval '45 days', v_bareme, v_periode)
    on conflict (agent_id, montant, periode_debut) where type = 'bonus_palier' do nothing;
  end if;
end;
$$;

revoke all on function public.create_placement_commission(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Guard: submit_referral_lead requires signed contract
-- ---------------------------------------------------------------------------
create or replace function public.submit_referral_lead(
  p_code text,
  p_nom text,
  p_whatsapp text,
  p_email text default null,
  p_pays text default null,
  p_destination text default null,
  p_notes text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_agent_id uuid;
  v_lead_id uuid;
  v_commercial text;
  v_whatsapp text := nullif(trim(p_whatsapp), '');
  v_email text := nullif(trim(p_email), '');
  v_recent int;
  v_signed boolean;
begin
  if p_notes is not null and left(trim(p_notes), 9) = '__hp_bot:' then
    return jsonb_build_object('ok', true, 'lead_id', null, 'duplicate', false);
  end if;

  select id into v_agent_id from public.agents where code_parrainage = trim(p_code);
  if v_agent_id is null then
    raise exception 'Code de parrainage invalide ou introuvable' using errcode = 'P0001';
  end if;

  select exists (
    select 1 from public.contracts c
    where c.agent_id = v_agent_id and c.status = 'signed'
  ) into v_signed;
  -- Art. 4.3 : lien de parrainage inactif tant que le contrat n'est pas signé (garde serveur).
  if not v_signed then
    raise exception 'Contrat ambassadeur non signé — parrainage indisponible' using errcode = 'P0001';
  end if;

  if coalesce(trim(p_nom), '') = '' then
    raise exception 'Le nom est requis' using errcode = 'P0001';
  end if;
  if v_whatsapp is null and v_email is null then
    raise exception 'Un moyen de contact (WhatsApp ou email) est requis' using errcode = 'P0001';
  end if;

  select count(*)::int into v_recent
  from public.leads
  where created_at > now() - interval '10 minutes'
    and ((v_whatsapp is not null and whatsapp = v_whatsapp) or (v_email is not null and email = v_email));
  if v_recent >= 5 then
    raise exception 'Trop de demandes. Réessayez dans quelques minutes.' using errcode = 'P0001';
  end if;

  select count(*)::int into v_recent
  from public.leads
  where agent_id = v_agent_id and created_at > now() - interval '1 hour';
  if v_recent >= 30 then
    raise exception 'Trop de demandes pour ce lien. Réessayez plus tard.' using errcode = 'P0001';
  end if;

  if v_whatsapp is not null then
    select id into v_lead_id from public.leads
    where agent_id = v_agent_id and whatsapp = v_whatsapp limit 1;
    if v_lead_id is not null then
      return jsonb_build_object('ok', true, 'lead_id', v_lead_id, 'duplicate', true);
    end if;
  end if;

  insert into public.leads (agent_id, assigned_to, nom, email, whatsapp, pays, destination, statut, commission_amount, notes)
  values (
    v_agent_id, 'pending', trim(p_nom), v_email, v_whatsapp,
    coalesce(nullif(trim(p_pays), ''), 'Non precise'),
    coalesce(nullif(trim(p_destination), ''), 'Non precise'),
    'nouveau', 0, nullif(trim(p_notes), '')
  ) returning id into v_lead_id;

  select commercial into v_commercial
  from public.rr_state order by leads_total asc, id asc limit 1 for update;
  if v_commercial is not null then
    update public.leads set assigned_to = v_commercial, updated_at = now() where id = v_lead_id;
    update public.rr_state set leads_total = leads_total + 1 where commercial = v_commercial;
  end if;

  return jsonb_build_object('ok', true, 'lead_id', v_lead_id);
end;
$$;

revoke all on function public.submit_referral_lead(text, text, text, text, text, text, text) from public;
grant execute on function public.submit_referral_lead(text, text, text, text, text, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- prepare_contract / sign_contract (content + sha256; PDF path placeholder)
-- ---------------------------------------------------------------------------
create or replace function public.prepare_contract()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_agent public.agents%rowtype;
  v_bareme public.bareme_versions%rowtype;
  v_existing public.contracts%rowtype;
  v_body text;
  v_hash text;
  v_path text;
  v_id uuid;
begin
  if v_uid is null then raise exception 'Authentification requise' using errcode = 'P0001'; end if;
  select * into v_agent from public.agents where id = v_uid;
  if not found then raise exception 'Profil agent introuvable' using errcode = 'P0001'; end if;
  if v_agent.date_naissance is null or v_agent.date_naissance > (current_date - interval '18 years') then
    raise exception 'Vous devez avoir au moins 18 ans pour signer' using errcode = 'P0001';
  end if;
  select * into v_bareme from public.bareme_versions where is_current limit 1;
  if not found then raise exception 'Barème courant introuvable' using errcode = 'P0001'; end if;

  select * into v_existing from public.contracts
  where agent_id = v_uid and version = v_bareme.version
  limit 1;

  v_body := 'CONTRAT AMBASSADEUR KPB GLOBAL L.L.C. ' || v_bareme.version || E'\n'
    || 'Agent: ' || v_agent.nom || ' | ' || v_agent.email || E'\n'
    || 'Code: ' || v_agent.code_parrainage || E'\n'
    || 'Barème: ' || v_bareme.contenu::text || E'\n'
    || 'Signataire KPB: Aminou Laouali Abdou — General Manager';
  v_hash := encode(digest(v_body, 'sha256'), 'hex');
  v_path := 'contracts/' || v_uid::text || '/' || v_bareme.version || '.txt';

  if found then
    return jsonb_build_object(
      'contract_id', v_existing.id,
      'version', v_existing.version,
      'sha256', v_existing.sha256,
      'status', v_existing.status,
      'pdf_path', v_existing.pdf_path,
      'body', v_body
    );
  end if;

  insert into public.contracts (agent_id, version, bareme_snapshot, pdf_path, sha256, status)
  values (v_uid, v_bareme.version, v_bareme.contenu, v_path, v_hash, 'draft')
  returning id into v_id;

  return jsonb_build_object(
    'contract_id', v_id,
    'version', v_bareme.version,
    'sha256', v_hash,
    'status', 'draft',
    'pdf_path', v_path,
    'body', v_body
  );
end;
$$;
revoke all on function public.prepare_contract() from public, anon;
grant execute on function public.prepare_contract() to authenticated;

create or replace function public.sign_contract(
  p_contract_id uuid,
  p_full_name text,
  p_signature_b64 text,
  p_accepted_terms boolean,
  p_accepted_age_18 boolean,
  p_accepted_image boolean,
  p_user_agent text default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_c public.contracts%rowtype;
  v_agent public.agents%rowtype;
  v_norm_input text;
  v_norm_agent text;
  v_sig_path text;
begin
  if v_uid is null then raise exception 'Authentification requise' using errcode = 'P0001'; end if;
  if not coalesce(p_accepted_terms, false) then raise exception 'Acceptation du contrat requise' using errcode = 'P0001'; end if;
  if not coalesce(p_accepted_age_18, false) then raise exception 'Confirmation 18 ans requise' using errcode = 'P0001'; end if;
  if coalesce(trim(p_full_name), '') = '' then raise exception 'Nom complet requis' using errcode = 'P0001'; end if;
  if coalesce(trim(p_signature_b64), '') = '' then raise exception 'Signature requise' using errcode = 'P0001'; end if;

  select * into v_c from public.contracts where id = p_contract_id and agent_id = v_uid for update;
  if not found then raise exception 'Contrat introuvable' using errcode = 'P0001'; end if;
  if v_c.status = 'signed' then
    return jsonb_build_object('ok', true, 'contract_id', v_c.id, 'status', 'signed');
  end if;
  if v_c.status <> 'draft' then raise exception 'Contrat non signable' using errcode = 'P0001'; end if;

  select * into v_agent from public.agents where id = v_uid;
  v_norm_input := lower(regexp_replace(unaccent(trim(p_full_name)), '\s+', ' ', 'g'));
  v_norm_agent := lower(regexp_replace(unaccent(trim(v_agent.nom)), '\s+', ' ', 'g'));
  if v_norm_input <> v_norm_agent then
    raise exception 'Le nom saisi ne correspond pas au nom du compte' using errcode = 'P0001';
  end if;

  v_sig_path := 'signatures/' || v_uid::text || '/' || v_c.version || '.png';

  update public.contracts set
    accepted_full_name = trim(p_full_name),
    accepted_terms = true,
    accepted_age_18 = true,
    accepted_image = coalesce(p_accepted_image, false),
    signature_path = v_sig_path,
    signed_at = now(),
    signed_ip = inet_client_addr(),
    signed_user_agent = left(coalesce(p_user_agent, ''), 500),
    status = 'signed'
  where id = v_c.id;

  update public.agents set
    contrat_signe_at = now(),
    contrat_id = v_c.id,
    periode_debut = coalesce(periode_debut, current_date)
  where id = v_uid;

  return jsonb_build_object('ok', true, 'contract_id', v_c.id, 'status', 'signed', 'signature_path', v_sig_path);
end;
$$;
revoke all on function public.sign_contract(uuid, text, text, boolean, boolean, boolean, text) from public, anon;
grant execute on function public.sign_contract(uuid, text, text, boolean, boolean, boolean, text) to authenticated;

-- mark_payable cron helper
create or replace function public.mark_payable()
returns integer language plpgsql security definer set search_path = public as $$
declare v_count int;
begin
  update public.commissions
  set statut = 'payable'
  where statut = 'pending'
    and condition_paiement = 'delai_securite'
    and payable_at is not null
    and payable_at <= now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;
revoke all on function public.mark_payable() from public, anon, authenticated;
grant execute on function public.mark_payable() to service_role;

-- Storage bucket (ignore if storage schema absent in local)
do $$ begin
  insert into storage.buckets (id, name, public)
  values ('contracts', 'contracts', false)
  on conflict (id) do nothing;
exception when undefined_table then null;
when others then null;
end $$;

-- Update handle_new_user to persist date_naissance + periode_debut
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_parrain_id uuid;
  v_dob date;
begin
  insert into public.profiles (id, email, nom, role)
  values (new.id, lower(new.email),
    coalesce(v_meta->>'nom', split_part(new.email, '@', 1)), 'agent')
  on conflict (id) do nothing;

  if v_meta ? 'code_parrainage' then
    select id into v_parrain_id from public.agents
    where code_parrainage = nullif(v_meta->>'parrain_code', '');
    begin
      v_dob := nullif(v_meta->>'date_naissance', '')::date;
    exception when others then
      v_dob := null;
    end;
    insert into public.agents (
      id, nom, email, whatsapp, pays, niveau_etudes, motivation, code_parrainage, parrain_id,
      date_naissance, periode_debut
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
      current_date
    )
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- validate_placement (commercial/admin) — admission + montant + justificatif
-- ---------------------------------------------------------------------------
create or replace function public.validate_placement(
  p_lead_id uuid,
  p_montant_service numeric,
  p_justificatif_path text,
  p_ecole_campus_id uuid default null,
  p_ecole_commission_attendue numeric default null,
  p_ecole_commission_devise text default null
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_role text;
  v_lead public.leads%rowtype;
begin
  if auth.uid() is null then raise exception 'Authentification requise' using errcode = 'P0001'; end if;
  select role into v_role from public.profiles where id = auth.uid();
  if v_role not in ('commercial', 'admin') then
    raise exception 'Accès réservé commercial/admin' using errcode = 'P0001';
  end if;
  if p_montant_service is null or p_montant_service <= 0 then
    raise exception 'Montant de service requis (> 0)' using errcode = 'P0001';
  end if;
  if coalesce(nullif(trim(p_justificatif_path), ''), '') = '' then
    raise exception 'Justificatif de paiement requis' using errcode = 'P0001';
  end if;

  select * into v_lead from public.leads where id = p_lead_id for update;
  if not found then raise exception 'Lead introuvable' using errcode = 'P0001'; end if;

  update public.leads set
    montant_service = p_montant_service,
    justificatif_paiement_path = trim(p_justificatif_path),
    admission_confirmee_at = coalesce(admission_confirmee_at, now()),
    ecole_campus_id = coalesce(p_ecole_campus_id, ecole_campus_id),
    ecole_commission_attendue = coalesce(p_ecole_commission_attendue, ecole_commission_attendue),
    ecole_commission_devise = coalesce(nullif(trim(p_ecole_commission_devise), ''), ecole_commission_devise, 'XOF'),
    statut = case
      when statut in ('acompte_paye', 'place') then statut
      else 'acompte_paye'::public.lead_statut
    end,
    updated_at = now()
  where id = p_lead_id;

  perform public.create_placement_commission(p_lead_id);

  return jsonb_build_object('ok', true, 'lead_id', p_lead_id);
end;
$$;
revoke all on function public.validate_placement(uuid, numeric, text, uuid, numeric, text) from public, anon;
grant execute on function public.validate_placement(uuid, numeric, text, uuid, numeric, text) to authenticated;

-- ---------------------------------------------------------------------------
-- create_prime_scolarite
-- ---------------------------------------------------------------------------
create or replace function public.create_prime_scolarite(p_lead_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_lead public.leads%rowtype;
  v_eligible boolean;
  v_bareme text;
  v_periode date;
begin
  select * into v_lead from public.leads where id = p_lead_id;
  if not found then raise exception 'Lead introuvable' using errcode = 'P0001'; end if;
  if v_lead.scolarite_soldee_at is null then
    raise exception 'Scolarité non soldée' using errcode = 'P0001';
  end if;
  if coalesce(nullif(trim(v_lead.justificatif_paiement_path), ''), '') = '' then
    raise exception 'Justificatif requis pour la prime' using errcode = 'P0001';
  end if;
  if v_lead.ecole_campus_id is null then
    raise exception 'Campus non renseigné' using errcode = 'P0001';
  end if;

  select eligible_prime into v_eligible from public.ecoles_campus where id = v_lead.ecole_campus_id;
  if not coalesce(v_eligible, false) then
    return jsonb_build_object('ok', true, 'created', false, 'reason', 'campus_not_eligible');
  end if;

  select version into v_bareme from public.bareme_versions where is_current limit 1;
  select coalesce(periode_debut, current_date) into v_periode from public.agents where id = v_lead.agent_id;

  insert into public.commissions (
    agent_id, lead_id, type, montant, statut,
    devise, assiette, condition_paiement, payable_at, bareme_version, periode_debut, justificatif_path
  ) values (
    v_lead.agent_id, p_lead_id, 'prime_scolarite', 150, 'pending',
    'USD', 'na', 'delai_securite', now() + interval '45 days', v_bareme, v_periode,
    v_lead.justificatif_paiement_path
  )
  on conflict (lead_id, type) do nothing;

  return jsonb_build_object('ok', true, 'created', true);
end;
$$;
revoke all on function public.create_prime_scolarite(uuid) from public, anon;
grant execute on function public.create_prime_scolarite(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- mark_scolarite_soldee
-- ---------------------------------------------------------------------------
create or replace function public.mark_scolarite_soldee(
  p_lead_id uuid,
  p_justificatif_path text
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_role text;
begin
  if auth.uid() is null then raise exception 'Authentification requise' using errcode = 'P0001'; end if;
  select role into v_role from public.profiles where id = auth.uid();
  if v_role not in ('commercial', 'admin') then
    raise exception 'Accès réservé commercial/admin' using errcode = 'P0001';
  end if;
  if coalesce(nullif(trim(p_justificatif_path), ''), '') = '' then
    raise exception 'Justificatif requis' using errcode = 'P0001';
  end if;

  update public.leads set
    scolarite_soldee_at = coalesce(scolarite_soldee_at, now()),
    justificatif_paiement_path = coalesce(nullif(trim(p_justificatif_path), ''), justificatif_paiement_path),
    updated_at = now()
  where id = p_lead_id;
  if not found then raise exception 'Lead introuvable' using errcode = 'P0001'; end if;

  return public.create_prime_scolarite(p_lead_id);
end;
$$;
revoke all on function public.mark_scolarite_soldee(uuid, text) from public, anon;
grant execute on function public.mark_scolarite_soldee(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- record_school_commission — prorata, sans délai 45 j
-- ---------------------------------------------------------------------------
create or replace function public.record_school_commission(
  p_lead_id uuid,
  p_montant numeric,
  p_devise text,
  p_recu_le timestamptz default now()
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_role text;
  v_lead public.leads%rowtype;
  v_attendu numeric;
  v_montant numeric;
  v_ratio numeric;
begin
  if auth.uid() is null then raise exception 'Authentification requise' using errcode = 'P0001'; end if;
  select role into v_role from public.profiles where id = auth.uid();
  if v_role <> 'admin' then
    raise exception 'Accès réservé admin' using errcode = 'P0001';
  end if;
  if p_montant is null or p_montant < 0 then
    raise exception 'Montant invalide' using errcode = 'P0001';
  end if;

  select * into v_lead from public.leads where id = p_lead_id for update;
  if not found then raise exception 'Lead introuvable' using errcode = 'P0001'; end if;

  v_attendu := coalesce(v_lead.ecole_commission_attendue, p_montant);
  v_ratio := case when v_attendu > 0 then least(p_montant / v_attendu, 1) else 1 end;
  -- Commission d'apport agent = montant encaissé * ratio (prorata). Si prévisionnel connu, appliquer le ratio.
  v_montant := round(coalesce(v_lead.ecole_commission_attendue, p_montant) * v_ratio, 2);
  -- Si on a un prévisionnel sur la ligne commission, préférer ce montant * ratio
  select round(coalesce(montant_previsionnel, v_montant) * v_ratio, 2)
  into v_montant
  from public.commissions
  where lead_id = p_lead_id and type = 'apport_ecole'
  limit 1;
  v_montant := coalesce(v_montant, round(p_montant * v_ratio, 2));

  update public.leads set
    ecole_commission_montant = p_montant,
    ecole_commission_devise = coalesce(nullif(trim(p_devise), ''), ecole_commission_devise, 'XOF'),
    ecole_commission_recue_at = coalesce(p_recu_le, now()),
    updated_at = now()
  where id = p_lead_id;

  if p_montant = 0 then
    update public.commissions set
      montant = 0,
      statut = 'attente_ecole',
      motif_annulation = coalesce(motif_annulation, 'Encaissement école nul')
    where lead_id = p_lead_id and type = 'apport_ecole' and statut in ('attente_ecole', 'pending');
    return jsonb_build_object('ok', true, 'montant', 0, 'statut', 'attente_ecole');
  end if;

  update public.commissions set
    montant = v_montant,
    devise = coalesce(nullif(trim(p_devise), ''), devise, 'XOF'),
    statut = 'payable',
    payable_at = coalesce(p_recu_le, now()),
    condition_paiement = 'encaissement_ecole'
  where lead_id = p_lead_id and type = 'apport_ecole'
    and statut not in ('paid', 'annulee', 'caduque', 'gelee');

  if not exists (
    select 1 from public.commissions
    where lead_id = p_lead_id and type = 'apport_ecole'
  ) then
    insert into public.commissions (
      agent_id, lead_id, type, montant, statut, devise, assiette, condition_paiement, payable_at, montant_previsionnel
    ) values (
      v_lead.agent_id, p_lead_id, 'apport_ecole', v_montant, 'payable',
      coalesce(nullif(trim(p_devise), ''), 'XOF'), 'commission_ecole', 'encaissement_ecole',
      coalesce(p_recu_le, now()), v_lead.ecole_commission_attendue
    );
  end if;

  return jsonb_build_object('ok', true, 'montant', v_montant, 'statut', 'payable');
end;
$$;
revoke all on function public.record_school_commission(uuid, numeric, text, timestamptz) from public, anon;
grant execute on function public.record_school_commission(uuid, numeric, text, timestamptz) to authenticated;

-- ---------------------------------------------------------------------------
-- lapse_school_commissions — caducité 24 mois
-- ---------------------------------------------------------------------------
create or replace function public.lapse_school_commissions()
returns integer language plpgsql security definer set search_path = public as $$
declare v_count int;
begin
  update public.commissions c
  set statut = 'caduque',
      motif_annulation = coalesce(motif_annulation, 'Caducité 24 mois (art. 13.7 e)')
  from public.leads l
  where c.lead_id = l.id
    and c.type = 'apport_ecole'
    and c.statut = 'attente_ecole'
    and l.ecole_commission_recue_at is null
    and coalesce(l.admission_confirmee_at, l.created_at) <= now() - interval '24 months';
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;
revoke all on function public.lapse_school_commissions() from public, anon, authenticated;
grant execute on function public.lapse_school_commissions() to service_role;

-- ---------------------------------------------------------------------------
-- reverse_commission / freeze_commissions
-- ---------------------------------------------------------------------------
create or replace function public.reverse_commission(p_id uuid, p_motif text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_role text;
  v_c public.commissions%rowtype;
  v_new uuid;
begin
  if auth.uid() is null then raise exception 'Authentification requise' using errcode = 'P0001'; end if;
  select role into v_role from public.profiles where id = auth.uid();
  if v_role <> 'admin' then raise exception 'Accès réservé admin' using errcode = 'P0001'; end if;
  if coalesce(nullif(trim(p_motif), ''), '') = '' then
    raise exception 'Motif requis' using errcode = 'P0001';
  end if;

  select * into v_c from public.commissions where id = p_id for update;
  if not found then raise exception 'Commission introuvable' using errcode = 'P0001'; end if;

  if v_c.statut = 'paid' then
    insert into public.commissions (
      agent_id, lead_id, type, montant, statut, devise, assiette, condition_paiement,
      taux_applique, bareme_version, motif_annulation, reversal_of, periode_debut
    ) values (
      v_c.agent_id, v_c.lead_id, v_c.type, -abs(v_c.montant), 'paid', v_c.devise, v_c.assiette, v_c.condition_paiement,
      v_c.taux_applique, v_c.bareme_version, trim(p_motif), v_c.id, v_c.periode_debut
    ) returning id into v_new;
    update public.commissions set motif_annulation = trim(p_motif) where id = v_c.id;
    return jsonb_build_object('ok', true, 'mode', 'reversal', 'reversal_id', v_new);
  end if;

  update public.commissions set
    statut = 'annulee',
    motif_annulation = trim(p_motif)
  where id = v_c.id;
  return jsonb_build_object('ok', true, 'mode', 'annulee');
end;
$$;
revoke all on function public.reverse_commission(uuid, text) from public, anon;
grant execute on function public.reverse_commission(uuid, text) to authenticated;

create or replace function public.freeze_commissions(p_agent_id uuid, p_motif text)
returns integer language plpgsql security definer set search_path = public as $$
declare
  v_role text;
  v_count int;
begin
  if auth.uid() is null then raise exception 'Authentification requise' using errcode = 'P0001'; end if;
  select role into v_role from public.profiles where id = auth.uid();
  if v_role <> 'admin' then raise exception 'Accès réservé admin' using errcode = 'P0001'; end if;

  update public.commissions set
    statut = 'gelee',
    motif_annulation = coalesce(nullif(trim(p_motif), ''), motif_annulation, 'Gel administratif')
  where agent_id = p_agent_id
    and statut in ('pending', 'payable', 'attente_ecole');
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;
revoke all on function public.freeze_commissions(uuid, text) from public, anon;
grant execute on function public.freeze_commissions(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- revise_tiers — cron annuel à l'anniversaire
-- ---------------------------------------------------------------------------
create or replace function public.revise_tiers()
returns integer language plpgsql security definer set search_path = public as $$
declare
  r record;
  v_count int := 0;
  v_new_tier public.agent_tier;
begin
  for r in
    select id, tier, placements_periode, periode_debut
    from public.agents
    where periode_debut is not null
      and periode_debut + interval '1 year' <= current_date
      and statut in ('essai', 'officiel')
  loop
    if coalesce(r.placements_periode, 0) >= 3 then
      v_new_tier := r.tier; -- maintien
    else
      v_new_tier := case r.tier
        when 'elite' then 'argent'::public.agent_tier
        when 'argent' then 'bronze'::public.agent_tier
        else 'bronze'::public.agent_tier
      end;
    end if;

    update public.agents set
      tier = v_new_tier,
      placements_periode = 0,
      periode_debut = current_date
    where id = r.id;
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;
revoke all on function public.revise_tiers() from public, anon, authenticated;
grant execute on function public.revise_tiers() to service_role;

-- ---------------------------------------------------------------------------
-- get_my_contract_download — agent: signed URL metadata (path + hash)
-- Commercial redacted view via security definer
-- ---------------------------------------------------------------------------
create or replace function public.get_my_contract_download()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_c public.contracts%rowtype;
begin
  if v_uid is null then raise exception 'Authentification requise' using errcode = 'P0001'; end if;
  select * into v_c from public.contracts
  where agent_id = v_uid and status = 'signed'
  order by signed_at desc nulls last
  limit 1;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'no_signed_contract');
  end if;
  return jsonb_build_object(
    'ok', true,
    'contract_id', v_c.id,
    'version', v_c.version,
    'pdf_path', v_c.pdf_path,
    'sha256', v_c.sha256,
    'signed_at', v_c.signed_at,
    'expires_in_seconds', 60
  );
end;
$$;
revoke all on function public.get_my_contract_download() from public, anon;
grant execute on function public.get_my_contract_download() to authenticated;

create or replace function public.get_contract_for_commercial(p_contract_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_role text;
  v_c public.contracts%rowtype;
  v_agent public.agents%rowtype;
  v_commercial_name text;
begin
  if v_uid is null then raise exception 'Authentification requise' using errcode = 'P0001'; end if;
  select role into v_role from public.profiles where id = auth.uid();
  if v_role not in ('commercial', 'admin') then
    raise exception 'Accès réservé' using errcode = 'P0001';
  end if;

  select * into v_c from public.contracts where id = p_contract_id;
  if not found then raise exception 'Contrat introuvable' using errcode = 'P0001'; end if;
  select * into v_agent from public.agents where id = v_c.agent_id;

  if v_role = 'commercial' then
    select commercial into v_commercial_name
    from public.rr_state
    where email = (select email from public.profiles where id = v_uid)
    limit 1;

    if v_commercial_name is null or not exists (
      select 1 from public.leads l
      where l.agent_id = v_c.agent_id and l.assigned_to = v_commercial_name
    ) then
      raise exception 'Contrat non accessible' using errcode = 'P0001';
    end if;
  end if;

  -- Version commercial : sans bloc coordonnées de paiement (art. 16.5)
  return jsonb_build_object(
    'ok', true,
    'contract_id', v_c.id,
    'agent_nom', v_agent.nom,
    'version', v_c.version,
    'pdf_path', v_c.pdf_path,
    'sha256', v_c.sha256,
    'signed_at', v_c.signed_at,
    'status', v_c.status,
    'redacted', v_role = 'commercial',
    'payment_block_hidden', true,
    'expires_in_seconds', 60
  );
end;
$$;
revoke all on function public.get_contract_for_commercial(uuid) from public, anon;
grant execute on function public.get_contract_for_commercial(uuid) to authenticated;
