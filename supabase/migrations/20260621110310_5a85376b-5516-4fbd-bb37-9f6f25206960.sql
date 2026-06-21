REVOKE EXECUTE ON FUNCTION public.current_user_role() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.current_user_role() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.current_commercial_name() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.current_commercial_name() TO authenticated, service_role;