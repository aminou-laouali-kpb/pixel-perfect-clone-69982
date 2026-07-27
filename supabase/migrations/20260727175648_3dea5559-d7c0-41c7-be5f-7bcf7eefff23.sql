-- Audit P0/P1: rate-limit public lead ingest + align DELETE grants with RLS policies.

CREATE OR REPLACE FUNCTION public.submit_referral_lead(
  p_code text,
  p_nom text,
  p_whatsapp text,
  p_email text DEFAULT NULL,
  p_pays text DEFAULT NULL,
  p_destination text DEFAULT NULL,
  p_notes text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_agent_id uuid;
  v_lead_id uuid;
  v_commercial text;
  v_whatsapp text := nullif(trim(p_whatsapp), '');
  v_email text := nullif(trim(p_email), '');
  v_recent int;
BEGIN
  IF p_notes IS NOT NULL AND left(trim(p_notes), 9) = '__hp_bot:' THEN
    RETURN jsonb_build_object('ok', true, 'lead_id', NULL, 'duplicate', false);
  END IF;

  SELECT id INTO v_agent_id FROM public.agents WHERE code_parrainage = trim(p_code);
  IF v_agent_id IS NULL THEN
    RAISE EXCEPTION 'Code de parrainage invalide ou introuvable' USING ERRCODE = 'P0001';
  END IF;

  IF coalesce(trim(p_nom), '') = '' THEN
    RAISE EXCEPTION 'Le nom est requis' USING ERRCODE = 'P0001';
  END IF;

  IF v_whatsapp IS NULL AND v_email IS NULL THEN
    RAISE EXCEPTION 'Un moyen de contact (WhatsApp ou email) est requis' USING ERRCODE = 'P0001';
  END IF;

  SELECT count(*)::int INTO v_recent
  FROM public.leads
  WHERE created_at > now() - interval '10 minutes'
    AND (
      (v_whatsapp IS NOT NULL AND whatsapp = v_whatsapp)
      OR (v_email IS NOT NULL AND email = v_email)
    );
  IF v_recent >= 5 THEN
    RAISE EXCEPTION 'Trop de demandes. Reessayez dans quelques minutes.' USING ERRCODE = 'P0001';
  END IF;

  SELECT count(*)::int INTO v_recent
  FROM public.leads
  WHERE agent_id = v_agent_id
    AND created_at > now() - interval '1 hour';
  IF v_recent >= 30 THEN
    RAISE EXCEPTION 'Trop de demandes pour ce lien. Reessayez plus tard.' USING ERRCODE = 'P0001';
  END IF;

  IF v_whatsapp IS NOT NULL THEN
    SELECT id INTO v_lead_id
    FROM public.leads
    WHERE agent_id = v_agent_id AND whatsapp = v_whatsapp
    LIMIT 1;
    IF v_lead_id IS NOT NULL THEN
      RETURN jsonb_build_object('ok', true, 'lead_id', v_lead_id, 'duplicate', true);
    END IF;
  END IF;

  INSERT INTO public.leads (
    agent_id, assigned_to, nom, email, whatsapp, pays, destination, statut, commission_amount, notes
  )
  VALUES (
    v_agent_id,
    'pending',
    trim(p_nom),
    v_email,
    v_whatsapp,
    coalesce(nullif(trim(p_pays), ''), 'Non precise'),
    coalesce(nullif(trim(p_destination), ''), 'Non precise'),
    'nouveau',
    0,
    nullif(trim(p_notes), '')
  )
  RETURNING id INTO v_lead_id;

  SELECT commercial INTO v_commercial
  FROM public.rr_state
  ORDER BY leads_total ASC, id ASC
  LIMIT 1
  FOR UPDATE;

  IF v_commercial IS NOT NULL THEN
    UPDATE public.leads
    SET assigned_to = v_commercial, updated_at = now()
    WHERE id = v_lead_id;
    UPDATE public.rr_state
    SET leads_total = leads_total + 1
    WHERE commercial = v_commercial;
  END IF;

  RETURN jsonb_build_object('ok', true, 'lead_id', v_lead_id);
END;
$$;

REVOKE ALL ON FUNCTION public.submit_referral_lead(text, text, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_referral_lead(text, text, text, text, text, text, text) TO anon, authenticated;

GRANT DELETE ON TABLE public.agents TO authenticated;
GRANT DELETE ON TABLE public.commissions TO authenticated;