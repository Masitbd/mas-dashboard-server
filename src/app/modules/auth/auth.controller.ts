import { RequestHandler } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import status from "http-status";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { IUser } from "../user/user.interface";
import config from "../../config";

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

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.headers.authorization;

  const result = await AuthService.refreshToken(refreshToken as string);

  // set refresh token into cookie
  const cookieOptions = {
    secure: config.node_env === "production",
    httpOnly: true,
  };

  res.cookie("refreshToken", refreshToken, cookieOptions);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Token Refreshed successfully!",
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.changePassword(req?.user, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Password Updated successfully!",
    data: result,
  });
});
export const AuthController = {
  login,
  refreshToken,
  changePassword,
};
