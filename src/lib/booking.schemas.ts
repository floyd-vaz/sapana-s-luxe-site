import { z } from "zod";

export const TIME_SLOTS = [
  "9:30 AM",
  "10:30 AM",
  "11:30 AM",
  "12:30 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
] as const;

export const phoneSchema = z
  .string()
  .trim()
  .min(8, "Enter a valid phone number")
  .max(20, "Phone number is too long")
  .regex(/^[+0-9 ()-]+$/, "Phone number contains invalid characters");

export const bookingInputSchema = z.object({
  serviceIds: z.array(z.string().uuid()).min(1, "Pick at least one service").max(6),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date"),
  timeSlot: z.enum(TIME_SLOTS),
  staffId: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(2, "Enter your name").max(80),
  phone: phoneSchema,
  notes: z.string().trim().max(500).optional().default(""),
});
export type BookingInput = z.infer<typeof bookingInputSchema>;

export const availabilityInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const reviewInputSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(4).max(600),
  customerName: z.string().trim().min(2).max(80),
});

export const cancelInputSchema = z.object({ id: z.string().uuid() });

export const appointmentStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;
export const paymentStatuses = ["UNPAID", "DEPOSIT_PAID", "PAID", "REFUNDED"] as const;

export const adminUpdateAppointmentSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(appointmentStatuses).optional(),
  paymentStatus: z.enum(paymentStatuses).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  timeSlot: z.enum(TIME_SLOTS).optional(),
});

export const adminServiceSchema = z.object({
  id: z.string().uuid().optional(),
  category: z.string().trim().min(2).max(60),
  name: z.string().trim().min(2).max(80),
  price: z.number().min(0).max(1_000_000),
  durationMin: z.number().int().min(5).max(600),
  description: z.string().trim().max(400).optional().default(""),
  activeStatus: z.boolean().default(true),
});

export const adminReviewSchema = z.object({
  id: z.string().uuid(),
  approvedStatus: z.boolean(),
});

export const adminExceptionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().trim().min(2).max(120),
  isFullDayBlock: z.boolean(),
  blockedSlots: z.array(z.enum(TIME_SLOTS)).default([]),
});
