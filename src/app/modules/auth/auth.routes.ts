import { Router } from "express";
import validateRequest from "../../middleware/validateRequest";
import { LoginSchema } from "./auth.validator";
import { AuthController } from "./auth.controller";

const routes = Router();
routes.post("/login", validateRequest(LoginSchema), AuthController.login);

export const AuthRoute = routes;
