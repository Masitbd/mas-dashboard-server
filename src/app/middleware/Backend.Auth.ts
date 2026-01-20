// import { NextFunction, Request, Response } from "express";
// import jwt, { JwtPayload } from "jsonwebtoken";

// import status from "http-status";
// import AppError from "../errors/APiError";
// import config from "../config";
// import { User } from "../modules/user/user.model";

// const backAuth = async (req: Request, res: Response, next: NextFunction) => {
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

//     const { email, iat } = decoded;

//     // check user

//     const user = await User.findOne({ email });

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

//     req.user = decoded;
//     next();
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   } catch (error) {
//     throw new AppError(status.BAD_GATEWAY, "Something went wrong");
//   }
// };

// export default backAuth;
