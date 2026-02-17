import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

export const ContactCreationZodSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(120),
    subject: z.string().trim().min(2).max(200),
    message: z.string().trim().min(2).max(5000),
  }),
});

export const ContactIdParamZodSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

export const ContactQueryZodSchema = z.object({
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

    searchTerm: z.string().trim().min(1).max(200).optional(),
    name: z.string().trim().min(1).max(120).optional(),
    email: z.string().trim().email().max(120).optional(),
    subject: z.string().trim().min(1).max(200).optional(),
    sort: z.enum(["newest", "oldest", "nameAsc", "nameDesc"]).optional(),
  }),
});

export const ContactValidator = {
  ContactCreationZodSchema,
  ContactIdParamZodSchema,
  ContactQueryZodSchema,
};
