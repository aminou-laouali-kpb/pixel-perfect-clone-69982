# Seeds manuels

Les migrations historiques peuvent contenir un bootstrap admin nominatif.
Pour les nouveaux environnements, **ne pas** ajouter d’emails personnels dans les migrations.

Promouvoir un admin via le SQL editor Supabase (après création du compte) :

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'votre-admin@exemple.com';
```

Ou via l’UI Administration une fois qu’un premier admin existe (`set_user_role`).
