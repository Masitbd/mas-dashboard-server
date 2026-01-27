import { Types } from "mongoose";

export interface Post {
  id: string;
  slug: string;

  title: string;
  excerpt: string;
  content: string;

  coverImage?: string;

  category: Types.ObjectId;
  tags: Types.ObjectId[];

  author: Types.ObjectId;

  readingTime?: string;

  createdAt: string; // ISO
  updatedAt: string; // ISO
  publishedAt?: string; // ISO
  status: "draft" | "published" | "archived";
}
