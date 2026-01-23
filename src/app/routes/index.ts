import { Router } from "express";
import { UserRoute } from "../modules/user/use.routes";
import { AuthRoute } from "../modules/auth/auth.routes";
import { UserProfileRoute } from "../modules/profile/profile.routes";
import { CategoryRoute } from "../modules/categories/category.routes";

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
  {
    path: "/profile",
    module: UserProfileRoute,
  },
  {
    path: "/categories",
    module: CategoryRoute,
  },
];

modules.forEach((route) => {
  router.use(route.path, route.module);
});

export default router;
