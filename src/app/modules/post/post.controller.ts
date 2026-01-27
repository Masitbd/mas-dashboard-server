// post.controller.ts
import { RequestHandler, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import status from "http-status";

import { Post as IPost } from "./post.interface";
import { PostService } from "./post.service";
import { IUser } from "../user/user.interface";

/**
 * POST /posts
 * body: { title, excerpt, content, coverImage, categoryId, tagIds?, authorId?, slug?, readingTime? }
 */
const createPost: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PostService.createPost(
      req.body,
      {},
      req.user as IUser,
    );

    sendResponse(res, {
      statusCode: status.OK, // you can use status.CREATED if you prefer
      success: true,
      message: "Post created successfully!",
      data: result,
    });
  },
);

/**
 * GET /posts/:id
 * query: populate=true (optional)
 */
const getPostById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { populate } = req.query;

    const result = await PostService.getPostById(id as string, {
      populate: (populate ? String(populate) : undefined) as unknown as boolean,
    });

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Post fetched successfully!",
      data: result,
    });
  },
);

/**
 * GET /posts/slug/:slug
 * query: populate=true (optional)
 */
const getPostBySlug: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { slug } = req.params;
    const { populate } = req.query;

    const result = await PostService.getPostBySlug(slug as string, {
      populate: (populate ? String(populate) : undefined) as unknown as boolean,
    });

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Post fetched successfully!",
      data: result,
    });
  },
);

/**
 * GET /posts
 * query: page, limit, searchTerm, sort, categoryId, authorId, tagId, populate
 * - searchTerm => text search
 * - sort example: "createdAt:desc" / "title:asc" (keep your service consistent)
 */
const getAllPosts: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const {
      page,
      limit,
      searchTerm,
      sort,
      categoryId,
      authorId,
      tagId,
      populate,
    } = req.query;

    const result = await PostService.listPosts({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: (searchTerm
        ? String(searchTerm)
        : undefined) as unknown as string,
      sortBy: sort ? (String(sort) as any) : undefined,

      categoryId: categoryId ? String(categoryId) : undefined,
      authorId: authorId ? String(authorId) : undefined,
      tagId: tagId ? String(tagId) : undefined,

      populate: (populate ? String(populate) : undefined) as unknown as boolean, // e.g. "true" or "author,category,tags"
    });

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Posts fetched successfully!",
      data: result,
    });
  },
);

/**
 * PATCH /posts/:id
 * body: any partial post fields
 */
const updatePostById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await PostService.updatePostById(
      id as string,
      req.body as Partial<IPost>,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Post updated successfully!",
      data: result,
    });
  },
);

/**
 * DELETE /posts/:id
 */
const deletePostById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await PostService.deletePostById(id as string);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Post deleted successfully!",
      data: result,
    });
  },
);

/**
 * POST /posts/:id/tags
 * body: { tagIds: string[] }
 * Adds tags to post (service should do $addToSet)
 */
const addTagsToPost: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { tagIds } = req.body as { tagIds?: string[] };

    const result = await PostService.addTagsToPost(id as string, tagIds ?? []);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Tags added to post successfully!",
      data: result,
    });
  },
);

/**
 * DELETE /posts/:id/tags
 * body: { tagIds: string[] }
 * Removes tags from post (service should do $pull)
 */
const removeTagsFromPost: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { tagIds } = req.body as { tagIds?: string[] };

    const result = await PostService.removeTagsFromPost(
      id as string,
      tagIds ?? [],
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Tags removed from post successfully!",
      data: result,
    });
  },
);

export const PostController = {
  createPost,
  getPostById,
  getPostBySlug,
  getAllPosts,
  updatePostById,
  deletePostById,
  addTagsToPost,
  removeTagsFromPost,
};
