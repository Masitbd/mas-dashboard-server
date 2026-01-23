// category.controller.ts
import { RequestHandler, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import status from "http-status";

import { ICategory } from "./category.interface";
import { CategoryService } from "./cateogry.services";

const createCategory: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CategoryService.createCategory(
      req.body as Partial<ICategory>,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Category created successfully!",
      data: result,
    });
  },
);

const getCategoryById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await CategoryService.findCategoryById(id as string);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Category fetched successfully!",
      data: result,
    });
  },
);

const getAllCategories: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { page, limit, searchTerm, sort } = req.query;

    const result = await CategoryService.findAllCategories({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      q: searchTerm ? String(searchTerm) : undefined,
      sort: sort ? (String(sort) as any) : undefined,
    });

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Categories fetched successfully!",
      data: result,
    });
  },
);

const updateCategoryById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await CategoryService.updateCategoryById(
      id as string,
      req.body as Partial<ICategory>,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Category updated successfully!",
      data: result,
    });
  },
);

const deleteCategoryById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await CategoryService.deleteCategoryById(id as string);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Category deleted successfully!",
      data: result,
    });
  },
);

export const CategoryController = {
  createCategory,
  getCategoryById,
  getAllCategories,
  updateCategoryById,
  deleteCategoryById,
};
