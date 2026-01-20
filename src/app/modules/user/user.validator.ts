// user.zod.ts
import { z } from "zod";

export const UserRoleSchema = z.enum(["admin", "editor", "author", "reader"]);
export const UserStatusSchema = z.enum(["active", "disabled"]);

export const UserCreationZodSchema = z.object({
  body: z.object({
    email: z.string().email().trim().toLowerCase(),
    username: z
      .string()
      .trim()
      .min(3)
      .max(30)
      .regex(
        /^[a-zA-Z0-9._-]+$/,
        "username can contain letters, numbers, . _ -",
      ),
    password: z.string().min(8).max(72),
    role: UserRoleSchema.optional(),
    status: UserStatusSchema.optional(),
  }),
});

export const UserValidator = {
  UserCreationZodSchema,
};
