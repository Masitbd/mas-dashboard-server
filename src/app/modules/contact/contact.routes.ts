import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { ENUM_USER_PERMISSION } from "../../enums/enumUserPermission";
import { ContactController } from "./contact.controller";
import {
  ContactCreationZodSchema,
  ContactIdParamZodSchema,
  ContactQueryZodSchema,
} from "./contact.validation";

const routes = Router();

// Public create
routes.post(
  "/",
  validateRequest(ContactCreationZodSchema),
  ContactController.createContact,
);

// Admin list (pagination + filter + searchTerm)
routes.get(
  "/",
  auth(ENUM_USER_PERMISSION.ADMIN, ENUM_USER_PERMISSION.SUPER_ADMIN),
  validateRequest(ContactQueryZodSchema),
  ContactController.getAllContacts,
);

// Admin get single
routes.get(
  "/:id",
  auth(ENUM_USER_PERMISSION.ADMIN, ENUM_USER_PERMISSION.SUPER_ADMIN),
  validateRequest(ContactIdParamZodSchema),
  ContactController.getContactById,
);

export const ContactRoute = routes;
