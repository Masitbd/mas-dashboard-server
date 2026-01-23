// category.service.ts
import { HttpStatusCode } from "axios";
import AppError from "../../errors/APiError";
import { ICategory } from "./category.interface";
import { CategoryModel } from "./category.model";

type FindAllCategoriesParams = {
  page?: number; // 1-based
  limit?: number; // max 100
  q?: string; // search: name/description
  sort?: "newest" | "oldest" | "nameAsc" | "nameDesc";
};

const createCategory = async (
  categoryData: Partial<ICategory>,
): Promise<ICategory> => {
  if (!categoryData.name?.trim()) {
    throw new AppError(HttpStatusCode.BadRequest, "name is required");
  }
  if (!categoryData.description?.trim()) {
    throw new AppError(HttpStatusCode.BadRequest, "description is required");
  }

  const existing = await CategoryModel.findOne({
    name: categoryData.name.trim(),
  });

  if (existing) {
    throw new AppError(HttpStatusCode.Conflict, "Category already exists");
  }

  const created = await CategoryModel.create({
    name: categoryData.name.trim(),
    description: categoryData.description.trim(),
  });

  return created.toObject() as ICategory;
};

const findCategoryById = async (id: string): Promise<ICategory> => {
  const category = await CategoryModel.findById(id).lean();

  if (!category) {
    throw new AppError(HttpStatusCode.NotFound, "Category not found");
  }

  return category as unknown as ICategory;
};

const findAllCategories = async (params: FindAllCategoriesParams = {}) => {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = {};

  const q = params.q?.trim();
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: rx }, { description: rx }];
  }

  const sortMap: Record<NonNullable<FindAllCategoriesParams["sort"]>, any> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    nameAsc: { name: 1 },
    nameDesc: { name: -1 },
  };

  const sort = params.sort ? sortMap[params.sort] : sortMap.newest;

  const [items, total] = await Promise.all([
    CategoryModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    CategoryModel.countDocuments(filter),
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
    data: items as unknown as ICategory[],
  };
};

const updateCategoryById = async (
  id: string,
  payload: Partial<ICategory>,
): Promise<ICategory> => {
  const update: Partial<ICategory> = {};

  if (payload.name !== undefined) update.name = payload.name.trim();
  if (payload.description !== undefined)
    update.description = payload.description.trim();

  // If name is changing, enforce uniqueness
  if (update.name) {
    const existing = await CategoryModel.findOne({
      name: update.name,
      _id: { $ne: id },
    });
    if (existing) {
      throw new AppError(
        HttpStatusCode.Conflict,
        "Category name already exists",
      );
    }
  }

  const updated = await CategoryModel.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true, runValidators: true },
  ).lean();

  if (!updated) {
    throw new AppError(HttpStatusCode.NotFound, "Category not found");
  }

  return updated as unknown as ICategory;
};

const deleteCategoryById = async (id: string): Promise<ICategory> => {
  const deleted = await CategoryModel.findByIdAndDelete(id).lean();

  if (!deleted) {
    throw new AppError(HttpStatusCode.NotFound, "Category not found");
  }

  return deleted as unknown as ICategory;
};

export const CategoryService = {
  createCategory,
  findCategoryById,
  findAllCategories,
  updateCategoryById,
  deleteCategoryById,
};
