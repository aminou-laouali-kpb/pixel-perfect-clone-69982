## Cause

Quand un utilisateur connecté charge le dashboard, `useAuth` lit `public.profiles`. La policy RLS de `profiles` appelle `public.current_user_role()`. Or, lors d'une récente migration sécurité, le droit `EXECUTE` sur cette fonction a été retiré au rôle `authenticated`. Résultat : chaque requête sur `profiles` renvoie `403 permission denied for function current_user_role`, donc `profile` et `agent` sont `null` → le dashboard affiche « Profil agent introuvable ».

Visible dans les network logs :
```
GET /rest/v1/profiles?... → 403
{"code":"42501","message":"permission denied for function current_user_role"}
```

## Correction (1 migration SQL)

Re-accorder l'exécution des fonctions utilisées par les policies RLS aux rôles applicatifs, et révoquer l'accès à `PUBLIC` :

```sql
REVOKE EXECUTE ON FUNCTION public.current_user_role() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.current_user_role() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.current_commercial_name() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.current_commercial_name() TO authenticated, service_role;
```

(Les fonctions sont `SECURITY DEFINER` donc le retrait à `PUBLIC` reste safe : seul `authenticated` peut les invoquer, et elles continuent à n'exposer que la ligne du caller.)

## Vérification

Après migration :
1. Recharger `/dashboard` connecté en agent → la requête `profiles` renvoie 200, `agent` est chargé, le tableau de bord s'affiche.
2. Recharger `/admin` connecté en admin → liste utilisateurs OK (utilise aussi `current_user_role`).
3. Re-tester `/commercial` → la RPC `list_rr_state_basic` répond.

Aucun changement de code applicatif n'est nécessaire.
