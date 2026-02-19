import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

export const NewsletterSubscriberCreationZodSchema = z.object({
  body: z.object({
    email: z.string().trim().email().max(120),
    subscribed: z.boolean(),
  }),
});

export const NewsletterSubscriberIdParamZodSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

export const NewsletterSubscriberQueryZodSchema = z.object({
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

    searchTerm: z.string().trim().min(1).max(120).optional(),
    email: z.string().trim().email().max(120).optional(),
    subscribed: z.enum(["true", "false"]).optional(),
    sort: z.enum(["newest", "oldest", "emailAsc", "emailDesc"]).optional(),
  }),
});

export const NewsletterSubscriberValidator = {
  NewsletterSubscriberCreationZodSchema,
  NewsletterSubscriberIdParamZodSchema,
  NewsletterSubscriberQueryZodSchema,
};
