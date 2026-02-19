import { HttpStatusCode } from "axios";
import AppError from "../../errors/APiError";
import { INewsletterSubscriber } from "./newsletterSubscriber.interface";
import { NewsletterSubscriberModel } from "./newsletterSubscriber.model";

type FindAllNewsletterSubscribersParams = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  email?: string;
  subscribed?: boolean;
  sort?: "newest" | "oldest" | "emailAsc" | "emailDesc";
};

const escapeRegex = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const createNewsletterSubscriber = async (
  payload: Partial<INewsletterSubscriber>,
): Promise<INewsletterSubscriber> => {
  const email = payload.email?.trim().toLowerCase();
  const subscribed = payload.subscribed;

  if (!email) {
    throw new AppError(HttpStatusCode.BadRequest, "email is required");
  }

  if (typeof subscribed !== "boolean") {
    throw new AppError(
      HttpStatusCode.BadRequest,
      "subscribed is required and must be boolean",
    );
  }

  const created = await NewsletterSubscriberModel.create({
    email,
    subscribed,
  });

  return created.toObject() as INewsletterSubscriber;
};

const findNewsletterSubscriberById = async (
  id: string,
): Promise<INewsletterSubscriber> => {
  const subscriber = await NewsletterSubscriberModel.findById(id).lean();

  if (!subscriber) {
    throw new AppError(HttpStatusCode.NotFound, "Newsletter subscriber not found");
  }

  return subscriber as unknown as INewsletterSubscriber;
};

const findAllNewsletterSubscribers = async (
  params: FindAllNewsletterSubscribersParams = {},
) => {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = {};

  const searchTerm = params.searchTerm?.trim();
  if (searchTerm) {
    const rx = new RegExp(escapeRegex(searchTerm), "i");
    filter.$or = [{ email: rx }];
  }

  if (params.email?.trim()) {
    filter.email = new RegExp(escapeRegex(params.email.trim()), "i");
  }

  if (typeof params.subscribed === "boolean") {
    filter.subscribed = params.subscribed;
  }

  const sortMap: Record<
    NonNullable<FindAllNewsletterSubscribersParams["sort"]>,
    any
  > = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    emailAsc: { email: 1 },
    emailDesc: { email: -1 },
  };

  const sort = params.sort ? sortMap[params.sort] : sortMap.newest;

  const [items, total] = await Promise.all([
    NewsletterSubscriberModel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    NewsletterSubscriberModel.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
    data: items as unknown as INewsletterSubscriber[],
  };
};

export const NewsletterSubscriberService = {
  createNewsletterSubscriber,
  findNewsletterSubscriberById,
  findAllNewsletterSubscribers,
};
