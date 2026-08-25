-- Restore execute grant (required for policy evaluation) and drop SECURITY DEFINER.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- user_roles must be self-readable without recursing through has_role.
DROP POLICY IF EXISTS user_roles_select_own ON public.user_roles;
CREATE POLICY user_roles_select_own
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- has_role becomes SECURITY INVOKER: it can only ever see rows the caller is
-- allowed to see (their own), which is exactly what every policy checks.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;