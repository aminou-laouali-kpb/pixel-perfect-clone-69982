-- Spec v1.1: barème 15/20/30, contracts, ecoles, commission model extensions

create extension if not exists pgcrypto;
create extension if not exists unaccent;

-- bareme_versions
create table if not exists public.bareme_versions (
  version text primary key,
  effective_from date not null,
  contenu jsonb not null,
  is_current boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists bareme_one_current
  on public.bareme_versions (is_current) where is_current;

grant select on public.bareme_versions to authenticated;
grant all on public.bareme_versions to service_role;
alter table public.bareme_versions enable row level security;
drop policy if exists bareme_versions_read on public.bareme_versions;
create policy bareme_versions_read on public.bareme_versions
  for select to authenticated using (true);

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

-- ecoles / campuses
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
grant all on public.ecoles to service_role;
grant all on public.ecoles_campus to service_role;
alter table public.ecoles enable row level security;
alter table public.ecoles_campus enable row level security;
drop policy if exists ecoles_read on public.ecoles;
create policy ecoles_read on public.ecoles for select using (true);
drop policy if exists ecoles_campus_read on public.ecoles_campus;
create policy ecoles_campus_read on public.ecoles_campus for select using (true);

-- contracts
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

grant select, insert, update, delete on public.contracts to authenticated;
grant all on public.contracts to service_role;

-- agents columns
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

-- commissions columns + constraints
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
  add column if not exists reversal_of uuid,
  add column if not exists periode_debut date;

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

alter type public.commission_type add value if not exists 'apport_ecole';
alter type public.commission_type add value if not exists 'prime_scolarite';
alter type public.commission_statut add value if not exists 'attente_ecole';
alter type public.commission_statut add value if not exists 'payable';
alter type public.commission_statut add value if not exists 'gelee';
alter type public.commission_statut add value if not exists 'annulee';
alter type public.commission_statut add value if not exists 'caduque';

-- leads campus / school commission fields
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

drop index if exists idx_commissions_bonus_palier;
create unique index if not exists idx_commissions_bonus_palier_periode
  on public.commissions (agent_id, montant, periode_debut)
  where type = 'bonus_palier';

-- Helpers
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