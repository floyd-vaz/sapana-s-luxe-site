import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Simple durable sliding-window rate limiter backed by the rate_limits table.
 * Throws when the caller exceeds `limit` hits inside `windowSeconds`.
 */
export async function enforceRateLimit(options: {
  bucket: string;
  identifier: string;
  limit: number;
  windowSeconds: number;
}): Promise<void> {
  const { bucket, identifier, limit, windowSeconds } = options;
  const since = new Date(Date.now() - windowSeconds * 1000).toISOString();

  const { count, error } = await supabaseAdmin
    .from("rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("bucket", bucket)
    .eq("identifier", identifier)
    .gte("created_at", since);

  if (error) {
    console.error("rate-limit lookup failed", error);
    return; // fail open on infrastructure errors, never block a real customer
  }

  if ((count ?? 0) >= limit) {
    throw new Error("Too many requests. Please wait a moment and try again.");
  }

  await supabaseAdmin.from("rate_limits").insert({ bucket, identifier });

  // opportunistic cleanup of stale rows
  if (Math.random() < 0.05) {
    await supabaseAdmin
      .from("rate_limits")
      .delete()
      .lt("created_at", new Date(Date.now() - 86_400_000).toISOString());
  }
}
