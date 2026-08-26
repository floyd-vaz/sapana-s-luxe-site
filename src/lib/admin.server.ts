import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type AdminContext = {
  supabase: SupabaseClient<Database>;
  userId: string;
};

export async function assertAdmin(context: AdminContext) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });

  if (error) {
    console.error("Admin role check failed", error);
    throw new Error("Could not verify admin access");
  }

  if (!data) throw new Error("Forbidden");
}