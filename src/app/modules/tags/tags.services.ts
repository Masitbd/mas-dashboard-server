// category.service.ts
import { HttpStatusCode } from "axios";
import AppError from "../../errors/APiError";
import { ITag } from "./tags.interface";
import { TagModel } from "./tag.model";

type FindAllTagsParams = {
  page?: number; // 1-based
  limit?: number; // max 100
  q?: string; // search: name/description
  sort?: "newest" | "oldest" | "nameAsc" | "nameDesc";
};

const createTag = async (tagData: Partial<ITag>): Promise<ITag> => {
  if (!tagData.name?.trim()) {
    throw new AppError(HttpStatusCode.BadRequest, "name is required");
  }
  if (!tagData.description?.trim()) {
    throw new AppError(HttpStatusCode.BadRequest, "description is required");
  }

  const existing = await TagModel.findOne({
    name: tagData.name.trim(),
  });

  if (existing) {
    throw new AppError(HttpStatusCode.Conflict, "Tag already exists");
  }

  const created = await TagModel.create({
    name: tagData.name.trim(),
    description: tagData.description.trim(),
  });

  return created.toObject() as ITag;
};

const findTagById = async (id: string): Promise<ITag> => {
  const tag = await TagModel.findById(id).lean();

  if (!tag) {
    throw new AppError(HttpStatusCode.NotFound, "Tag not found");
  }

  return tag as unknown as ITag;
};

const findAllTags = async (params: FindAllTagsParams = {}) => {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = {};

  const q = params.q?.trim();
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: rx }, { description: rx }];
  }

  const sortMap: Record<NonNullable<FindAllTagsParams["sort"]>, any> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    nameAsc: { name: 1 },
    nameDesc: { name: -1 },
  };

  const sort = params.sort ? sortMap[params.sort] : sortMap.newest;

  const [items, total] = await Promise.all([
    TagModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    TagModel.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
    data: items as unknown as ITag[],
  };
};

const updateTagById = async (
  id: string,
  payload: Partial<ITag>,
): Promise<ITag> => {
  const update: Partial<ITag> = {};

  if (payload.name !== undefined) update.name = payload.name.trim();
  if (payload.description !== undefined)
    update.description = payload.description.trim();

  // If name is changing, enforce uniqueness
  if (update.name) {
    const existing = await TagModel.findOne({
      name: update.name,
      _id: { $ne: id },
    });
    if (existing) {
      throw new AppError(HttpStatusCode.Conflict, "Tag name already exists");
    }
  }

  const updated = await TagModel.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true, runValidators: true },
  ).lean();

  if (!updated) {
    throw new AppError(HttpStatusCode.NotFound, "Tag not found");
  }

  return updated as unknown as ITag;
};

const deleteTagById = async (id: string): Promise<ITag> => {
  const deleted = await TagModel.findByIdAndDelete(id).lean();

  if (!deleted) {
    throw new AppError(HttpStatusCode.NotFound, "Tag not found");
  }

  return deleted as unknown as ITag;
};

export const TagService = {
  createTag,
  findTagById,
  findAllTags,
  updateTagById,
  deleteTagById,
};
