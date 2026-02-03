import { Router } from "express";
import multer from "multer";
import auth from "../../middleware/auth";
import { ENUM_USER_PERMISSION } from "../../enums/enumUserPermission";
import { AssetController } from "./asset.controller";

const routes = Router();

// Multer (memory storage -> req.file.buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB (adjust as you like)
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype?.startsWith("image/")) return cb(null, true);
    cb(new Error("Only image files are allowed"));
  },
});

routes.delete(
  "/by-url",
  auth(
    ENUM_USER_PERMISSION.ADMIN,
    ENUM_USER_PERMISSION.SUPER_ADMIN,
    ENUM_USER_PERMISSION.EDITOR,
    ENUM_USER_PERMISSION.AUTHOR,
    ENUM_USER_PERMISSION.READER,
  ),
  AssetController.deleteAssetByUrl,
);

// Upload new image -> creates new Asset doc
routes.post(
  "/upload",
  auth(
    ENUM_USER_PERMISSION.ADMIN,
    ENUM_USER_PERMISSION.SUPER_ADMIN,
    ENUM_USER_PERMISSION.EDITOR,
    ENUM_USER_PERMISSION.AUTHOR,
    ENUM_USER_PERMISSION.READER,
  ),
  upload.single("file"),
  AssetController.uploadAsset,
);

// Replace existing asset image -> destroys old cloudinary image
routes.patch(
  "/:id/replace",
  auth(
    ENUM_USER_PERMISSION.ADMIN,
    ENUM_USER_PERMISSION.SUPER_ADMIN,
    ENUM_USER_PERMISSION.EDITOR,
    ENUM_USER_PERMISSION.AUTHOR,
    ENUM_USER_PERMISSION.READER,
  ),
  upload.single("file"),
  AssetController.replaceAsset,
);

// Delete asset -> destroys in cloudinary (only if refCount=0)
routes.delete(
  "/:id",
  auth(
    ENUM_USER_PERMISSION.ADMIN,
    ENUM_USER_PERMISSION.SUPER_ADMIN,
    ENUM_USER_PERMISSION.EDITOR,
    ENUM_USER_PERMISSION.AUTHOR,
    ENUM_USER_PERMISSION.READER,
  ),
  AssetController.deleteAsset,
);

export const AssetRoute = routes;
