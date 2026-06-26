## Objectif

Permettre aux commerciaux (et admins) d'ajouter un nouvel agent depuis leur tableau de bord. L'agent reçoit automatiquement un email d'invitation pour définir son mot de passe et se connecter.

## 1. Server function `inviteAgent`

Nouveau fichier `src/lib/agents.functions.ts` exposant `inviteAgent` :

- `createServerFn({ method: 'POST' })` + `requireSupabaseAuth`
- Valide les entrées avec zod : `nom`, `email`, `whatsapp`, `pays`, `niveau_etudes` (optionnel `motivation`)
- Vérifie via `context.supabase` que le rôle de l'appelant est `commercial` ou `admin` (sinon 403)
- Génère un `code_parrainage` unique (8 caractères alphanumériques majuscules, retry si collision)
- Charge `supabaseAdmin` à l'intérieur du handler (`await import('@/integrations/supabase/client.server')`)
- Appelle `supabaseAdmin.auth.admin.inviteUserByEmail(email, { data: { nom, whatsapp, pays, niveau_etudes, motivation, code_parrainage }, redirectTo: <origin>/auth })`
- Le trigger existant `handle_new_user` crée alors automatiquement `profiles` (rôle agent) + ligne `agents` avec le code généré
- Retourne `{ ok: true, code_parrainage }` ou erreur explicite (email déjà utilisé, etc.)

## 2. UI commercial — dialog "Ajouter un agent"

Dans `src/routes/_authenticated/commercial.tsx` :

- Ajouter un bouton `Ajouter un agent` en haut du tableau (visible pour `commercial` et `admin`)
- Ouvre un `<Dialog>` shadcn avec un formulaire (react-hook-form + zod) : Nom complet, Email, WhatsApp, Pays, Niveau d'études
- Soumission via `useServerFn(inviteAgent)` + `useMutation`
- Toast succès ("Invitation envoyée à <email>") + reset form ; toast erreur sinon
- Après succès, invalider les requêtes pertinentes

## 3. Email d'invitation

L'email part automatiquement via le système d'auth Supabase (template "Invite user"). Aucune infra email custom n'est ajoutée dans ce plan — on s'appuie sur le template par défaut déjà actif. Si tu veux brander cet email aux couleurs KPB, je le proposerai en complément (setup email infra + scaffold auth templates).

## 4. Sécurité

- Toute la logique privilégiée est server-side ; le rôle est revérifié dans le handler
- `supabaseAdmin` n'est jamais importé côté client
- Le `code_parrainage` est généré server-side (l'appelant ne peut pas l'imposer)
- RLS existantes sur `agents` / `profiles` restent inchangées

## Fichiers touchés

- ➕ `src/lib/agents.functions.ts`
- ✏️ `src/routes/_authenticated/commercial.tsx` (bouton + dialog + form)

Aucune migration SQL nécessaire : le trigger `handle_new_user` gère déjà la création des rows à partir du metadata d'invitation.