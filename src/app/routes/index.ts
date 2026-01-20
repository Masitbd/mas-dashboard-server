import { Router } from "express";
import { UserRoute } from "../modules/user/use.routes";
import { AuthRoute } from "../modules/auth/auth.routes";

const router = Router();

const modules = [
  {
    path: "/user",
    module: UserRoute,
  },
  {
    path: "/auth",
    module: AuthRoute,
  },
];

modules.forEach((route) => {
  router.use(route.path, route.module);
});

export default router;
