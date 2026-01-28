// services/post.service.ts
import mongoose, { Types, type PopulateOptions } from "mongoose";
import { PostModel } from "./post.model";
import { Post, Post as PostDb } from "./post.interface";
import { IUser } from "../user/user.interface";
import { UserModel } from "../user/user.model";
import AppError from "../../errors/APiError";
import { HttpStatusCode } from "axios";
import { ENUM_POST_STATUS } from "../../enums/EnumPostStatus";
import { ENUM_USER_PERMISSION } from "../../enums/enumUserPermission";
import { ENUM_USER_STATUS } from "../../enums/userStatus.enum";
import { UserProfileModel } from "../profile/profile.model";
// -----------------------------
// Types
// -----------------------------
type ObjectId = Types.ObjectId;

export type CreatePostInput = {
  slug?: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;

  category: string | ObjectId;
  tagIds?: Array<string | ObjectId>;
  authorId: string | ObjectId;

  // optional: if omitted we can auto-calc
  readingTime?: string;
};

export type UpdatePostInput = Partial<{
  slug: string; // usually avoid changing; keep for admin workflows
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;

  categoryId: string | ObjectId;
  tagIds: Array<string | ObjectId>;
  authorId: string | ObjectId;

  readingTime: string;
}>;

export type ListPostsQuery = Partial<{
  placement: string;

  page: number;
  limit: number;

  categoryId: string | ObjectId;
  authorId: string | ObjectId;
  tagId: string | ObjectId;

  search: string; // uses text index
  sortBy: "createdAt" | "updatedAt" | "title";
  sortOrder: "asc" | "desc";

  populate: boolean | (string | PopulateOptions)[];
}>;

export type ServiceOptions = Partial<{
  populate: boolean | (string | PopulateOptions)[];
  lean: boolean;
}>;

// -----------------------------
// Helpers
// -----------------------------
function toObjectId(id: string | ObjectId): ObjectId {
  if (id instanceof Types.ObjectId) return id;
  if (!Types.ObjectId.isValid(id)) throw new Error(`Invalid ObjectId: ${id}`);
  return new Types.ObjectId(id);
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function ensureUniqueSlug(
  base: string,
  excludeId?: ObjectId,
): Promise<string> {
  let slug = base;
  let n = 2;

  // Loop until slug is unique
  // Note: keep it simple and predictable
  while (true) {
    const query: any = { slug };
    if (excludeId) query._id = { $ne: excludeId };

    const exists = await PostModel.exists(query);
    if (!exists) return slug;

    slug = `${base}-${n}`;
    n += 1;
  }
}

function computeReadingTime(content: string): string {
  // traditional baseline: ~200 words per minute
  const words = content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean).length;

  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

const DEFAULT_POPULATE: PopulateOptions[] = [
  { path: "category", select: "name" },
  { path: "author", select: "name email avatarUrl uuid" },
  { path: "tags", select: "name" },
];

function resolvePopulate(
  populate: ServiceOptions["populate"],
): (string | PopulateOptions)[] {
  if (!populate) return [];
  if (populate == true) return DEFAULT_POPULATE;
  return populate;
}

// -----------------------------
// Core Services (CRUD + list)
// -----------------------------
export async function createPost(
  input: CreatePostInput,
  opts: ServiceOptions = {},
  user: IUser,
) {
  const baseSlug = slugify(input.slug?.trim() || input.title);
  const uniqueSlug = await ensureUniqueSlug(baseSlug);

  const doc: PostDb = {
    slug: uniqueSlug,
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    content: input.content,
    coverImage: input.coverImage.trim(),

    category: toObjectId(input.category),
    tags: (input.tagIds ?? []).map(toObjectId),
    author: toObjectId(user._id),

    readingTime: input.readingTime?.trim() || computeReadingTime(input.content),
    status: "draft",
  } as Post;

  const created = await PostModel.create(doc);

  const populate = resolvePopulate(opts.populate);
  if (populate.length) await created.populate(populate);

  return created;
}

export async function getPostById(
  id: string | ObjectId,
  opts: ServiceOptions = {},
) {
  const _id = toObjectId(id);

  let q = PostModel.findById(_id);
  const populate = resolvePopulate(opts.populate ? true : false);
  if (populate.length) q = q.populate(populate);

  if (opts.lean) return q.lean({ virtuals: true });

  const post = await q.exec();
  if (!post) throw new Error("Post not found");
  return post;
}

export async function getPostBySlug(slug: string, opts: ServiceOptions = {}) {
  let q = PostModel.findOne({ slug: slug.toLowerCase().trim() });
  const populate = resolvePopulate(opts.populate ? true : false);
  if (populate.length) q = q.populate(populate);

  if (opts.lean) return q.lean({ virtuals: true });

  const post = await q.exec();
  if (!post) throw new Error("Post not found");
  return post;
}

export async function listPosts(query: ListPostsQuery = {}) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 10));
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy ?? "createdAt";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;

  const filter: any = {};

  if (query.categoryId) filter.category = toObjectId(query.categoryId);
  if (query.authorId) filter.author = toObjectId(query.authorId);
  if (query.tagId) filter.tags = toObjectId(query.tagId);
  if (query.placement) filter.placement = (query?.placement).toString();

  // text search (requires text index you added earlier)
  if (query.search?.trim()) {
    filter.$text = { $search: query.search.trim() };
  }

  let findQ = PostModel.find(filter)
    .sort(
      query.search?.trim()
        ? { score: { $meta: "textScore" }, [sortBy]: sortOrder }
        : { [sortBy]: sortOrder },
    )
    .skip(skip)
    .limit(limit);

  const populate = resolvePopulate(query.populate ? true : false);
  if (populate.length) findQ = findQ.populate(populate);

  const [items, total] = await Promise.all([
    findQ.lean({ virtuals: true }).exec(),
    PostModel.countDocuments(filter),
  ]);

  return {
    data: items,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function updatePostById(
  id: string | ObjectId,
  patch: UpdatePostInput,
  opts: ServiceOptions = {},
) {
  const _id = toObjectId(id);

  const update: any = {};
  if (patch.title !== undefined) update.title = patch.title.trim();
  if (patch.excerpt !== undefined) update.excerpt = patch.excerpt.trim();
  if (patch.content !== undefined) update.content = patch.content;
  if (patch.coverImage !== undefined)
    update.coverImage = patch.coverImage.trim();

  if (patch.categoryId !== undefined)
    update.category = toObjectId(patch.categoryId);
  if (patch.authorId !== undefined) update.author = toObjectId(patch.authorId);
  if (patch.tagIds !== undefined) update.tags = patch.tagIds.map(toObjectId);

  // slug change is a controlled/admin action
  if (patch.slug !== undefined) {
    const baseSlug = slugify(patch.slug);
    update.slug = await ensureUniqueSlug(baseSlug, _id);
  } else if (patch.title !== undefined) {
    // optional: auto-update slug from title? (traditional approach is: DON'T)
    // keep disabled by default; if you want, uncomment:
    // update.slug = await ensureUniqueSlug(slugify(patch.title), _id);
  }

  if (patch.readingTime !== undefined) {
    update.readingTime = patch.readingTime.trim();
  } else if (patch.content !== undefined) {
    update.readingTime = computeReadingTime(patch.content);
  }

  let q = PostModel.findByIdAndUpdate(_id, update, {
    new: true,
    runValidators: true,
  });
  const populate = resolvePopulate(opts.populate);
  if (populate.length) q = q.populate(populate);

  if (opts.lean) return q.lean({ virtuals: true });

  const updated = await q.exec();
  if (!updated) throw new Error("Post not found");
  return updated;
}

export async function deletePostById(id: string | ObjectId) {
  const _id = toObjectId(id);
  const deleted = await PostModel.findByIdAndDelete(_id).exec();
  if (!deleted) throw new Error("Post not found");
  return { deleted: true };
}

// -----------------------------
// Tag convenience operations
// -----------------------------
export async function addTagsToPost(
  postId: string | ObjectId,
  tagIds: Array<string | ObjectId>,
) {
  const _id = toObjectId(postId);
  const tags = tagIds.map(toObjectId);

  const updated = await PostModel.findByIdAndUpdate(
    _id,
    { $addToSet: { tags: { $each: tags } } },
    { new: true },
  ).exec();

  if (!updated) throw new Error("Post not found");
  return updated;
}

export async function removeTagsFromPost(
  postId: string | ObjectId,
  tagIds: Array<string | ObjectId>,
) {
  const _id = toObjectId(postId);
  const tags = tagIds.map(toObjectId);

  const updated = await PostModel.findByIdAndUpdate(
    _id,
    { $pull: { tags: { $in: tags } } },
    { new: true },
  ).exec();

  if (!updated) throw new Error("Post not found");
  return updated;
}

const changeStatus = async (
  user: IUser,
  id: string,
  payload: { status: ENUM_POST_STATUS },
) => {
  const doesExists = await PostModel.findById(id);
  if (!doesExists) {
    throw new AppError(HttpStatusCode.NotFound, "Post Now found");
  }
  if (payload.status == ENUM_POST_STATUS.PUBLISHED) {
    if (user?.role == ENUM_USER_PERMISSION.ADMIN) {
      await PostModel.findByIdAndUpdate(id, {
        status: ENUM_POST_STATUS.PUBLISHED,
      });
      return "Post Status Updated Successfully";
    } else {
      throw new AppError(
        HttpStatusCode.Unauthorized,
        "You are not authorized to change the post status",
      );
    }
  }
  if (user?.role !== ENUM_USER_PERMISSION.ADMIN) {
    const userProfile = await UserProfileModel.findById(doesExists.author);
    if (userProfile?.uuid == user?.uuid) {
      await PostModel.findByIdAndUpdate(id, {
        status: payload.status,
      });
      return "Post Status Updated Successfully";
    } else {
      throw new AppError(
        HttpStatusCode.Unauthorized,
        "You are not authorized to change the post status",
      );
    }
  } else {
    await PostModel.findByIdAndUpdate(id, {
      status: payload.status,
    });
    return "Post Status Updated Successfully";
  }
};

const changePlaceMent = async (id: string, payload: { placement: string }) => {
  const doesExists = await PostModel.findById(id);
  if (!doesExists) {
    throw new AppError(HttpStatusCode.NotFound, "Post Not found");
  }
  await PostModel.findByIdAndUpdate(id, { placement: payload.placement });

  return "Placement Updated Successfully";
};

export const PostService = {
  createPost,
  getPostById,
  getPostBySlug,
  listPosts,
  updatePostById,
  deletePostById,
  addTagsToPost,
  removeTagsFromPost,
  changeStatus,
  changePlaceMent,
};
