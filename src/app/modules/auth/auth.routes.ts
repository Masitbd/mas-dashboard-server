import { Router } from "express";
import validateRequest from "../../middleware/validateRequest";
import { LoginSchema } from "./auth.validator";
import { AuthController } from "./auth.controller";
import auth from "../../middleware/auth";
import { ENUM_USER_PERMISSION } from "../../enums/enumUserPermission";

const routes = Router();
routes.post("/login", validateRequest(LoginSchema), AuthController.login);
routes.post(
  "/refresh-token",

  AuthController.refreshToken,
);
routes.patch(
  "/change-password",
  auth(ENUM_USER_PERMISSION.ANY),
  AuthController.changePassword,
);

export const AuthRoute = routes;
