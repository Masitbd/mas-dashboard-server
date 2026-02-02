import mongoose, { Schema, type Model, type HydratedDocument } from "mongoose";
import { Comment } from "./comment.interface";

export type CommentDocument = HydratedDocument<Comment>;

const CommentSchema = new Schema<Comment>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: "UserProfile",
      required: true,
      index: true,
    },

    parent: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    status: {
      type: String,
      required: true,
      enum: ["pending", "approved", "rejected", "spam", "deleted"],
      default: "pending",
      index: true,
    },

    editedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Helpful indexes
CommentSchema.index({ post: 1, parent: 1, createdAt: -1 });
CommentSchema.index({ post: 1, status: 1, createdAt: -1 });
CommentSchema.index({ author: 1, createdAt: -1 });

export const CommentModel: Model<Comment> =
  mongoose.models.Comment || mongoose.model<Comment>("Comment", CommentSchema);
