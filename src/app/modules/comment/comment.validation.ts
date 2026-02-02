import { z } from "zod";

/**
 * Common validators
 */
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");
const nonEmpty = z.string().trim().min(1, "Required");

export const CommentCreationZodSchema = z.object({
  body: z.object({
    postId: objectId,
    content: nonEmpty.max(5000, "Comment is too long"),
    parentCommentId: objectId.optional().nullable(),
  }),
});

export const CommentIdParamZodSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

export const CommentUpdateZodSchema = z.object({
  params: z.object({
    id: objectId,
  }),
  body: z
    .object({
      content: nonEmpty.max(5000).optional(),
    })
    .refine((v) => Object.keys(v).length > 0, {
      message: "Empty update payload",
    }),
});

export const CommentModerateZodSchema = z.object({
  params: z.object({
    id: objectId,
  }),
  body: z.object({
    status: z.enum(["pending", "approved", "rejected", "spam", "deleted"]),
  }),
});

export const CommentListByPostZodSchema = z.object({
  params: z.object({
    postId: objectId,
  }),
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),

    // if true => returns flat list (including replies). otherwise returns top-level only.
    includeReplies: z.union([z.literal("true"), z.literal("false")]).optional(),

    sortOrder: z.enum(["asc", "desc"]).optional(),

    // public routes should usually ignore this unless staff/admin
    status: z
      .enum(["pending", "approved", "rejected", "spam", "deleted", "all"])
      .optional(),
  }),
});
