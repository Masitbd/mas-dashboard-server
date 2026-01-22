// userProfile.zod.ts
import { z } from "zod";

const NullableUrl = z
  .string()
  .trim()
  .url()
  .nullable()
  .or(z.literal("").transform(() => null)); // allow empty string from forms

const NullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .or(z.literal("").transform(() => null));

export const UserProfileCreationZodSchema = z.object({
  body: z.object({
    uuid: z.string().trim().min(8).max(64),
    displayName: z.string().trim().min(1).max(80),

    avatarUrl: NullableUrl.optional(),
    bio: NullableText(500).optional(),

    websiteUrl: NullableUrl.optional(),
    location: NullableText(120).optional(),

    twitterUrl: NullableUrl.optional(),
    githubUrl: NullableUrl.optional(),
    linkedinUrl: NullableUrl.optional(),
  }),
});

export const UserProfileUpdateZodSchema = z.object({
  body: z
    .object({
      // uuid must remain stable — do not allow updating it
      displayName: z.string().trim().min(1).max(80).optional(),

      avatarUrl: NullableUrl.optional(),
      bio: NullableText(500).optional(),

      websiteUrl: NullableUrl.optional(),
      location: NullableText(120).optional(),

      twitterUrl: NullableUrl.optional(),
      githubUrl: NullableUrl.optional(),
      linkedinUrl: NullableUrl.optional(),
    })
    .strict()
    .refine((obj) => Object.keys(obj).length > 0, {
      message: "At least one field is required to update",
    }),
});

export const UserProfileUuidParamZodSchema = z.object({
  params: z.object({
    uuid: z.string().trim().min(8).max(64),
  }),
});

export const UserProfileQueryZodSchema = z.object({
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
    location: z.string().trim().min(1).max(120).optional(),

    hasAvatar: z
      .string()
      .optional()
      .transform((v) => (v === undefined ? undefined : v === "true"))
      .refine((v) => v === undefined || typeof v === "boolean", {
        message: "hasAvatar must be true/false",
      }),

    sort: z.enum(["newest", "oldest", "nameAsc", "nameDesc"]).optional(),
  }),
});

export const UserProfileValidator = {
  UserProfileCreationZodSchema,
  UserProfileUpdateZodSchema,
  UserProfileUuidParamZodSchema,
  UserProfileQueryZodSchema,
};
