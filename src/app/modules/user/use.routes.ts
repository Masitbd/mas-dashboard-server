import { Router } from "express";
import validateRequest from "../../middleware/validateRequest";
import { UserCreationZodSchema } from "./user.validator";
import { UserController } from "./user.controller";

const routes = Router();
routes.post(
  "/sign-up",
  validateRequest(UserCreationZodSchema),
  UserController.signUp,
);

export const UserRoute = routes;
