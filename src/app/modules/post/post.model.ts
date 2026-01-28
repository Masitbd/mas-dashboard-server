// models/post.model.ts
import mongoose, { Schema, type Model, type HydratedDocument } from "mongoose";
import { Post } from "./post.interface";

const { Types } = mongoose;

// export interface Postee {
//   id: string; // virtual (maps to _id)

//   slug: string;
//   title: string;
//   excerpt: string;
//   content: string;

//   coverImage: string;

//   // ✅ References
//   category: mongoose.Types.ObjectId; // ref: "Category"
//   tags: mongoose.Types.ObjectId[]; // ref: "Tag" (optional but recommended)
//   author: mongoose.Types.ObjectId; // ref: "User"

//   readingTime: string;
// }

export type PostDocument = HydratedDocument<Post>;

const PostSchema = new Schema<Post>(
  {
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },

    title: { type: String, required: true, trim: true },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, required: true },

    coverImage: { type: String, required: true, trim: true },

    // ✅ ObjectId refs
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    tags: [
      {
        type: Types.ObjectId,
        ref: "Tag",
        index: true,
      },
    ],

    author: {
      type: Schema.Types.ObjectId,
      ref: "UserProfile",
      required: true,
      index: true,
    },

    readingTime: { type: String, required: true, trim: true },
    status: {
      type: String,
      required: true,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    placement: {
      type: String,
      default: "general",
      enum: ["general", "featured", "popular"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Useful indexes
PostSchema.index({ title: "text", excerpt: "text", content: "text" });
PostSchema.index({ category: 1, createdAt: -1 });
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ tags: 1, createdAt: -1 });

// Model
export const PostModel: Model<Post> =
  mongoose.models.Post || mongoose.model<Post>("Post", PostSchema);
