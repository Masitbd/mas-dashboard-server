import mongoose, { InferSchemaType, Model, Schema } from "mongoose";
import { IContact } from "./contact.interface";

const ContactSchema = new Schema<IContact>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 5000,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

ContactSchema.index({ createdAt: -1 });

export type ContactDocument = InferSchemaType<typeof ContactSchema>;

export const ContactModel: Model<ContactDocument> =
  mongoose.models.Contact ||
  mongoose.model<ContactDocument>("Contact", ContactSchema);
