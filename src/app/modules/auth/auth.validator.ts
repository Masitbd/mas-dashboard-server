import { z } from "zod";

export const LoginSchema = z.object({
  body: z.object({
    email: z.string().email().trim().toLowerCase(),
    password: z.string().min(8).max(72),
  }),
});
