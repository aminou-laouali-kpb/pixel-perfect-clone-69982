# KPB Education — Programme Ambassadeur

Plateforme de recrutement et de suivi des agents / ambassadeurs KPB Education (TanStack Start + Supabase).

## Stack

- **Frontend** : TanStack Start / Router, React 19, Tailwind CSS 4
- **Data** : Supabase (Auth, Postgres, RLS, RPC)
- **Package manager** : Bun

## Setup local

```bash
cp .env.example .env
# Remplir SUPABASE_* / VITE_SUPABASE_* (clé anon / publishable uniquement côté client)
bun install
bun run dev
```

Variables serveur (invitation d’agents) : `SUPABASE_SERVICE_ROLE_KEY` — ne jamais l’exposer au client Vite.

## Scripts

| Commande            | Description                 |
| ------------------- | --------------------------- |
| `bun run dev`       | Serveur de développement    |
| `bun run build`     | Build production            |
| `bun run lint`      | ESLint                      |
| `bun run typecheck` | TypeScript (`tsc --noEmit`) |
| `bun run test`      | Tests unitaires Vitest      |
| `bun run format`    | Prettier                    |

## Rôles

| Rôle         | Accès                                              |
| ------------ | -------------------------------------------------- |
| `agent`      | Dashboard, quiz, kit marketing, lien de parrainage |
| `commercial` | Portefeuille leads, invitation d’agents            |
| `admin`      | Administration + espace commercial                 |

Les gardes de route (`beforeLoad`) + RLS Postgres protègent les données.

## Architecture utile

- Routes fichier : `src/routes/`
- RPC métier : `submit_quiz_attempt`, `submit_referral_lead`, `assign_lead_round_robin`, …
- Migrations : `supabase/migrations/`
- Seed admin manuel : voir `supabase/seed/README.md` (ne pas hardcoder d’emails en migration)

## Notes sécurité

- Les réponses du quiz ne sont **pas** expédiées au client ; le score est calculé côté Postgres.
- `submit_referral_lead` applique un rate-limit (contact / agent).
- `.env` est gitignoré — utiliser `.env.example` comme modèle.
