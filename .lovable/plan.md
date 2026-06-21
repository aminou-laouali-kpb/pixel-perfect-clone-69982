## Problème

À l'inscription d'un nouvel agent sur `/candidater`, Supabase exige une confirmation par email. Le mail reçu redirige vers une page peu claire (souvent perçue comme une nouvelle inscription), ce qui casse le parcours : l'agent ne peut pas continuer vers le quiz et finaliser son profil.

## Solution

Activer l'auto-confirmation des emails côté backend pour que la session soit créée immédiatement après l'inscription. L'agent enchaîne directement sur le quiz de qualification puis son dashboard, sans étape email.

## Changements

1. **Backend (auth settings)** — activer `auto_confirm_email` pour que `supabase.auth.signUp` retourne directement une `session`. Les autres réglages (HIBP, signups, anonymes) restent inchangés.

2. **`src/routes/candidater.tsx`** — retirer la branche `needsConfirmation` (état + écran "Vérifiez votre boîte mail"). Après `signUp` réussi, on `refetchAuth()` et on navigue vers `/quiz` directement. Garder un fallback d'erreur clair si jamais aucune session n'est renvoyée.

## Conséquences

- N'importe quelle adresse email (même fausse) crée un compte actif. C'est acceptable ici car le WhatsApp est la voie de contact principale et les commerciaux/admins valident les candidatures.
- Les comptes déjà créés mais non confirmés deviendront utilisables (auto-confirmés au prochain login). Aucune action requise.
- Les emails de reset de mot de passe continuent de fonctionner normalement.
