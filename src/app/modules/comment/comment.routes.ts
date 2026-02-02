import { Router } from "express";
import validateRequest from "../../middleware/validateRequest";
import auth from "../../middleware/auth";
import { ENUM_USER_PERMISSION } from "../../enums/enumUserPermission";

import { CommentController } from "./comment.controller";
import {
  CommentCreationZodSchema,
  CommentIdParamZodSchema,
  CommentListByPostZodSchema,
  CommentModerateZodSchema,
  CommentUpdateZodSchema,
} from "./comment.validation";

const routes = Router();

// Create comment (authenticated)
routes.post(
  "/",
  auth(
    ENUM_USER_PERMISSION.ADMIN,
    ENUM_USER_PERMISSION.SUPER_ADMIN,
    ENUM_USER_PERMISSION.EDITOR,
    ENUM_USER_PERMISSION.AUTHOR,
    ENUM_USER_PERMISSION.READER,
  ),
  validateRequest(CommentCreationZodSchema),
  CommentController.createComment,
);

// List comments by post (public)
routes.get(
  "/post/:postId",
  validateRequest(CommentListByPostZodSchema),
  CommentController.listCommentsByPost,
);

// Moderate (must be before "/:id")
routes.patch(
  "/moderate/:id",
  auth(
    ENUM_USER_PERMISSION.ADMIN,
    ENUM_USER_PERMISSION.SUPER_ADMIN,
    ENUM_USER_PERMISSION.EDITOR,
  ),
  validateRequest(CommentModerateZodSchema),
  CommentController.moderateComment,
);

// Get comment by id (admin/staff)
routes.get(
  "/:id",
  auth(ENUM_USER_PERMISSION.ADMIN, ENUM_USER_PERMISSION.SUPER_ADMIN),
  validateRequest(CommentIdParamZodSchema),
  CommentController.getCommentById,
);

// Update (author or staff)
routes.patch(
  "/:id",
  auth(
    ENUM_USER_PERMISSION.ADMIN,
    ENUM_USER_PERMISSION.SUPER_ADMIN,
    ENUM_USER_PERMISSION.EDITOR,
    ENUM_USER_PERMISSION.AUTHOR,
    ENUM_USER_PERMISSION.READER,
  ),
  validateRequest(CommentUpdateZodSchema),
  CommentController.updateCommentById,
);

// Delete (author or staff)
routes.delete(
  "/:id",
  auth(
    ENUM_USER_PERMISSION.ADMIN,
    ENUM_USER_PERMISSION.SUPER_ADMIN,
    ENUM_USER_PERMISSION.EDITOR,
    ENUM_USER_PERMISSION.AUTHOR,
    ENUM_USER_PERMISSION.READER,
  ),
  validateRequest(CommentIdParamZodSchema),
  CommentController.deleteCommentById,
);

export const CommentRoute = routes;
