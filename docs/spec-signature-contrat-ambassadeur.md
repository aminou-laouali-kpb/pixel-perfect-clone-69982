# Spec — Signature du contrat ambassadeur en plateforme

**Version :** 1.1 · **Date :** 2026-07-27  
**Statut :** prêt à implémenter · **Remplace :** `docs/contrat-ambassadeur-kpb-global.md` (brouillon)  
**Document contractuel de référence :** `Contrat_Ambassadeur_KPB_v3.1.docx`

Cet addendum couvre trois chantiers liés, à livrer ensemble : le changement de barème, la signature électronique avec valeur probante, et le téléchargement du contrat par les trois rôles.

---

## 1. Décisions métier figées

| Sujet | Décision | Article contrat |
|---|---|---|
| Barème | Bronze 1–5 → **15 %** · Argent 6–10 → **20 %** · Élite 11+ → **30 %** | Annexe 1 |
| Assiette a) | Honoraires de service KPB encaissés, HT, hors sommes reversées à des tiers | 13.1 a) |
| Assiette b) | Commission encaissée par KPB auprès de l'établissement, nette | 13.1 b) |
| Paiement assiette b) | **Uniquement après encaissement effectif par KPB**, conditionné au règlement intégral des frais de scolarité. Prorata si partiel. Rien dû si l'école ne paie pas. Caduque après 24 mois. | 13.7 |
| Fait générateur | Admission confirmée **ET** encaissement des honoraires **ET** justificatif téléversé | 12 + Annexe 5 |
| Compteur de palier | Parrainages validés de l'**année contractuelle** en cours | 13.2 |
| Révision de palier | Maintien si ≥ 3 parrainages validés sur l'année écoulée, sinon rétrogradation d'un cran | 13.5 |
| Taux | **Figé** dans la ligne `commissions` à la création (`taux_applique`) | 13.3 |
| Bonus paliers | 3 → 20 000 · 5 → 50 000 · 10 → 100 000 FCFA, une fois par année contractuelle | Annexe 3 |
| Prime scolarité | **150 USD**, campus d'inscription **en France**, 100 % frais année 1 | 14 + Annexe 2 |
| Délai de sécurité | **45 jours** — assiette a), bonus et prime uniquement | 17.1 |
| Arrêté / paiement | Cut-off le 25, versement du 1er au 5 | 16.2 |
| Seuil de versement | 50 USD ≈ 30 000 FCFA, reporté sinon | 16.3 |
| Âge minimum | 18 ans, `date_naissance` obligatoire à la candidature | 3.2 |

### 1.1 Impacts code existant

- `src/lib/utils.ts` → `TIERS` : seuils `1-5 / 6-10 / 11+`, taux `15/20/30`.
- Taux **écrit** dans `commissions.taux_applique` à la création (pas dérivé à la lecture).
- `agents.placements_periode` + `periode_debut` pour le palier (plus `placements_count` seul).
- Promesse marque : **« 15 à 30 % »**.
- `bonus_dossier` : lecture seule / legacy.
- Tables `ecoles` / `ecoles_campus` pour `eligible_prime`.

---

## 2. Schéma (migrations)

### 2.1 `contracts`

Une ligne par version signée. Ne jamais écraser : une modification de barème crée une nouvelle ligne et passe la précédente en `superseded`.

Champs clés : `agent_id`, `version`, `bareme_snapshot`, `pdf_path`, `sha256`, `accepted_*`, `signature_path`, `signed_at`, `signed_ip`, `signed_user_agent`, `kpb_signatory_*`, `status` (`draft|signed|superseded|revoked`), `superseded_by`.

### 2.2 `bareme_versions`

`version` PK, `effective_from`, `contenu` jsonb, `is_current` (unique partial).

### 2.3 Colonnes

**agents :** `date_naissance`, `contrat_signe_at`, `contrat_id`, `periode_debut`, `placements_periode`  
**commissions :** `taux_applique`, `bareme_version`, `devise`, `assiette`, `condition_paiement`, `montant_previsionnel`, `payable_at`, `justificatif_path`, `motif_annulation`, `reversal_of` ; statuts `pending|attente_ecole|payable|paid|gelee|annulee|caduque` ; types `placement|apport_ecole|bonus_palier|prime_scolarite|bonus_dossier`  
**leads :** `ecole_campus_id`, `admission_confirmee_at`, `scolarite_soldee_at`, `justificatif_paiement_path`, `ecole_commission_*`

### 2.4 `ecoles` / `ecoles_campus`

`eligible_prime = true` pour campus FR : INSEEC GE, ECE, ESCE, Sup de Pub, HEIP, ICN Paris La Défense. Schiller Paris = arbitrage direction. Sinon `false`.

---

## 3. RPC / serveur

| Fonction | Comportement |
|---|---|
| `prepare_contract` | PDF déterministe + SHA-256 + draft idempotent |
| `sign_contract` | Preuves + `signed` + update agent ; refuse si nom ≠ compte |
| `submit_referral_lead` | **Garde** contrat `signed` |
| `validate_placement` | `placement` (délai 45 j) + `apport_ecole` (`attente_ecole`) |
| `mark_scolarite_soldee` | Prime si campus éligible |
| `record_school_commission` | Prorata apport, sans délai 45 j |
| `lapse_school_commissions` | Caducité 24 mois |
| `create_bonus_palier` / `create_prime_scolarite` | Unicité période / règles FR |
| `reverse_commission` / `freeze_commissions` | Admin |
| `revise_tiers` | Cron annuel |
| `mark_payable` | Cron : `pending→payable` si `payable_at` ; **jamais** `encaissement_ecole` |

PDF généré **serveur uniquement**, hash reproductible.

---

## 4. Téléchargement

| Rôle | Contenu |
|---|---|
| Ambassadeur | Son contrat complet, URL signée 60 s |
| Commercial | Agents invités, **sans** IBAN / paiement |
| Admin | Tout + preuves + CSV |

Bucket privé + RLS.

---

## 5. UX signature

1. Quiz OK → `essai`, lien **verrouillé serveur**.
2. Scroll intégral obligatoire + 3 cases + nom retapé + canvas/import.
3. `sign_contract` → PDF final → déverrouillage.
4. Signature KPB admin pré-enregistrée, apposée auto.

### 5 bis. Transparence apport

Deux compteurs dashboard : **disponible** vs **en attente**. Jamais additionner prévisionnel + ferme. Notifier chaque étape.

---

## 6. Re-consentement barème

`bareme_versions` J+30 → notif → bannière bloquante → sans signature : verrouillage activité future (sommes acquises dues).

---

## 7. Migration existants

1. Déployer 15/20/30 d'abord.  
2. Rattrapage placements validés.  
3. Bannière signature.  
4. WhatsApp : cadrage revalorisation.

---

## 8. QA (extrait)

- [ ] < 18 ans → candidature refusée  
- [ ] Lien inactif sans contrat `signed` (**RPC**)  
- [ ] `submit_referral_lead` rejette agent non signataire  
- [ ] Signature : scroll + cases + nom matching  
- [ ] Hash PDF déterministe  
- [ ] Commission : `taux_applique` + `payable_at` +45 j  
- [ ] Barème nouveau → pending non recalculées  
- [ ] Double ligne `placement` + `apport_ecole`  
- [ ] `mark_payable` ignore `apport_ecole`  
- [ ] Prorata / caducité école  
- [ ] Dashboard soldes séparés  
- [ ] Seuil 30 000 FCFA  
- [ ] Matrice téléchargement rôles  

---

## 9. Fichiers d'implémentation

| Zone | Fichiers |
|---|---|
| Migrations | `supabase/migrations/20260727190000_*.sql` … |
| Barème UI | `src/lib/utils.ts`, landing, dashboard |
| Âge | `src/routes/candidater.tsx` |
| Contrat | `src/routes/_authenticated/contrat.tsx`, `src/lib/contracts.functions.ts` |
| Garde leads | migration `submit_referral_lead` |
| Spec globale | `docs/spec-globale-kpb.md` (promesse 15–30 %) |
