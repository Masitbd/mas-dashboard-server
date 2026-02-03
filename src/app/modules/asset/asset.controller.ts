import { Request, Response, RequestHandler } from "express";
import status from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AssetService } from "./asset.service";
import { IUser } from "../user/user.interface";

const uploadAsset: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const file = req.file;

    if (!file) {
      throw new Error(
        'No file found. Send multipart/form-data field name "file"',
      );
    }

    const result = await AssetService.uploadImage(file, req.user as IUser);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Image uploaded successfully!",
      data: result,
    });
  },
);

const replaceAsset: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      throw new Error(
        'No file found. Send multipart/form-data field name "file"',
      );
    }

    const result = await AssetService.replaceImage(
      id as string,
      file,
      req.user as IUser,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Image replaced successfully!",
      data: result,
    });
  },
);

const deleteAsset: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await AssetService.deleteAsset(
      id as string,
      req.user as IUser,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Image deleted successfully!",
      data: result,
    });
  },
);
const deleteAssetByUrl: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { url } = req.body;

    const result = await AssetService.deleteAssetByUrl(url, req.user as IUser);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Image deleted successfully!",
      data: result,
    });
  },
);

export const AssetController = {
  uploadAsset,
  replaceAsset,
  deleteAsset,
  deleteAssetByUrl,
};
