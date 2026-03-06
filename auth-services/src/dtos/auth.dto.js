import { z } from 'zod';

// Used on POST /register
export const registerDTO = z.object({
  email: z.email({ message: "Must be a valid email address" }),
  // z.string()  → rejects numbers, arrays, objects
  // .email()    → rejects "abc", "abc@", "abc.com" — must have proper format

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(100, { message: "Password too long" }),
  // .max(100) prevents someone sending a 10MB string to crash bcrypt

  confirmPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(100, { message: "Password too long" }),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
  }
});

// Used on POST /login
export const loginDTO = z.object({
  email: z.email({ message: "Must be a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  // min(1) just means "not empty" — we check the actual password in the service
});

// Used on POST /refresh
export const refreshTokenDTO = z.object({
  refreshToken: z.string().min(1, { message: "Refresh token is required" }),
});

// Used on POST /forgot-password
export const forgotPasswordDTO = z.object({
  email: z.email({ message: "Must be a valid email address" }),
});

// Used on POST /reset-password
// token comes from query string (?token=...), only password is in the body
export const resetPasswordDTO = z.object({
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(100, { message: "Password too long" }),
});
