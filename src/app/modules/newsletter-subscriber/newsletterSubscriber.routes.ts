import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { ENUM_USER_PERMISSION } from "../../enums/enumUserPermission";
import { NewsletterSubscriberController } from "./newsletterSubscriber.controller";
import {
  NewsletterSubscriberCreationZodSchema,
  NewsletterSubscriberIdParamZodSchema,
  NewsletterSubscriberQueryZodSchema,
} from "./newsletterSubscriber.validation";

const routes = Router();

// Public create
routes.post(
  "/",
  validateRequest(NewsletterSubscriberCreationZodSchema),
  NewsletterSubscriberController.createNewsletterSubscriber,
);

// Admin list
routes.get(
  "/",
  auth(ENUM_USER_PERMISSION.ADMIN, ENUM_USER_PERMISSION.SUPER_ADMIN),
  validateRequest(NewsletterSubscriberQueryZodSchema),
  NewsletterSubscriberController.getAllNewsletterSubscribers,
);

// Admin get single
routes.get(
  "/:id",
  auth(ENUM_USER_PERMISSION.ADMIN, ENUM_USER_PERMISSION.SUPER_ADMIN),
  validateRequest(NewsletterSubscriberIdParamZodSchema),
  NewsletterSubscriberController.getNewsletterSubscriberById,
);

export const NewsletterSubscriberRoute = routes;
