// modules/userProfile/userProfile.service.ts
import { HttpStatusCode } from "axios";
import AppError from "../../errors/APiError";
import { IUserProfile, UserProfileModel } from "./profile.model";

/**
 * CREATE
 */
const createProfile = async (
  profileData: Partial<IUserProfile>,
): Promise<IUserProfile> => {
  if (!profileData.uuid) {
    throw new AppError(HttpStatusCode.BadRequest, "uuid is required");
  }
  if (!profileData.displayName) {
    throw new AppError(HttpStatusCode.BadRequest, "displayName is required");
  }

  const existing = await UserProfileModel.findOne({ uuid: profileData.uuid });
  if (existing) {
    throw new AppError(
      HttpStatusCode.Conflict,
      "Profile with this uuid already exists",
    );
  }

  const created = await UserProfileModel.create({ ...profileData });
  return created.toObject() as IUserProfile;
};

/**
 * FIND ONE (by uuid)
 */
const findOneByUuid = async (uuid: string): Promise<IUserProfile> => {
  const profile = await UserProfileModel.findOne({ uuid }).lean();
  if (!profile) {
    throw new AppError(HttpStatusCode.NotFound, "Profile not found");
  }
  return profile as unknown as IUserProfile;
};

/**
 * UPDATE (by uuid)
 */
const updateByUuid = async (
  uuid: string,
  payload: Partial<IUserProfile>,
): Promise<IUserProfile> => {
  if ((payload as any).uuid) {
    throw new AppError(HttpStatusCode.BadRequest, "uuid cannot be updated");
  }

  const allowedFields: (keyof IUserProfile)[] = [
    "displayName",
    "avatarUrl",
    "bio",
    "websiteUrl",
    "location",
    "twitterUrl",
    "githubUrl",
    "linkedinUrl",
  ];

  const update: Partial<IUserProfile> = {};
  for (const key of allowedFields) {
    if (key in payload) (update as any)[key] = (payload as any)[key];
  }

  const updated = await UserProfileModel.findOneAndUpdate(
    { uuid },
    { $set: update },
    { new: true, runValidators: true },
  ).lean();

  if (!updated) {
    throw new AppError(HttpStatusCode.NotFound, "Profile not found");
  }

  return updated as unknown as IUserProfile;
};

/**
 * DELETE (by uuid)
 */
const deleteByUuid = async (uuid: string): Promise<IUserProfile> => {
  const deleted = await UserProfileModel.findOneAndDelete({ uuid }).lean();
  if (!deleted) {
    throw new AppError(HttpStatusCode.NotFound, "Profile not found");
  }
  return deleted as unknown as IUserProfile;
};

/**
 * FIND ALL (with pagination + search + filters + sorting)
 *
 * - Search: q matches displayName, bio, location (case-insensitive)
 * - Filters: location (exact), hasAvatar (true/false)
 * - Sorting: newest/oldest/nameAsc/nameDesc
 */
type FindAllProfilesParams = {
  page?: number; // 1-based
  limit?: number; // max 100
  searchTerm?: string; // search term
  field?: string; // exact match filter
  hasAvatar?: boolean; // true => avatarUrl != null, false => avatarUrl == null
  sort?: "newest" | "oldest" | "nameAsc" | "nameDesc";
};

const findAll = async (params: FindAllProfilesParams = {}) => {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = {};

  // Search (q)
  const q = params.searchTerm?.trim();
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [
      { displayName: rx },
      { bio: rx },
      { location: rx },
      // optional: search by uuid too
      { uuid: rx },
    ];
  }

  // Optional filters
  if (params.field?.trim()) {
    filter.location = params.field.trim();
  }

  if (typeof params.hasAvatar === "boolean") {
    filter.avatarUrl = params.hasAvatar ? { $ne: null } : { $eq: null };
  }

  // Sorting
  const sortMap: Record<NonNullable<FindAllProfilesParams["sort"]>, any> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    nameAsc: { displayName: 1 },
    nameDesc: { displayName: -1 },
  };
  const sort = params.sort ? sortMap[params.sort] : sortMap.newest;

  const [items, total] = await Promise.all([
    UserProfileModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    UserProfileModel.countDocuments(filter),
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
    data: items as unknown as IUserProfile[],
  };
};

// Get My Profile
const getOwnProfile = async (uuid: string) => {
  const profile = await UserProfileModel.findOne({ uuid }).lean();
  if (!profile) {
    throw new AppError(HttpStatusCode.NotFound, "Profile not found");
  }
  return profile as unknown as IUserProfile;
};

// Update own profile
const updateOwnProfile = async (
  uuid: string,
  payload: Partial<IUserProfile>,
): Promise<IUserProfile> => {
  if ((payload as any).uuid) {
    throw new AppError(HttpStatusCode.BadRequest, "uuid cannot be updated");
  }

  const allowedFields: (keyof IUserProfile)[] = [
    "displayName",
    "avatarUrl",
    "bio",
    "websiteUrl",
    "location",
    "twitterUrl",
    "githubUrl",
    "linkedinUrl",
  ];

  const update: Partial<IUserProfile> = {};
  for (const key of allowedFields) {
    if (key in payload) (update as any)[key] = (payload as any)[key];
  }

  const updated = await UserProfileModel.findOneAndUpdate(
    { uuid },
    { $set: update },
    { new: true, runValidators: true, upsert: true },
  ).lean();

  if (!updated) {
    throw new AppError(HttpStatusCode.NotFound, "Profile not found");
  }

  return updated as unknown as IUserProfile;
};

export const UserProfileService = {
  createProfile,
  findOneByUuid,
  updateByUuid,
  deleteByUuid,
  findAll,
  getOwnProfile,
  updateOwnProfile,
};
