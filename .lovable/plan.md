## Ce que j'ai vérifié

- Le serveur local répond bien en **200** et la page d'accueil est rendue complètement (aucune erreur « Missing Supabase environment variable(s) » dans le HTML servi).
- Le fichier `.env` du projet contient bien les 6 variables attendues (`SUPABASE_*` et `VITE_SUPABASE_*`).
- L'erreur affichée dans ta preview provient d'un **bundle de preview daté** (`index-n40VBQdO.js`), généré à un moment où les variables `VITE_SUPABASE_*` n'étaient pas injectées au build. Le code lève alors une exception au tout premier accès au client backend, ce qui fait tomber toute la page sur l'écran d'erreur.

Donc : le code est bon, c'est le build de preview qui est périmé. Un simple rechargement forcé après un nouveau build suffit normalement — mais comme le problème est déjà revenu plusieurs fois, je propose aussi un correctif pour que ça ne casse plus l'affichage entier.

## Ce que je propose de faire

1. **Régénérer la preview** et vérifier avec un navigateur automatisé que la page d'accueil se charge sans erreur console (URL de preview, pas seulement en local).
2. **Rendre l'échec non bloquant** : au lieu de faire planter le rendu de toute l'application quand la configuration backend manque, afficher une bannière d'erreur claire et laisser les pages publiques (accueil, candidater, confidentialité) s'afficher normalement. Les pages qui ont réellement besoin du backend afficheront le message explicite.
3. **Vérifier l'injection des variables au build** : confirmer que les variables `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` sont bien présentes dans le bundle produit, pour identifier si le problème vient d'un build lancé avant l'activation du backend.

## Détails techniques

- `src/integrations/supabase/client.ts` est un fichier généré et ne doit pas être modifié : le garde-fou sera ajouté côté application (un composant limite d'erreur/état dégradé autour de `AuthProvider` dans `src/routes/__root.tsx`, et un test de configuration côté client).
- Aucun changement de schéma ni de logique métier ; uniquement du rendu et de la robustesse.
