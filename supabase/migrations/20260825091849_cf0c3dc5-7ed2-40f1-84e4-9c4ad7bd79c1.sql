-- 1) Harden has_role: signed-in callers may only check their OWN roles.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN auth.uid() IS NOT NULL AND _user_id IS DISTINCT FROM auth.uid() THEN false
    ELSE EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id AND role = _role
    )
  END
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

-- 2) rate_limits: internal-only table. Lock it down explicitly.
REVOKE ALL ON TABLE public.rate_limits FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.rate_limits TO service_role;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rate_limits_no_client_access ON public.rate_limits;
CREATE POLICY rate_limits_no_client_access
  ON public.rate_limits
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

COMMENT ON TABLE public.rate_limits IS 'Internal rate limiting ledger. Written only by trusted server code (service role). No client access by design.';