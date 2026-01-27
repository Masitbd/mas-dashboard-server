// post.validate.ts
import { z } from "zod";

/**
 * Common validators
 */
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Invalid slug (use lowercase words with hyphens)",
  );

const nonEmpty = z.string().trim().min(1, "Required");

/**
 * Create Post
 * body: { title, excerpt, content, coverImage, categoryId, tagIds?, authorId?, slug?, readingTime? }
 */
export const PostCreationZodSchema = z.object({
  body: z.object({
    slug: slug.optional(),

    title: nonEmpty,
    excerpt: nonEmpty,
    content: nonEmpty,

    coverImage: nonEmpty,

    category: objectId,
    authorId: objectId.optional(), // optional if you set author from req.user
    tagIds: z.array(objectId).optional().default([]),

    readingTime: z.string().trim().optional(),
  }),
});

/**
 * Update Post
 * params: { id }
 * body: any subset of post fields (must not be empty)
 */
export const PostUpdateZodSchema = z.object({
  params: z.object({
    id: objectId,
  }),
  body: z
    .object({
      slug: slug.optional(),

      title: z.string().trim().min(1).optional(),
      excerpt: z.string().trim().min(1).optional(),
      content: z.string().trim().min(1).optional(),

      coverImage: z.string().trim().min(1).optional(),

      categoryId: objectId.optional(),
      authorId: objectId.optional(),
      tagIds: z.array(objectId).optional(),

      readingTime: z.string().trim().optional(),
    })
    .refine((v) => Object.keys(v).length > 0, {
      message: "Empty update payload",
    }),
});

/**
 * Get Post by id
 * params: { id }
 */
export const PostIdParamZodSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

/**
 * Get Post by slug
 * params: { slug }
 */
export const PostSlugParamZodSchema = z.object({
  params: z.object({
    slug,
  }),
});

/**
 * List Posts
 * query: page, limit, searchTerm, sort, categoryId, authorId, tagId, populate
 */
export const PostQueryZodSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),

    searchTerm: z.string().trim().optional(),
    sort: z.enum(["newest", "oldest", "titleAsc", "titleDesc"]).optional(),

    categoryId: objectId.optional(),
    authorId: objectId.optional(),
    tagId: objectId.optional(),

    // "true" or "author,category,tags"
    populate: z.string().trim().optional(),
  }),
});

/**
 * Add/Remove tags on a post
 * params: { id }
 * body: { tagIds: string[] }
 */
export const PostTagsZodSchema = z.object({
  params: z.object({
    id: objectId,
  }),
  body: z.object({
    tagIds: z.array(objectId).min(1, "tagIds cannot be empty"),
  }),
});
