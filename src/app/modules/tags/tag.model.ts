import mongoose, { Schema, Model, InferSchemaType } from "mongoose";
import { ITag } from "./tags.interface";

const TagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
      unique: true, // categories typically unique by name
      index: true,
    },
    description: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type TagDocument = InferSchemaType<typeof TagSchema>;

export const TagModel: Model<TagDocument> =
  mongoose.models.Tag || mongoose.model<TagDocument>("Tag", TagSchema);
