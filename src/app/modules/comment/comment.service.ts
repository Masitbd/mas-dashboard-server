import mongoose, { Types, type PopulateOptions } from "mongoose";
import { HttpStatusCode } from "axios";
import AppError from "../../errors/APiError";

import { CommentModel } from "./comment.model";
import { Comment, CommentStatus } from "./comment.interface";

import { PostModel } from "../post/post.model";
import { IUser } from "../user/user.interface";
import { UserProfileModel } from "../profile/profile.model";
import { ENUM_USER_PERMISSION } from "../../enums/enumUserPermission";

type ObjectId = Types.ObjectId;

export type CreateCommentInput = {
  postId: string | ObjectId;
  content: string;
  parentCommentId?: string | ObjectId | null;
};

export type UpdateCommentInput = Partial<{
  content: string;
}>;

export type ListCommentsQuery = Partial<{
  page: number;
  limit: number;

  includeReplies: boolean;
  sortOrder: "asc" | "desc";

  // staff-only (public should default to approved)
  status: CommentStatus | "all";
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

function isStaff(user?: IUser | null) {
  const role = user?.role as any;
  return (
    role === ENUM_USER_PERMISSION.ADMIN ||
    role === ENUM_USER_PERMISSION.SUPER_ADMIN ||
    role === ENUM_USER_PERMISSION.EDITOR
  );
}

const DEFAULT_POPULATE: PopulateOptions[] = [
  { path: "author", select: "displayName avatarUrl uuid" },
];

function resolvePopulate(
  populate: ServiceOptions["populate"],
): (string | PopulateOptions)[] {
  if (!populate) return [];
  if (populate === true) return DEFAULT_POPULATE;
  return populate;
}

async function ensureCanMutate(comment: any, user: IUser) {
  if (isStaff(user)) return true;

  // ownership check (same style as your post.service.ts)
  const authorProfile = await UserProfileModel.findById(comment.author);
  if (authorProfile?.uuid && authorProfile.uuid === user?.uuid) return true;

  throw new AppError(HttpStatusCode.Unauthorized, "Not authorized");
}

// -----------------------------
// Services
// -----------------------------
const createComment = async (
  input: CreateCommentInput,
  opts: ServiceOptions = {},
  user: IUser,
) => {
  const postId = toObjectId(input.postId);

  const postExists = await PostModel.exists({ _id: postId });
  if (!postExists) {
    throw new AppError(HttpStatusCode.NotFound, "Post not found");
  }

  const parentId = input.parentCommentId
    ? toObjectId(input.parentCommentId)
    : null;

  if (parentId) {
    const parent = await CommentModel.findById(parentId).select("post").lean();
    if (!parent) {
      throw new AppError(HttpStatusCode.NotFound, "Parent comment not found");
    }
    if (String(parent.post) !== String(postId)) {
      throw new AppError(
        HttpStatusCode.BadRequest,
        "Parent comment does not belong to this post",
      );
    }
  }

  const authorProfileId = await UserProfileModel.findOne({ uuid: user?.uuid });

  const doc: Partial<Comment> = {
    post: postId,
    parent: parentId,
    content: input.content.trim(),
    // NOTE: same pattern as your post create (uses req.user._id)
    author: toObjectId(authorProfileId?._id?.toString() as unknown as string),

    // status: isStaff(user) ? "approved" : "pending",

    status: "approved",
  };

  const created = await CommentModel.create(doc);

  const populate = resolvePopulate(opts.populate);
  if (populate.length) await created.populate(populate);

  return created;
};

const getCommentById = async (
  id: string | ObjectId,
  opts: ServiceOptions = {},
) => {
  const _id = toObjectId(id);

  let q = CommentModel.findById(_id);
  const populate = resolvePopulate(opts.populate ? true : false);
  if (populate.length) q = q.populate(populate);

  if (opts.lean) return q.lean({ virtuals: true });

  const comment = await q.exec();
  if (!comment)
    throw new AppError(HttpStatusCode.NotFound, "Comment not found");
  return comment;
};

const listCommentsByPost = async (
  postId: string | ObjectId,
  query: ListCommentsQuery = {},
  user?: IUser,
) => {
  const _postId = toObjectId(postId);

  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 20));
  const skip = (page - 1) * limit;

  const sortOrder = query.sortOrder ?? "asc";
  const sort = { createdAt: sortOrder === "asc" ? 1 : -1 };

  // Public default: approved only
  let statusFilter: any = "approved";
  if (isStaff(user) && query.status) {
    statusFilter = query.status === "all" ? undefined : query.status;
  }

  const baseFilter: any = { post: _postId };
  if (statusFilter) baseFilter.status = statusFilter;

  // If includeReplies=true => return flat list (parent + replies)
  if (query.includeReplies) {
    const [items, total] = await Promise.all([
      CommentModel.find(baseFilter)
        .sort(sort as any)
        .skip(skip)
        .limit(limit)
        .populate(DEFAULT_POPULATE)
        .lean({ virtuals: true })
        .exec(),
      CommentModel.countDocuments(baseFilter),
    ]);

    return {
      data: items,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  // Otherwise: only top-level comments + repliesCount
  const filterTopLevel = { ...baseFilter, parent: null };

  const items = await CommentModel.find(filterTopLevel)
    .sort(sort as any)
    .skip(skip)
    .limit(limit)
    .populate(DEFAULT_POPULATE)
    .lean({ virtuals: true })
    .exec();

  const total = await CommentModel.countDocuments(filterTopLevel);

  // replies count
  const ids = items.map((c: any) => new mongoose.Types.ObjectId(c._id));
  const counts = await CommentModel.aggregate([
    {
      $match: {
        post: _postId,
        parent: { $in: ids },
        ...(statusFilter ? { status: statusFilter } : {}),
      },
    },
    { $group: { _id: "$parent", count: { $sum: 1 } } },
  ]);

  const countMap = new Map<string, number>(
    counts.map((x: any) => [String(x._id), x.count]),
  );

  const withCounts = items.map((c: any) => ({
    ...c,
    repliesCount: countMap.get(String(c._id)) ?? 0,
  }));

  return {
    data: withCounts,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

const updateCommentById = async (
  id: string | ObjectId,
  patch: UpdateCommentInput,
  user: IUser,
) => {
  const _id = toObjectId(id);

  const existing = await CommentModel.findById(_id);
  if (!existing)
    throw new AppError(HttpStatusCode.NotFound, "Comment not found");

  await ensureCanMutate(existing, user);

  const update: any = {};
  if (patch.content !== undefined) update.content = patch.content.trim();
  update.editedAt = new Date();

  const updated = await CommentModel.findByIdAndUpdate(_id, update, {
    new: true,
    runValidators: true,
  })
    .populate(DEFAULT_POPULATE)
    .exec();

  return updated;
};

const deleteCommentById = async (id: string | ObjectId, user: IUser) => {
  const _id = toObjectId(id);

  const existing = await CommentModel.findById(_id);
  if (!existing)
    throw new AppError(HttpStatusCode.NotFound, "Comment not found");

  await ensureCanMutate(existing, user);

  // Soft delete
  await CommentModel.findByIdAndUpdate(_id, {
    status: "deleted",
    content: "[deleted]",
    editedAt: new Date(),
  });

  return "Comment deleted successfully";
};

const moderateComment = async (
  id: string | ObjectId,
  payload: { status: CommentStatus },
  user: IUser,
) => {
  if (!isStaff(user)) {
    throw new AppError(HttpStatusCode.Unauthorized, "Not authorized");
  }

  const _id = toObjectId(id);

  const existing = await CommentModel.findById(_id);
  if (!existing)
    throw new AppError(HttpStatusCode.NotFound, "Comment not found");

  await CommentModel.findByIdAndUpdate(_id, { status: payload.status });

  return "Comment status updated successfully";
};

export const CommentService = {
  createComment,
  getCommentById,
  listCommentsByPost,
  updateCommentById,
  deleteCommentById,
  moderateComment,
};
