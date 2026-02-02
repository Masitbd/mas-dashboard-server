import { Router } from "express";
import validateRequest from "../../middleware/validateRequest";
import { UserCreationZodSchema } from "./user.validator";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import auth from "../../middleware/auth";
import { ENUM_USER_PERMISSION } from "../../enums/enumUserPermission";

const routes = Router();
routes.post(
  "/sign-up",
  validateRequest(UserCreationZodSchema),
  UserController.signUp,
);

routes.get(
  "/all-users",
  auth(ENUM_USER_PERMISSION.ADMIN, ENUM_USER_PERMISSION.SUPER_ADMIN),
  UserController.getUsersForAdmin,
);

routes.get(
  "/admin/:uuid",
  auth(ENUM_USER_PERMISSION.SUPER_ADMIN, ENUM_USER_PERMISSION.ADMIN),
  UserController.getFullUserInfo,
);

routes.patch(
  "/change-status/:uuid",
  auth(ENUM_USER_PERMISSION.SUPER_ADMIN, ENUM_USER_PERMISSION.ADMIN),
  UserController.changeUserStatus,
);

routes.patch(
  "/change-password-admin/:uuid",
  auth(ENUM_USER_PERMISSION.SUPER_ADMIN, ENUM_USER_PERMISSION.ADMIN),
  UserController.changeUserPasswordByAdmin,
);
export const UserRoute = routes;
