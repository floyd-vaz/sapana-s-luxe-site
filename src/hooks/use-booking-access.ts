import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export function useBookingAccess() {
  const navigate = useNavigate();

  return async function withBookingAccess(onAuthenticated?: () => void) {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      await navigate({ to: "/auth", search: { redirect: "book" } });
      return false;
    }

    onAuthenticated?.();
    return true;
  };
}