import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  adminExceptionSchema,
  adminReviewSchema,
  adminServiceSchema,
  adminUpdateAppointmentSchema,
} from "./booking.schemas";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden");
}

export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: Boolean(data) };
  });

export const adminListAppointments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("appointments")
      .select("*")
      .order("date", { ascending: false })
      .limit(200);
    if (error) throw new Error("Could not load appointments");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: services }, { data: staff }] = await Promise.all([
      supabaseAdmin.from("services").select("id, name"),
      supabaseAdmin.from("staff").select("id, name"),
    ]);
    const serviceName = new Map((services ?? []).map((s) => [s.id, s.name]));
    const staffName = new Map((staff ?? []).map((s) => [s.id, s.name]));

    return (data ?? []).map((a: any) => ({
      ...a,
      serviceNames: (a.service_ids ?? []).map((id: string) => serviceName.get(id) ?? "Service"),
      stylist: a.staff_id ? (staffName.get(a.staff_id) ?? null) : null,
    }));
  });

export const adminUpdateAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => adminUpdateAppointmentSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const patch = {
      ...(data.status ? { status: data.status } : {}),
      ...(data.paymentStatus ? { payment_status: data.paymentStatus } : {}),
      ...(data.date ? { date: data.date } : {}),
      ...(data.timeSlot ? { time_slot: data.timeSlot } : {}),
    };

    const { data: updated, error } = await context.supabase
      .from("appointments")
      .update(patch)
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw new Error("Could not update the appointment");

    if (data.status === "CONFIRMED" || data.status === "CANCELLED" || data.status === "COMPLETED") {
      const { notifyBooking } = await import("./notifications.server");
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: services } = await supabaseAdmin
        .from("services")
        .select("name")
        .in("id", updated.service_ids ?? []);
      await notifyBooking({
        event: data.status === "CONFIRMED" ? "confirmed" : data.status === "CANCELLED" ? "cancelled" : "completed",
        customerName: updated.customer_name,
        customerPhone: updated.customer_phone,
        customerEmail: null,
        date: updated.date,
        timeSlot: updated.time_slot,
        services: (services ?? []).map((s) => s.name),
        totalPrice: Number(updated.total_price),
      });
    }

    return { ok: true };
  });

export const adminListServices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("services")
      .select("*")
      .order("category")
      .order("name");
    if (error) throw new Error("Could not load services");
    return data ?? [];
  });

export const adminSaveService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => adminServiceSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const row = {
      category: data.category,
      name: data.name,
      price: data.price,
      duration_min: data.durationMin,
      description: data.description || null,
      active_status: data.activeStatus,
    };
    const query = data.id
      ? context.supabase.from("services").update(row).eq("id", data.id)
      : context.supabase.from("services").insert(row);
    const { error } = await query;
    if (error) throw new Error("Could not save the service");
    return { ok: true };
  });

export const adminListReviews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error("Could not load reviews");
    return data ?? [];
  });

export const adminSetReviewApproval = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => adminReviewSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("reviews")
      .update({ approved_status: data.approvedStatus })
      .eq("id", data.id);
    if (error) throw new Error("Could not update the review");
    return { ok: true };
  });

export const adminListExceptions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("availability_exceptions")
      .select("*")
      .order("date");
    if (error) throw new Error("Could not load blocked dates");
    return data ?? [];
  });

export const adminSaveException = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => adminExceptionSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("availability_exceptions").upsert(
      {
        date: data.date,
        reason: data.reason,
        is_full_day_block: data.isFullDayBlock,
        blocked_slots: data.blockedSlots,
      },
      { onConflict: "date" },
    );
    if (error) throw new Error("Could not save the blocked date");
    return { ok: true };
  });

export const adminDeleteException = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => ({ id: String((data as { id: string }).id) }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("availability_exceptions")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error("Could not remove the blocked date");
    return { ok: true };
  });

export const adminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const today = new Date();
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    const weekAgo = new Date(today.getTime() - 6 * 86_400_000);

    const [{ data: appointments }, { data: services }, { count: clientCount }] = await Promise.all([
      context.supabase
        .from("appointments")
        .select("id, date, status, payment_status, total_price, service_ids")
        .gte("date", iso(weekAgo)),
      context.supabase.from("services").select("id, name, price, active_status"),
      context.supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]);

    const rows = appointments ?? [];
    const live = rows.filter((a) => a.status !== "CANCELLED");
    const todayRows = live.filter((a) => a.date === iso(today));
    const serviceName = new Map((services ?? []).map((s) => [s.id, s.name]));

    const tally = new Map<string, { name: string; count: number; revenue: number }>();
    for (const a of live) {
      for (const id of a.service_ids ?? []) {
        const key = serviceName.get(id) ?? "Service";
        const entry = tally.get(key) ?? { name: key, count: 0, revenue: 0 };
        entry.count += 1;
        entry.revenue += Number(a.total_price) / Math.max((a.service_ids ?? []).length, 1);
        tally.set(key, entry);
      }
    }

    return {
      todayBookings: todayRows.length,
      weekBookings: live.length,
      pending: live.filter((a) => a.status === "PENDING").length,
      weekRevenue: live.reduce((sum, a) => sum + Number(a.total_price), 0),
      todayRevenue: todayRows.reduce((sum, a) => sum + Number(a.total_price), 0),
      collected: live
        .filter((a) => a.payment_status === "PAID")
        .reduce((sum, a) => sum + Number(a.total_price), 0),
      activeServices: (services ?? []).filter((s) => s.active_status).length,
      clients: clientCount ?? 0,
      topServices: [...tally.values()].sort((a, b) => b.count - a.count).slice(0, 5),
    };
  });

export const adminListClients = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const [{ data: profiles }, { data: appointments }] = await Promise.all([
      context.supabase
        .from("profiles")
        .select("id, name, email, phone, created_at")
        .order("created_at", { ascending: false })
        .limit(500),
      context.supabase.from("appointments").select("user_id, date, total_price, status"),
    ]);

    const byUser = new Map<string, { visits: number; spend: number; last: string | null }>();
    for (const a of appointments ?? []) {
      if (!a.user_id || a.status === "CANCELLED") continue;
      const entry = byUser.get(a.user_id) ?? { visits: 0, spend: 0, last: null };
      entry.visits += 1;
      entry.spend += Number(a.total_price);
      if (!entry.last || a.date > entry.last) entry.last = a.date;
      byUser.set(a.user_id, entry);
    }

    return (profiles ?? []).map((p) => ({
      ...p,
      visits: byUser.get(p.id)?.visits ?? 0,
      spend: byUser.get(p.id)?.spend ?? 0,
      lastVisit: byUser.get(p.id)?.last ?? null,
    }));
  });
