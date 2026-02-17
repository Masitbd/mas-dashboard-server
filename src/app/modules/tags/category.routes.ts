// category.route.ts
import { Router } from "express";
import validateRequest from "../../middleware/validateRequest";

import auth from "../../middleware/auth";
import { ENUM_USER_PERMISSION } from "../../enums/enumUserPermission";
import {
  TagCreationZodSchema,
  TagIdParamZodSchema,
  TagQueryZodSchema,
  TagUpdateZodSchema,
} from "./tag.validate";
import { TagController } from "./tag.controller";

const routes = Router();

// Create
routes.post(
  "/",
  auth(ENUM_USER_PERMISSION.ADMIN, ENUM_USER_PERMISSION.SUPER_ADMIN),
  validateRequest(TagCreationZodSchema),
  TagController.createTag,
);

// Find all (pagination + search)
routes.get("/", validateRequest(TagQueryZodSchema), TagController.getAllTags);

// Find one
routes.get(
  "/:id",
  validateRequest(TagIdParamZodSchema),
  TagController.getTagById,
);

// Update
routes.patch(
  "/:id",
  auth(ENUM_USER_PERMISSION.ADMIN, ENUM_USER_PERMISSION.SUPER_ADMIN),
  validateRequest(TagUpdateZodSchema),
  TagController.updateTagById,
);

// Delete
routes.delete(
  "/:id",
  auth(ENUM_USER_PERMISSION.ADMIN, ENUM_USER_PERMISSION.SUPER_ADMIN),
  validateRequest(TagIdParamZodSchema),
  TagController.deleteTagById,
);

export const TagRoutes = routes;
