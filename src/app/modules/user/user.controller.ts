import { RequestHandler } from "express";
import catchAsync from "../../../shared/catchAsync";
import { UserService } from "./user.service";
import sendResponse from "../../../shared/sendResponse";
import { IUser } from "./user.interface";
import status from "http-status";
import { Request, Response } from "express";
import { HttpStatusCode } from "axios";

const signUp: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const loggedInUserInfo = req.user;
    const result = await UserService.signUp(req.body as Partial<IUser>);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Signed Up successfully!",
      data: result,
    });
  },
);

/**
 * GET /admin/users
 * query: page, limit, searchTerm, sort, sortOrder, role, status, emailVarified/emailVerified
 */
const getUsersForAdmin: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const {
      page,
      limit,
      searchTerm,
      sort,
      sortOrder,
      role,
      status: userStatus,
      emailVarified,
      emailVerified,
    } = req.query;

    const result = await UserService.listUsersForAdmin({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,

      search: searchTerm ? String(searchTerm) : undefined,

      role: role ? String(role) : undefined,
      status: userStatus ? String(userStatus) : undefined,

      // support both spellings
      emailVarified: emailVarified as any,
      emailVerified: emailVerified as any,

      sortBy: sort ? (String(sort) as any) : undefined,
      sortOrder: (sortOrder ? String(sortOrder) : "desc") as "asc" | "desc",
    });

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Users fetched successfully!",
      data: result,
    });
  },
);

// Get Full user info for admin

const getFullUserInfo: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { uuid } = req.params;

    console.log(uuid);
    const result = await UserService.getFullUserInfo(
      uuid as string,
      req?.user as IUser,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "User  Info fetched successfully!",
      data: result,
    });
  },
);

// Changing the user status

const changeUserStatus: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { uuid } = req.params;
    const { status } = req.body;

    console.log(req.body);

    const result = await UserService.changeUserStatus(
      uuid as string,
      {
        status,
      },
      req?.user as IUser,
    );

    sendResponse(res, {
      statusCode: HttpStatusCode.Ok,
      success: true,
      message: "User  Status successfully!",
      data: result,
    });
  },
);

// Change user password by admin

const changeUserPasswordByAdmin: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { uuid } = req.params;
    const { password } = req.body;

    const result = await UserService.changeUserPasswordByAdmin(
      uuid as string,
      {
        password,
      },
      req?.user as IUser,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "User  Password Changed successfully!",
      data: result,
    });
  },
);

export const UserController = {
  signUp,
  getUsersForAdmin,
  getFullUserInfo,
  changeUserStatus,
  changeUserPasswordByAdmin,
};
