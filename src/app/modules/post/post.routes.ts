// post.route.ts
import { Router } from "express";
import validateRequest from "../../middleware/validateRequest";
import auth from "../../middleware/auth";
import { ENUM_USER_PERMISSION } from "../../enums/enumUserPermission";

import { PostController } from "./post.controller";
import {
  PostCreationZodSchema,
  PostUpdateZodSchema,
  PostIdParamZodSchema,
  PostSlugParamZodSchema,
  PostQueryZodSchema,
  PostTagsZodSchema,
} from "./post.validation";

const routes = Router();

/**
 * Governance (recommended):
 * - Create/Update/Delete: ADMIN, SUPER_ADMIN, (optionally EDITOR)
 * - Read/List: public or authenticated based on your product
 *
 * If you have EDITOR permission, add it below. Otherwise keep as-is.
 */

// Create
routes.post(
  "/",
  auth(
    ENUM_USER_PERMISSION.ADMIN,
    ENUM_USER_PERMISSION.SUPER_ADMIN,
    ENUM_USER_PERMISSION.EDITOR,
    ENUM_USER_PERMISSION.AUTHOR,
  ),
  validateRequest(PostCreationZodSchema),
  PostController.createPost,
);

// List (pagination + search)
routes.get(
  "/",
  validateRequest(PostQueryZodSchema),
  PostController.getAllPosts,
);

// Find one by slug (keep before "/:id" to avoid conflicts)
routes.get(
  "/slug/:slug",
  auth(ENUM_USER_PERMISSION.ADMIN, ENUM_USER_PERMISSION.SUPER_ADMIN),
  validateRequest(PostSlugParamZodSchema),
  PostController.getPostBySlug,
);

// Find one by id
routes.get(
  "/:id",
  auth(ENUM_USER_PERMISSION.ADMIN, ENUM_USER_PERMISSION.SUPER_ADMIN),
  validateRequest(PostIdParamZodSchema),
  PostController.getPostById,
);

// Update
routes.patch(
  "/:id",
  auth(ENUM_USER_PERMISSION.ADMIN, ENUM_USER_PERMISSION.SUPER_ADMIN),
  validateRequest(PostUpdateZodSchema),
  PostController.updatePostById,
);

// Delete
routes.delete(
  "/:id",
  auth(ENUM_USER_PERMISSION.ADMIN, ENUM_USER_PERMISSION.SUPER_ADMIN),
  validateRequest(PostIdParamZodSchema),
  PostController.deletePostById,
);

// Add tags to post
routes.post(
  "/:id/tags",
  auth(ENUM_USER_PERMISSION.ADMIN, ENUM_USER_PERMISSION.SUPER_ADMIN),
  validateRequest(PostTagsZodSchema),
  PostController.addTagsToPost,
);

// Remove tags from post
routes.delete(
  "/:id/tags",
  auth(ENUM_USER_PERMISSION.ADMIN, ENUM_USER_PERMISSION.SUPER_ADMIN),
  validateRequest(PostTagsZodSchema),
  PostController.removeTagsFromPost,
);

// Changing post Status
routes.patch(
  "/change-status/:id",
  auth(
    ENUM_USER_PERMISSION.ADMIN,
    ENUM_USER_PERMISSION.SUPER_ADMIN,
    ENUM_USER_PERMISSION.AUTHOR,
  ),
);

export const PostRoute = routes;
