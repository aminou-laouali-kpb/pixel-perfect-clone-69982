-- 1. Scope admin DELETE policies to authenticated role only
DROP POLICY IF EXISTS "Admin peut supprimer des agents" ON public.agents;
CREATE POLICY "Admin peut supprimer des agents"
  ON public.agents FOR DELETE TO authenticated
  USING (public.current_user_role() = 'admin'::user_role);

DROP POLICY IF EXISTS "Admin peut supprimer des commissions" ON public.commissions;
CREATE POLICY "Admin peut supprimer des commissions"
  ON public.commissions FOR DELETE TO authenticated
  USING (public.current_user_role() = 'admin'::user_role);

-- 2. Fix mutable search_path on helper functions
CREATE OR REPLACE FUNCTION public.taux_for_placements(p_count integer)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $$
  select case
    when p_count >= 11 then 0.30
    when p_count >= 6 then 0.20
    else 0.15
  end;
$$;

CREATE OR REPLACE FUNCTION public.tier_for_placements(p_count integer)
RETURNS public.agent_tier
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $$
  select case
    when p_count >= 11 then 'elite'::public.agent_tier
    when p_count >= 6 then 'argent'::public.agent_tier
    else 'bronze'::public.agent_tier
  end;
$$;

-- 3. Storage policies for the private 'contracts' bucket
-- Object paths are 'contracts/<agent_uid>/<version>.txt' and 'signatures/<agent_uid>/<version>.png'
DROP POLICY IF EXISTS "contracts_bucket_owner_read" ON storage.objects;
CREATE POLICY "contracts_bucket_owner_read"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'contracts'
    AND (
      public.current_user_role() = 'admin'::user_role
      OR (storage.foldername(name))[2] = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "contracts_bucket_admin_insert" ON storage.objects;
CREATE POLICY "contracts_bucket_admin_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'contracts'
    AND public.current_user_role() = 'admin'::user_role
  );

DROP POLICY IF EXISTS "contracts_bucket_admin_update" ON storage.objects;
CREATE POLICY "contracts_bucket_admin_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'contracts'
    AND public.current_user_role() = 'admin'::user_role
  )
  WITH CHECK (
    bucket_id = 'contracts'
    AND public.current_user_role() = 'admin'::user_role
  );

DROP POLICY IF EXISTS "contracts_bucket_admin_delete" ON storage.objects;
CREATE POLICY "contracts_bucket_admin_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'contracts'
    AND public.current_user_role() = 'admin'::user_role
  );
