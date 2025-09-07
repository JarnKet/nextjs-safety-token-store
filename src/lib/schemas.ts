// File: lib/schemas.ts
import { z } from "zod";

export const loginSchema = z.object({
    username: z.string().min(1, "Username is required").trim(),
    password: z.string().min(1, "Password is required"),
});

export const profileSchema = z.object({
    firstName: z
        .string()
        .min(1, "First name is required")
        .max(50, "First name must be less than 50 characters")
        .trim(),
    lastName: z
        .string()
        .min(1, "Last name is required")
        .max(50, "Last name must be less than 50 characters")
        .trim(),
    email: z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email address")
        .toLowerCase()
        .trim(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
