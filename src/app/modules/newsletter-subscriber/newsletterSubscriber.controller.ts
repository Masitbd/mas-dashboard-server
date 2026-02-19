import { Request, RequestHandler, Response } from "express";
import status from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { INewsletterSubscriber } from "./newsletterSubscriber.interface";
import { NewsletterSubscriberService } from "./newsletterSubscriber.service";

const createNewsletterSubscriber: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await NewsletterSubscriberService.createNewsletterSubscriber(
      req.body as Partial<INewsletterSubscriber>,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Thank you.",
      data: result,
    });
  },
);

const getNewsletterSubscriberById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result =
      await NewsletterSubscriberService.findNewsletterSubscriberById(
        id as string,
      );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Newsletter subscriber fetched successfully!",
      data: result,
    });
  },
);

const getAllNewsletterSubscribers: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { page, limit, searchTerm, email, subscribed, sort } = req.query;

    const result =
      await NewsletterSubscriberService.findAllNewsletterSubscribers({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        searchTerm: searchTerm ? String(searchTerm) : undefined,
        email: email ? String(email) : undefined,
        subscribed:
          subscribed === "true"
            ? true
            : subscribed === "false"
              ? false
              : undefined,
        sort: sort ? (String(sort) as any) : undefined,
      });

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Newsletter subscribers fetched successfully!",
      data: result,
    });
  },
);

export const NewsletterSubscriberController = {
  createNewsletterSubscriber,
  getNewsletterSubscriberById,
  getAllNewsletterSubscribers,
};
