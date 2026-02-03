import { STATUS_CODES } from "http";
import AppError from "../../errors/APiError";
import { IUser, UserStatus } from "./user.interface";
import { UserModel } from "./user.model";
import { HttpStatusCode } from "axios";
import { generateUUId } from "../../../utils/generateInvoiceNo";
import bcrypt from "bcrypt";
import config from "../../config";
import { UserProfileModel } from "../profile/profile.model";
import { PipelineStage } from "mongoose";
import { ENUM_USER_PERMISSION } from "../../enums/enumUserPermission";
import httpStatus from "http-status";

const signUp = async (userData: Partial<IUser>): Promise<IUser> => {
  const existingUser = await UserModel.findOne({
    email: userData.email,
  });

  if (existingUser) {
    throw new AppError(
      HttpStatusCode.Conflict,
      "User with this email already exists",
    );
  }
  const uuid = await generateUUId();
  const hashedPassword = await bcrypt.hash(
    userData.password as string,
    config.salt,
  );
  userData.password = hashedPassword;
  userData.uuid = uuid;
  userData.role = "reader";
  userData.emailVerifiedAt = null;
  userData.lastLoginAt = null;
  const newUser = await UserModel.create({ ...userData });
  const profile = await UserProfileModel.create({
    displayName: newUser?.username,
    uuid: newUser.uuid,
  });
  return {
    email: newUser.email,
    username: newUser.username,
    role: newUser.role,
    status: newUser.status,
    uuid: newUser.uuid,
  } as IUser;
};

// -----------------------------
// Types (add near ListPostsQuery)
// -----------------------------
export type ListUsersForAdminQuery = Partial<{
  page: number;
  limit: number;

  role: string; // "admin" | "editor" | "author" | "reader"
  status: string; // "active" | "disabled"

  // support both spellings (because you wrote emailVarified)
  emailVerified: boolean | "true" | "false" | 1 | 0;
  emailVarified: boolean | "true" | "false" | 1 | 0;

  // optional (handy for admin table search)
  search: string;

  sortBy: "createdAt" | "updatedAt" | "username" | "lastLoginAt";
  sortOrder: "asc" | "desc";
}>;

// -----------------------------
// Helpers (add near other helpers)
// -----------------------------
function parseBooleanLike(v: unknown): boolean | undefined {
  if (v === undefined || v === null) return undefined;
  if (typeof v === "boolean") return v;
  if (typeof v === "number")
    return v === 1 ? true : v === 0 ? false : undefined;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["true", "1", "yes", "y"].includes(s)) return true;
    if (["false", "0", "no", "n"].includes(s)) return false;
  }
  return undefined;
}

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// -----------------------------
// Admin: list users (add near listPosts)
// -----------------------------
async function listUsersForAdmin(query: ListUsersForAdminQuery = {}) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 10));
  const skip = (page - 1) * limit;

  const sortByRaw = query.sortBy ?? "createdAt";
  const sortBy: "createdAt" | "updatedAt" | "username" | "lastLoginAt" = [
    "createdAt",
    "updatedAt",
    "username",
    "lastLoginAt",
  ].includes(sortByRaw)
    ? (sortByRaw as any)
    : "createdAt";

  const sortOrder = query.sortOrder === "asc" ? 1 : -1;

  const match: Record<string, any> = {};
  if (query.role) match.role = String(query.role);
  if (query.status) match.status = String(query.status);

  const emailVerified = parseBooleanLike(
    query.emailVerified ?? query.emailVarified,
  );
  if (emailVerified !== undefined) {
    match.emailVerifiedAt = emailVerified ? { $ne: null } : null;
  }

  const profilesCollection = UserProfileModel.collection.name;

  const pipeline: PipelineStage[] = [
    { $match: match },

    // join profile by uuid -> get displayName
    {
      $lookup: {
        from: profilesCollection,
        localField: "uuid",
        foreignField: "uuid",
        as: "profile",
      },
    },
    { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
  ];

  // optional search across username/email/uuid/displayName
  if (query.search?.trim()) {
    const regex = new RegExp(escapeRegex(query.search.trim()), "i");
    pipeline.push({
      $match: {
        $or: [
          { username: regex },
          { email: regex },
          { uuid: regex },
          { "profile.displayName": regex },
        ],
      },
    });
  }

  pipeline.push(
    {
      $facet: {
        data: [
          { $sort: { [sortBy]: sortOrder } },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 0,
              displayName: "$profile.displayName",
              username: 1,
              uuid: 1,
              status: 1,
              role: 1,
              email: 1,
            },
          },
        ],
        meta: [{ $count: "total" }],
      },
    },
    {
      $project: {
        data: 1,
        total: {
          $ifNull: [{ $arrayElemAt: ["$meta.total", 0] }, 0],
        },
      },
    },
  );

  const [result] = await UserModel.aggregate(pipeline).exec();
  const total = result?.total ?? 0;

  return {
    data: result?.data ?? [],
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

const getFullUserInfo = async (uuid: string, loggedInUser: IUser) => {
  const userInfo = await UserModel.findOne({ uuid: uuid });
  const profileInfo = await UserProfileModel.findOne({ uuid: uuid });
  return {
    user: userInfo,
    profile: profileInfo,
  };
};

const changeUserStatus = async (
  uuid: string,
  payload: { status: string },
  user: IUser,
) => {
  const doesExists = await UserModel.findOne({ uuid: uuid });
  if (doesExists) {
    doesExists.status = payload?.status as UserStatus;
    await doesExists.save();
    return "User status has been updated";
  } else {
    throw new AppError(httpStatus.NOT_FOUND, "User Not found");
  }
};

const changeUserPasswordByAdmin = async (
  uuid: string,
  payload: { password: string },
  user: IUser,
) => {
  if (
    user?.role === ENUM_USER_PERMISSION.ADMIN ||
    user?.role === (ENUM_USER_PERMISSION.SUPER_ADMIN as any)
  ) {
    const doesExists = await UserModel.findOne({ uuid: uuid });
    if (doesExists) {
      doesExists.password = await bcrypt.hash(payload.password, config.salt);
      await doesExists?.save();
      return "Password Changed successfully!";
    }
    throw new AppError(httpStatus.NOT_FOUND, "user not found");
  } else {
    throw new AppError(HttpStatusCode.Unauthorized, "You are not authorized");
  }
};

export const UserService = {
  signUp,
  listUsersForAdmin,
  getFullUserInfo,
  changeUserStatus,
  changeUserPasswordByAdmin,
};
