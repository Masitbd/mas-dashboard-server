// category.model.ts
import mongoose, { Schema, Model, InferSchemaType } from "mongoose";
import { ICategory } from "./category.interface";

const CategorySchema = new Schema<ICategory>(
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

export type CategoryDocument = InferSchemaType<typeof CategorySchema>;

export const CategoryModel: Model<CategoryDocument> =
  mongoose.models.Category ||
  mongoose.model<CategoryDocument>("Category", CategorySchema);
