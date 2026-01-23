// category.validator.ts
import { z } from "zod";

export const CategoryCreationZodSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    description: z.string().trim().min(2).max(500),
  }),
});

export const CategoryUpdateZodSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z
    .object({
      name: z.string().trim().min(2).max(80).optional(),
      description: z.string().trim().min(2).max(500).optional(),
    })
    .strict()
    .refine((obj) => Object.keys(obj).length > 0, {
      message: "At least one field is required to update",
    }),
});

export const CategoryIdParamZodSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const CategoryQueryZodSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((v) => (v ? Number(v) : undefined))
      .refine((v) => v === undefined || (Number.isFinite(v) && v >= 1), {
        message: "page must be a number >= 1",
      }),

    limit: z
      .string()
      .optional()
      .transform((v) => (v ? Number(v) : undefined))
      .refine(
        (v) => v === undefined || (Number.isFinite(v) && v >= 1 && v <= 100),
        { message: "limit must be a number between 1 and 100" },
      ),

    q: z.string().trim().min(1).max(80).optional(),

    sort: z.enum(["newest", "oldest", "nameAsc", "nameDesc"]).optional(),
  }),
});

export const CategoryValidator = {
  CategoryCreationZodSchema,
  CategoryUpdateZodSchema,
  CategoryIdParamZodSchema,
  CategoryQueryZodSchema,
};
