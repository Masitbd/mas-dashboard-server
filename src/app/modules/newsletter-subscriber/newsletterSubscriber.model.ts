import mongoose, { InferSchemaType, Model, Schema } from "mongoose";
import { INewsletterSubscriber } from "./newsletterSubscriber.interface";

const NewsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
      index: true,
      unique: true,
    },
    subscribed: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

NewsletterSubscriberSchema.index({ createdAt: -1 });

export type NewsletterSubscriberDocument = InferSchemaType<
  typeof NewsletterSubscriberSchema
>;

export const NewsletterSubscriberModel: Model<NewsletterSubscriberDocument> =
  mongoose.models.NewsletterSubscriber ||
  mongoose.model<NewsletterSubscriberDocument>(
    "NewsletterSubscriber",
    NewsletterSubscriberSchema,
  );
