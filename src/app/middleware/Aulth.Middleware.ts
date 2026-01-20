// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/no-explicit-any */

// import jwt, { JwtPayload } from "jsonwebtoken";
// // import { User } from "../module/users/User.Model";
// import { NextFunction, Request, Response } from "express";
// import AppError from "../errors/APiError";
// import status from "http-status";
// import config from "../config";
// import { User } from "../modules/user/user.model";

// const auth = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const token = req.headers.authorization;
//     // check if token exist
//     if (!token) {
//       throw new AppError(status.UNAUTHORIZED, "Your are not authorized");
//     }

//     // if token is valid or not

//     const decoded = jwt.verify(
//       token,
//       config.jwt.access_secret as string
//     ) as JwtPayload;

//     const { phone, iat, id } = decoded;

//     // check user

//     const user = await User.findOne({ phone });

//     // ? for one device login

//     // if (user && user.accessToken !== token) {
//     //   throw new AppError(status.FORBIDDEN, "You're not authorized");
//     // }

//     const isActive = user?.status;
//     // check if the user is active or not

//     if (!isActive) {
//       throw new AppError(status.UNAUTHORIZED, "User is not active");
//     }

//     // check if the token generate before chage password?
//     if (
//       user.passwordChangedAt &&
//       User.isJWTIssuedBeforePasswordChanged(
//         user.passwordChangedAt,
//         iat as number
//       )
//     ) {
//       throw new AppError(status.UNAUTHORIZED, "You are not authorized !");
//     }

//     req.user = decoded as JwtPayload;
//     next();
//   } catch (err: any) {
//     throw new AppError(status.BAD_REQUEST, "Something went wrong");
//   }
// };

// export default auth;
