import { status as statusCodes } from "http-status";
import AppError from "../../errors/APiError";
import { UserModel } from "../user/user.model";
import bcrypt from "bcrypt";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import config from "../../config";
import { Secret } from "jsonwebtoken";
import { ILoginUser, ILoginUserResponse } from "./auth.interface";
import { HttpStatusCode } from "axios";
import { UserProfileModel } from "../profile/profile.model";

const loginUser = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
  const { email, password } = payload;

  const isUserExist = await UserModel.findOne({ email: email }).select(
    "+password",
  );

  if (!isUserExist) {
    throw new AppError(statusCodes.NOT_FOUND, "User does not exist");
  }

  // no need for password validation for provider login
  if (
    isUserExist.password &&
    !(await bcrypt.compare(password, isUserExist.password))
  ) {
    throw new AppError(statusCodes.UNAUTHORIZED, "Password is incorrect");
  }

  //create access token & refresh token

  const { uuid, role, status, _id, emailVerifiedAt, username } = isUserExist;

  const accessTokenData: any = {
    uuid,
    role,
    status,
    _id,
    emailVerifiedAt,
    username,
    email,
  };
  // checking is the user is rusticate

  const accessToken = jwtHelpers.generateAccessToken(
    accessTokenData,
    config.jwt.access_secret as Secret,
    config.jwt.expire_in as unknown as string,
  );

  const refreshToken = jwtHelpers.generateAccessToken(
    { uuid, role, status, _id, emailVerifiedAt, username },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expire_in as unknown as string,
  );

  return {
    accessToken,
    refreshToken,
  };
};
const refreshToken = async (token: string) => {
  //verify token
  let verifiedToken = null;
  try {
    verifiedToken = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_secret as Secret,
    );
  } catch (err) {
    throw new AppError(HttpStatusCode.Forbidden, "Invalid Refresh Token");
  }

  const { email, uuid } = verifiedToken;

  // checking deleted user's refresh token

  // const isUserExist = (await User.isUserExist(
  //   email
  // )) as unknown as IUserResponse;
  const isUserExist = await UserModel.findOne({ uuid: uuid });
  // get new profile
  const profile = await UserProfileModel.findOne({ uuid: isUserExist?.uuid });
  if (!isUserExist || !profile) {
    throw new AppError(HttpStatusCode.NotFound, "User does not exist");
  }

  // Setting default delivery address to the user token
  const accessTokenData: any = {
    username: isUserExist?.username,
    status: isUserExist?.status,
    _id: isUserExist?.id,
    uuid: isUserExist.uuid,
    role: isUserExist.role,
    email: isUserExist.email,
    emailVerifiedAt: isUserExist.emailVerifiedAt,
  };

  //generate new token

  const newAccessToken = jwtHelpers.generateAccessToken(
    accessTokenData,
    config.jwt.access_secret as Secret,
    config.jwt.expire_in as string,
  );

  return {
    accessToken: newAccessToken,
  };
};

export const AuthService = {
  loginUser,
  refreshToken,
};
