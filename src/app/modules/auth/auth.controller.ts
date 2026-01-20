import { RequestHandler } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import status from "http-status";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { IUser } from "../user/user.interface";

const login: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const loggedInUserInfo = req.user;
    const result = await AuthService.loginUser(req.body);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Logged in successfully!",
      data: result,
    });
  },
);
export const AuthController = {
  login,
};
