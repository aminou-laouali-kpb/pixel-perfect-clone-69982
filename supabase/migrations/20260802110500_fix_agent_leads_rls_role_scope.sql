-- Prevent promoted commercials (who still have an agents row) from reading
-- leads/commissions via the agent-scoped policies. Those policies previously
-- matched only on agent_id = auth.uid() with no role check, which leaked
-- other commercials' assigned referrals into the commercial portfolio UI.

DROP POLICY IF EXISTS "Agent voit ses propres leads" ON public.leads;
CREATE POLICY "Agent voit ses propres leads"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (
    agent_id = auth.uid()
    AND public.current_user_role() = 'agent'::user_role
  );

DROP POLICY IF EXISTS "Agent voit ses commissions" ON public.commissions;
CREATE POLICY "Agent voit ses commissions"
  ON public.commissions
  FOR SELECT
  TO authenticated
  USING (
    agent_id = auth.uid()
    AND public.current_user_role() = 'agent'::user_role
  );
