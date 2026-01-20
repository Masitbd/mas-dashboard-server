import { RequestHandler } from "express";
import catchAsync from "../../../shared/catchAsync";
import { UserService } from "./user.service";
import sendResponse from "../../../shared/sendResponse";
import { IUser } from "./user.interface";
import status from "http-status";
import { Request, Response } from "express";

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

export const UserController = {
  signUp,
};
