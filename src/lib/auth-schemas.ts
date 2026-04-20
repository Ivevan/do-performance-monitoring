import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Enter a valid email address" })
    .max(255, { message: "Email must be under 255 characters" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .max(128, { message: "Password is too long" }),
});

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, { message: "Full name must be at least 2 characters" })
      .max(100, { message: "Full name must be under 100 characters" }),
    email: z
      .string()
      .trim()
      .min(1, { message: "Email is required" })
      .email({ message: "Enter a valid email address" })
      .max(255, { message: "Email must be under 255 characters" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(128, { message: "Password is too long" })
      .regex(/[A-Z]/, { message: "Include at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Include at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Include at least one number" }),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Too weak" | "Weak" | "Fair" | "Good" | "Strong";
  colorClass: string;
};

export function scorePassword(pw: string): PasswordStrength {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) score++;
  const s = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;
  const map: Record<number, PasswordStrength> = {
    0: { score: 0, label: "Too weak", colorClass: "bg-destructive" },
    1: { score: 1, label: "Weak", colorClass: "bg-dost-red" },
    2: { score: 2, label: "Fair", colorClass: "bg-dost-yellow" },
    3: { score: 3, label: "Good", colorClass: "bg-dost-blue" },
    4: { score: 4, label: "Strong", colorClass: "bg-emerald-500" },
  };
  return map[s];
}
