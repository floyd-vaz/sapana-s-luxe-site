import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  availabilityInputSchema,
  bookingInputSchema,
  cancelInputSchema,
  reviewInputSchema,
  TIME_SLOTS,
} from "./booking.schemas";

export const listServices = createServerFn({ method: "GET" }).handler(async () => {
  const { publicClient } = await import("./supabase-public.server");
  const { data, error } = await publicClient()
    .from("services")
    .select("id, category, name, price, duration_min, description")
    .eq("active_status", true)
    .order("category")
    .order("price");
  if (error) throw new Error("Could not load services");
  return data ?? [];
});

export const listStaff = createServerFn({ method: "GET" }).handler(async () => {
  const { publicClient } = await import("./supabase-public.server");
  const { data, error } = await publicClient()
    .from("staff")
    .select("id, name, specialty")
    .eq("active_status", true)
    .order("name");
  if (error) throw new Error("Could not load stylists");
  return data ?? [];
});

export const listApprovedReviews = createServerFn({ method: "GET" }).handler(async () => {
  const { publicClient } = await import("./supabase-public.server");
  const { data } = await publicClient()
    .from("reviews")
    .select("id, customer_name, rating, comment, created_at")
    .eq("approved_status", true)
    .order("created_at", { ascending: false })
    .limit(12);
  return data ?? [];
});

/**
 * Real-time slot availability engine.
 * A slot is open while at least one active stylist is free for it, and the
 * date/slot is not blocked by an availability exception.
 */
export const getAvailability = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => availabilityInputSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ count: staffCount }, exceptionResult, bookingsResult] = await Promise.all([
      supabaseAdmin.from("staff").select("id", { count: "exact", head: true }).eq("active_status", true),
      supabaseAdmin.from("availability_exceptions").select("*").eq("date", data.date).maybeSingle(),
      supabaseAdmin
        .from("appointments")
        .select("time_slot, staff_id")
        .eq("date", data.date)
        .in("status", ["PENDING", "CONFIRMED"]),
    ]);

    const capacity = Math.max(staffCount ?? 1, 1);
    const exception = exceptionResult.data;
    const blocked = new Set<string>(
      exception?.is_full_day_block ? TIME_SLOTS : (exception?.blocked_slots ?? []),
    );

    const taken = new Map<string, number>();
    for (const row of bookingsResult.data ?? []) {
      taken.set(row.time_slot, (taken.get(row.time_slot) ?? 0) + 1);
    }

    const slots = TIME_SLOTS.map((slot) => ({
      slot,
      remaining: Math.max(capacity - (taken.get(slot) ?? 0), 0),
      available: !blocked.has(slot) && (taken.get(slot) ?? 0) < capacity,
    }));

    return {
      date: data.date,
      closed: Boolean(exception?.is_full_day_block),
      reason: exception?.reason ?? null,
      slots,
    };
  });

export const createBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => bookingInputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;
    const { enforceRateLimit } = await import("./rate-limit.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { notifyBooking } = await import("./notifications.server");

    await enforceRateLimit({
      bucket: "booking:create",
      identifier: userId,
      limit: 5,
      windowSeconds: 600,
    });

    if (new Date(`${data.date}T23:59:59`) < new Date()) {
      throw new Error("Please choose an upcoming date.");
    }

    // Price + service names always come from the database, never from the client.
    const { data: services, error: servicesError } = await supabaseAdmin
      .from("services")
      .select("id, name, price")
      .in("id", data.serviceIds)
      .eq("active_status", true);
    if (servicesError || !services || services.length !== data.serviceIds.length) {
      throw new Error("One of the selected services is no longer available.");
    }
    const totalPrice = services.reduce((sum, s) => sum + Number(s.price), 0);

    const { data: exception } = await supabaseAdmin
      .from("availability_exceptions")
      .select("*")
      .eq("date", data.date)
      .maybeSingle();
    if (exception?.is_full_day_block || exception?.blocked_slots?.includes(data.timeSlot)) {
      throw new Error(`That slot is unavailable (${exception.reason}). Please pick another.`);
    }

    // Assign the requested stylist, or the first one free for this slot.
    const { data: staff } = await supabaseAdmin
      .from("staff")
      .select("id, name")
      .eq("active_status", true)
      .order("name");
    const { data: booked } = await supabaseAdmin
      .from("appointments")
      .select("staff_id")
      .eq("date", data.date)
      .eq("time_slot", data.timeSlot)
      .in("status", ["PENDING", "CONFIRMED"]);
    const busy = new Set((booked ?? []).map((b) => b.staff_id));

    const chosen = data.staffId
      ? (staff ?? []).find((s) => s.id === data.staffId && !busy.has(s.id))
      : (staff ?? []).find((s) => !busy.has(s.id));
    if (!chosen) {
      throw new Error("That time slot was just taken. Please choose another slot.");
    }

    const { data: appointment, error } = await supabase
      .from("appointments")
      .insert({
        user_id: userId,
        customer_name: data.name,
        customer_phone: data.phone,
        service_ids: data.serviceIds,
        date: data.date,
        time_slot: data.timeSlot,
        staff_id: chosen.id,
        notes: data.notes || null,
        total_price: totalPrice,
      })
      .select("id, date, time_slot, total_price, status")
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("That time slot was just taken. Please choose another slot.");
      }
      console.error("booking insert failed", error);
      throw new Error("We couldn't save your booking. Please try again.");
    }

    await notifyBooking({
      event: "created",
      customerName: data.name,
      customerPhone: data.phone,
      customerEmail: (claims as { email?: string } | null)?.email ?? null,
      date: data.date,
      timeSlot: data.timeSlot,
      services: services.map((s) => s.name),
      totalPrice,
    });

    return {
      id: appointment.id,
      totalPrice,
      stylist: chosen.name,
      serviceNames: services.map((s) => s.name),
    };
  });

export const listMyAppointments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("appointments")
      .select("id, date, time_slot, status, payment_status, total_price, notes, service_ids, staff_id")
      .eq("user_id", context.userId)
      .order("date", { ascending: false });
    if (error) throw new Error("Could not load your appointments");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: services }, { data: staff }] = await Promise.all([
      supabaseAdmin.from("services").select("id, name"),
      supabaseAdmin.from("staff").select("id, name"),
    ]);
    const serviceName = new Map((services ?? []).map((s) => [s.id, s.name]));
    const staffName = new Map((staff ?? []).map((s) => [s.id, s.name]));

    return (data ?? []).map((a) => ({
      ...a,
      serviceNames: (a.service_ids ?? []).map((id: string) => serviceName.get(id) ?? "Service"),
      stylist: a.staff_id ? (staffName.get(a.staff_id) ?? null) : null,
    }));
  });

export const cancelMyAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => cancelInputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("appointments")
      .update({ status: "CANCELLED" })
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .in("status", ["PENDING", "CONFIRMED"]);
    if (error) throw new Error("Could not cancel that appointment");
    return { ok: true };
  });

export const submitReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => reviewInputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { enforceRateLimit } = await import("./rate-limit.server");
    await enforceRateLimit({
      bucket: "review:create",
      identifier: context.userId,
      limit: 3,
      windowSeconds: 3600,
    });

    const { error } = await context.supabase.from("reviews").insert({
      user_id: context.userId,
      customer_name: data.customerName,
      rating: data.rating,
      comment: data.comment,
    });
    if (error) throw new Error("Could not submit your review");
    return { ok: true, pendingApproval: true };
  });
