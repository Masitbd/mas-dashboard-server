import { STATUS_CODES } from "http";
import AppError from "../../errors/APiError";
import { IUser } from "./user.interface";
import { UserModel } from "./user.model";
import { HttpStatusCode } from "axios";
import { generateUUId } from "../../../utils/generateInvoiceNo";
import bcrypt from "bcrypt";
import config from "../../config";

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
  return {
    email: newUser.email,
    username: newUser.username,
    role: newUser.role,
    status: newUser.status,
    uuid: newUser.uuid,
  } as IUser;
};

export const UserService = {
  signUp,
};
