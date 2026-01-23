// category.route.ts
import { Router } from "express";
import validateRequest from "../../middleware/validateRequest";
import { CategoryController } from "./category.controller";
import {
  CategoryCreationZodSchema,
  CategoryUpdateZodSchema,
  CategoryIdParamZodSchema,
  CategoryQueryZodSchema,
} from "./category.validate";
import auth from "../../middleware/auth";
import { ENUM_USER_PERMISSION } from "../../enums/enumUserPermission";

const routes = Router();

// Create
routes.post(
  "/",
  auth(ENUM_USER_PERMISSION.ADMIN, ENUM_USER_PERMISSION.SUPER_ADMIN),
  validateRequest(CategoryCreationZodSchema),
  CategoryController.createCategory,
);

// Find all (pagination + search)
routes.get(
  "/",
  auth(ENUM_USER_PERMISSION.ADMIN, ENUM_USER_PERMISSION.SUPER_ADMIN),
  validateRequest(CategoryQueryZodSchema),
  CategoryController.getAllCategories,
);

// Find one
routes.get(
  "/:id",
  auth(ENUM_USER_PERMISSION.ADMIN, ENUM_USER_PERMISSION.SUPER_ADMIN),
  validateRequest(CategoryIdParamZodSchema),
  CategoryController.getCategoryById,
);

// Update
routes.patch(
  "/:id",
  auth(ENUM_USER_PERMISSION.ADMIN, ENUM_USER_PERMISSION.SUPER_ADMIN),
  validateRequest(CategoryUpdateZodSchema),
  CategoryController.updateCategoryById,
);

// Delete
routes.delete(
  "/:id",
  auth(ENUM_USER_PERMISSION.ADMIN, ENUM_USER_PERMISSION.SUPER_ADMIN),
  validateRequest(CategoryIdParamZodSchema),
  CategoryController.deleteCategoryById,
);

export const CategoryRoute = routes;
