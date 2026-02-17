import { Router } from "express";
import { UserRoute } from "../modules/user/use.routes";
import { AuthRoute } from "../modules/auth/auth.routes";
import { UserProfileRoute } from "../modules/profile/profile.routes";
import { CategoryRoute } from "../modules/categories/category.routes";
import { TagRoutes } from "../modules/tags/category.routes";
import { PostRoute } from "../modules/post/post.routes";
import { CommentRoute } from "../modules/comment/comment.routes";
import { AssetRoute } from "../modules/asset/asset.routes";
import { ContactRoute } from "../modules/contact/contact.routes";

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
  {
    path: "/tags",
    module: TagRoutes,
  },
  {
    path: "/posts",
    module: PostRoute,
  },
  {
    path: "/comment",
    module: CommentRoute,
  },
  {
    path: "/assets",
    module: AssetRoute,
  },
  {
    path: "/contact",
    module: ContactRoute,
  },
];

modules.forEach((route) => {
  router.use(route.path, route.module);
});

export default router;
