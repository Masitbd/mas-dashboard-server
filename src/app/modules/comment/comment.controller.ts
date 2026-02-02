import { RequestHandler, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import status from "http-status";

import { CommentService } from "./comment.service";
import { IUser } from "../user/user.interface";

const createComment: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CommentService.createComment(
      req.body,
      { populate: true },
      req.user as IUser,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Comment created successfully!",
      data: result,
    });
  },
);

const getCommentById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await CommentService.getCommentById(id as string, {
      populate: true,
    });

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Comment fetched successfully!",
      data: result,
    });
  },
);

const listCommentsByPost: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { postId } = req.params;
    const {
      page,
      limit,
      includeReplies,
      sortOrder,
      status: qStatus,
    } = req.query;

    const result = await CommentService.listCommentsByPost(
      postId as string,
      {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        includeReplies: includeReplies === "true",
        sortOrder: (sortOrder as any) ?? undefined,
        status: (qStatus as any) ?? undefined,
      },
      req.user as IUser, // optional; allows staff to query non-approved
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Comments fetched successfully!",
      data: result,
    });
  },
);

const updateCommentById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await CommentService.updateCommentById(
      id as string,
      req.body,
      req.user as IUser,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Comment updated successfully!",
      data: result,
    });
  },
);

const deleteCommentById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await CommentService.deleteCommentById(
      id as string,
      req.user as IUser,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Comment deleted successfully!",
      data: result,
    });
  },
);

const moderateComment: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await CommentService.moderateComment(
      id as string,
      req.body,
      req.user as IUser,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Comment status updated successfully!",
      data: result,
    });
  },
);

export const CommentController = {
  createComment,
  getCommentById,
  listCommentsByPost,
  updateCommentById,
  deleteCommentById,
  moderateComment,
};
