// category.controller.ts
import { RequestHandler, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import status from "http-status";

import { ITag } from "./tags.interface";
import { TagService } from "./tags.services";

const createTag: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await TagService.createTag(req.body as Partial<ITag>);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Tag created successfully!",
      data: result,
    });
  },
);

const getTagById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await TagService.findTagById(id as string);
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Tag fetched successfully!",
      data: result,
    });
  },
);

const getAllTags: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { page, limit, searchTerm, sort } = req.query;

    const result = await TagService.findAllTags({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      q: searchTerm ? String(searchTerm) : undefined,
      sort: sort ? (String(sort) as any) : undefined,
    });

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Tags fetched successfully!",
      data: result,
    });
  },
);

const updateTagById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await TagService.updateTagById(
      id as string,
      req.body as Partial<ITag>,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Tag updated successfully!",
      data: result,
    });
  },
);

const deleteTagById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await TagService.deleteTagById(id as string);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Tag deleted successfully!",
      data: result,
    });
  },
);

export const TagController = {
  createTag,
  getTagById,
  getAllTags,
  updateTagById,
  deleteTagById,
};
