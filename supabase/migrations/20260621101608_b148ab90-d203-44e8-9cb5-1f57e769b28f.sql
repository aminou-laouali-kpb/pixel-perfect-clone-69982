
-- 1. Lock down agents self-update via RLS WITH CHECK
DROP POLICY IF EXISTS "Agent modifie son propre profil" ON public.agents;
CREATE POLICY "Agent modifie son propre profil"
ON public.agents
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND tier               IS NOT DISTINCT FROM (SELECT tier               FROM public.agents WHERE id = auth.uid())
  AND placements_count   IS NOT DISTINCT FROM (SELECT placements_count   FROM public.agents WHERE id = auth.uid())
  AND statut             IS NOT DISTINCT FROM (SELECT statut             FROM public.agents WHERE id = auth.uid())
  AND quiz_score         IS NOT DISTINCT FROM (SELECT quiz_score         FROM public.agents WHERE id = auth.uid())
  AND quiz_passed_at     IS NOT DISTINCT FROM (SELECT quiz_passed_at     FROM public.agents WHERE id = auth.uid())
  AND quiz_retry_at      IS NOT DISTINCT FROM (SELECT quiz_retry_at      FROM public.agents WHERE id = auth.uid())
  AND parrain_id         IS NOT DISTINCT FROM (SELECT parrain_id         FROM public.agents WHERE id = auth.uid())
  AND email              IS NOT DISTINCT FROM (SELECT email              FROM public.agents WHERE id = auth.uid())
  AND code_parrainage    IS NOT DISTINCT FROM (SELECT code_parrainage    FROM public.agents WHERE id = auth.uid())
);

-- 2. Restrict rr_state SELECT: commercials see only their own row; admins see all
DROP POLICY IF EXISTS "Commercial et admin voient rr_state" ON public.rr_state;

CREATE POLICY "Admin voit tout rr_state"
ON public.rr_state
FOR SELECT
TO authenticated
USING (public.current_user_role() = 'admin'::user_role);

CREATE POLICY "Commercial voit sa propre ligne rr_state"
ON public.rr_state
FOR SELECT
TO authenticated
USING (
  public.current_user_role() = 'commercial'::user_role
  AND lower(email) = lower((SELECT email FROM public.profiles WHERE id = auth.uid()))
);

-- 3. Safe helper for commercial UI (no PII)
CREATE OR REPLACE FUNCTION public.list_rr_state_basic()
RETURNS TABLE(id integer, commercial text, leads_total integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id, r.commercial, r.leads_total
  FROM public.rr_state r
  WHERE public.current_user_role() IN ('admin'::user_role, 'commercial'::user_role)
  ORDER BY r.id;
$$;

REVOKE EXECUTE ON FUNCTION public.list_rr_state_basic() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_rr_state_basic() TO authenticated;
