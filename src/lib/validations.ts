import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  role: z.enum(["CUSTOMER", "ORGANIZER"]),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const workshopSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  danceStyle: z.string().min(2, "Dance style is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  artistName: z.string().min(2, "Artist name is required"),
  imageUrl: z.string().optional(),
  dateTime: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  city: z.string().min(2, "City is required"),
  venue: z.string().min(3, "Venue is required"),
  price: z.number().min(0, "Price must be non-negative"),
  maxSeats: z.number().int().min(1, "Must have at least 1 seat"),
});

// Only editable fields for update — dateTime, city, venue, artistName are locked
export const workshopUpdateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  danceStyle: z.string().min(2, "Dance style is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  imageUrl: z.string().optional(),
  price: z.number().min(0, "Price must be non-negative"),
  maxSeats: z.number().int().min(1, "Must have at least 1 seat"),
});

const guestSchema = z.object({
  name: z.string().min(2, "Guest name is required"),
  phone: z.string().min(10, "Guest phone is required"),
});

export const bookingSchema = z.object({
  workshopId: z.string().min(1, "Workshop ID is required"),
  seatsBooked: z.number().int().min(1).max(10, "Max 10 seats per booking"),
  guests: z.array(guestSchema).min(1, "At least one guest is required"),
  upiId: z.string().min(3, "UPI ID is required"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type WorkshopInput = z.infer<typeof workshopSchema>;
export type WorkshopUpdateInput = z.infer<typeof workshopUpdateSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
