
-- 1) Privilege escalation: prevent users from changing their own role via UPDATE
DROP POLICY IF EXISTS "Profil modifiable par son owner" ON public.profiles;
CREATE POLICY "Profil modifiable par son owner" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- 2) Restrict commercial access to sensitive agent PII
DROP POLICY IF EXISTS "Commercial et admin voient tous les agents" ON public.agents;
CREATE POLICY "Admin voit tous les agents" ON public.agents
  FOR SELECT TO authenticated
  USING (public.current_user_role() = 'admin'::user_role);

-- Provide commercials a safe minimal view of agents (id + nom only)
CREATE OR REPLACE FUNCTION public.list_agents_basic()
RETURNS TABLE(id uuid, nom text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT a.id, a.nom
  FROM public.agents a
  WHERE public.current_user_role() IN ('admin'::user_role, 'commercial'::user_role);
$$;
REVOKE EXECUTE ON FUNCTION public.list_agents_basic() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_agents_basic() TO authenticated;

-- 3) Realtime: stop broadcasting sensitive tables (RLS does not gate postgres_changes)
ALTER PUBLICATION supabase_realtime DROP TABLE public.leads;
ALTER PUBLICATION supabase_realtime DROP TABLE public.commissions;

-- 4) Lock down internal SECURITY DEFINER helpers / triggers from being callable via the API
REVOKE EXECUTE ON FUNCTION public.current_user_role() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.current_commercial_name() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_placement_commission(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_lead_status_changed() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_lead_amount_changed() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_agent_self_update() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_profile_self_update() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.normalize_agent_insert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- Keep RPCs intended to be called by clients executable explicitly
GRANT EXECUTE ON FUNCTION public.submit_referral_lead(text, text, text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_quiz_attempt(smallint[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_lead_round_robin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(timestamptz, timestamptz, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_agent_rank() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_role(uuid, public.user_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_users_for_admin() TO authenticated;
