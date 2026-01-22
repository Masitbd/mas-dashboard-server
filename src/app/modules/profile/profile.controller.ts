import { RequestHandler, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import status from "http-status";
import { UserProfileService } from "./profile.service";
import { IUserProfile } from "./profile.model";

/**
 * POST /profiles
 */
const createProfile: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UserProfileService.createProfile(
      req.body as Partial<IUserProfile>,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Profile created successfully!",
      data: result,
    });
  },
);

/**
 * GET /profiles/:uuid
 */
const getProfileByUuid: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { uuid } = req.params;
    const result = await UserProfileService.findOneByUuid(uuid as string);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Profile fetched successfully!",
      data: result,
    });
  },
);

/**
 * GET /profiles
 * Query:
 *  - page, limit, q, location, hasAvatar, sort
 */
const getAllProfiles: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { page, limit, searchTerm, field, hasAvatar, sort } = req.query;

    const result = await UserProfileService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      searchTerm: searchTerm ? String(searchTerm) : undefined,
      field: field ? String(field) : undefined,
      hasAvatar:
        typeof hasAvatar === "string" ? hasAvatar === "true" : undefined,
      sort: sort ? (String(sort) as any) : undefined,
    });

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Profiles fetched successfully!",
      data: result,
    });
  },
);

/**
 * PATCH /profiles/:uuid
 */
const updateProfileByUuid: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { uuid } = req.params;

    const result = await UserProfileService.updateByUuid(
      uuid as string,
      req.body as Partial<IUserProfile>,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Profile updated successfully!",
      data: result,
    });
  },
);

/**
 * DELETE /profiles/:uuid
 */
const deleteProfileByUuid: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { uuid } = req.params;

    const result = await UserProfileService.deleteByUuid(uuid as string);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Profile deleted successfully!",
      data: result,
    });
  },
);

const getOwnProfile: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;

    const result = await UserProfileService.getOwnProfile(user?.uuid as string);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Profile fetched successfully!",
      data: result,
    });
  },
);

const updateOwnProfile: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;

    const result = await UserProfileService.updateOwnProfile(
      user?.uuid as string,
      req.body as Partial<IUserProfile>,
    );
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Profile updated successfully!",
      data: result,
    });
  },
);

export const UserProfileController = {
  createProfile,
  getProfileByUuid,
  getAllProfiles,
  updateProfileByUuid,
  deleteProfileByUuid,
  getOwnProfile,
  updateOwnProfile,
};
