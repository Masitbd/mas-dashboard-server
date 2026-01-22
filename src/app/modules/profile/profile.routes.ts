// userProfile.route.ts
import { Router } from "express";
import validateRequest from "../../middleware/validateRequest";
import { UserProfileController } from "./profile.controller";
import {
  UserProfileCreationZodSchema,
  UserProfileQueryZodSchema,
  UserProfileUpdateZodSchema,
  UserProfileUuidParamZodSchema,
} from "./profile.validator";
import auth from "../../middleware/auth";
import { ENUM_USER_PERMISSION } from "../../enums/enumUserPermission";

const routes = Router();

// Update (by uuid) only for admin and super-admin
routes.post(
  "/",
  validateRequest(UserProfileCreationZodSchema),
  auth(ENUM_USER_PERMISSION.SUPER_ADMIN, ENUM_USER_PERMISSION.ADMIN),
  UserProfileController.createProfile,
);

// Update (by uuid) only for admin and super-admin
routes.get(
  "/",
  validateRequest(UserProfileQueryZodSchema),
  auth(ENUM_USER_PERMISSION.SUPER_ADMIN, ENUM_USER_PERMISSION.ADMIN),
  UserProfileController.getAllProfiles,
);

// get own profile
routes.get(
  "/me",
  auth(ENUM_USER_PERMISSION.ANY),

  UserProfileController.getOwnProfile,
);

// Update own profile
routes.patch(
  "/me",
  validateRequest(UserProfileUpdateZodSchema),
  auth(ENUM_USER_PERMISSION.ANY),
  UserProfileController.updateOwnProfile,
);

// Update (by uuid) only for admin and super-admin
routes.get(
  "/:uuid",
  validateRequest(UserProfileUuidParamZodSchema),
  auth(ENUM_USER_PERMISSION.SUPER_ADMIN, ENUM_USER_PERMISSION.ADMIN),
  UserProfileController.getProfileByUuid,
);

// Update (by uuid) only for admin and super-admin
routes.patch(
  "/:uuid",
  validateRequest(UserProfileUpdateZodSchema),
  auth(ENUM_USER_PERMISSION.SUPER_ADMIN, ENUM_USER_PERMISSION.ADMIN),
  UserProfileController.updateProfileByUuid,
);

// Update (by uuid) only for admin and super-admin
routes.delete(
  "/:uuid",
  validateRequest(UserProfileUuidParamZodSchema),
  auth(ENUM_USER_PERMISSION.SUPER_ADMIN, ENUM_USER_PERMISSION.ADMIN),
  UserProfileController.deleteProfileByUuid,
);

export const UserProfileRoute = routes;
