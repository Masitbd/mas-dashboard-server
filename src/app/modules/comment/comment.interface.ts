import { Types } from "mongoose";

export type CommentStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "spam"
  | "deleted";

export interface Comment {
  id: string;

  post: Types.ObjectId; // ref: "Post"
  author: Types.ObjectId; // ref: "UserProfile" (or "User" if you prefer)

  parent?: Types.ObjectId | null; // ref: "Comment" for replies
  content: string;

  status: CommentStatus;

  editedAt?: string | null;

  createdAt: string; // ISO
  updatedAt: string; // ISO
}
