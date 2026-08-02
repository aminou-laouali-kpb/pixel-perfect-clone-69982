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