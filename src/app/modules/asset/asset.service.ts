import { Readable } from "stream";
import { v2 as cloudinary } from "cloudinary";
import { Types } from "mongoose";
import { AssetModel } from "./asset.model";
import { IAsset } from "./asset.interface";
import { IUser } from "../user/user.interface";

type UploadResult = {
  public_id: string;
  secure_url: string;
  url?: string;
  bytes?: number;
  width?: number;
  height?: number;
  format?: string;
  original_filename?: string;
};

function ensureCloudinaryConfigured() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      "Cloudinary env missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET",
    );
  }

  cloudinary.config({ cloud_name, api_key, api_secret });
}

function toObjectId(id: string | Types.ObjectId) {
  return typeof id === "string" ? new Types.ObjectId(id) : id;
}

function canManageAsset(user: IUser, asset: IAsset) {
  const role = (user as any)?.role;
  const isPrivileged = role === "admin" || role === "editor";
  if (isPrivileged) return true;

  return String(asset.owner) === String((user as any)?._id);
}

async function uploadBufferToCloudinary(
  file: Express.Multer.File,
  opts?: { folder?: string },
): Promise<UploadResult> {
  ensureCloudinaryConfigured();

  const folder = opts?.folder ?? "mas-blog/assets";

  const result = await new Promise<UploadResult>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        overwrite: false,
      },
      (error, uploadRes) => {
        if (error) return reject(error);
        if (!uploadRes) return reject(new Error("Cloudinary upload failed"));
        resolve(uploadRes as unknown as UploadResult);
      },
    );

    Readable.from(file.buffer).pipe(stream);
  });

  return result;
}

async function destroyFromCloudinary(publicId: string) {
  ensureCloudinaryConfigured();
  // resource_type defaults to "image" for destroy, explicit is okay too
  return cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

// -----------------------------
// Services
// -----------------------------

export async function uploadImage(
  file: Express.Multer.File,
  user: IUser,
): Promise<IAsset> {
  if (!file?.buffer?.length) throw new Error("Empty file upload");

  const upload = await uploadBufferToCloudinary(file);

  const asset = await AssetModel.create({
    url: upload.secure_url,
    provider: "cloudinary",
    key: upload.public_id,
    owner: toObjectId((user as any)?._id),

    status: "active",
    refCount: 0,
    usedBy: [],

    mimeType: file.mimetype,
    size: upload.bytes ?? file.size,
    width: upload.width,
    height: upload.height,
    format: upload.format,
    originalName: file.originalname ?? upload.original_filename,
  });

  return asset.toObject();
}

/**
 * Replace the underlying Cloudinary file for an existing asset.
 * - uploads new file
 * - updates asset doc
 * - destroys old publicId (destroy)
 */
export async function replaceImage(
  assetId: string,
  file: Express.Multer.File,
  user: IUser,
) {
  if (!file?.buffer?.length) throw new Error("Empty file upload");

  const asset = await AssetModel.findById(assetId);
  if (!asset) throw new Error("Asset not found");

  if (!canManageAsset(user, asset)) throw new Error("Not allowed");

  // 1) upload new first (safer)
  const uploaded = await uploadBufferToCloudinary(file);

  const oldKey = asset.key;

  // 2) update db
  asset.url = uploaded.secure_url;
  asset.key = uploaded.public_id;

  asset.mimeType = file.mimetype;
  asset.size = uploaded.bytes ?? file.size;
  asset.width = uploaded.width;
  asset.height = uploaded.height;
  asset.format = uploaded.format;
  asset.originalName = file.originalname ?? uploaded.original_filename;

  asset.status = "active";
  asset.deletedAt = null;
  asset.orphanedAt = null;

  await asset.save();

  // 3) destroy old in cloudinary
  // (If this fails, we keep the db consistent and can retry cleanup later)
  try {
    if (oldKey) await destroyFromCloudinary(oldKey);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("Cloudinary destroy failed for oldKey:", oldKey, e);
  }

  return asset.toObject();
}

/**
 * Delete an asset (hard delete in Cloudinary + mark as deleted in DB).
 * If refCount > 0, we block deletion to prevent broken references.
 */
export async function deleteAsset(assetId: string, user: IUser) {
  const asset = await AssetModel.findById(assetId);
  if (!asset) throw new Error("Asset not found");

  if (!canManageAsset(user, asset)) throw new Error("Not allowed");

  if (asset.refCount > 0) {
    throw new Error(
      `Asset is still used in ${asset.refCount} place(s). Detach first.`,
    );
  }

  asset.status = "pending_delete";
  await asset.save();

  // destroy from Cloudinary
  await destroyFromCloudinary(asset.key);

  asset.status = "deleted";
  asset.deletedAt = new Date();
  await asset.save();

  return asset.toObject();
}

function extractCloudinaryPublicIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const path = u.pathname; // /<cloud_name>/image/upload/.../file.ext

    const uploadMarker = "/upload/";
    const idx = path.indexOf(uploadMarker);
    if (idx === -1) return null;

    const afterUpload = path.slice(idx + uploadMarker.length); // transform?/v123?/publicId.ext
    const parts = afterUpload.split("/").filter(Boolean);

    // find version segment like "v123456"
    const vIndex = parts.findIndex((p) => /^v\d+$/.test(p));
    const publicParts = vIndex >= 0 ? parts.slice(vIndex + 1) : parts;

    if (!publicParts.length) return null;

    const joined = publicParts.join("/"); // "mas-blog/assets/abc.png"
    const lastDot = joined.lastIndexOf(".");
    if (lastDot === -1) return joined;

    return joined.slice(0, lastDot); // "mas-blog/assets/abc"
  } catch {
    return null;
  }
}

/**
 * Delete asset by URL (standalone system use-case)
 * - extracts public_id from url
 * - finds asset doc by key(public_id)
 * - checks permission + refCount
 * - destroys from Cloudinary
 * - marks doc deleted
 */
export async function deleteAssetByUrl(url: string, user: IUser) {
  if (!url) throw new Error("url is required");

  const publicId = extractCloudinaryPublicIdFromUrl(url);
  if (!publicId)
    throw new Error("Invalid Cloudinary URL (cannot extract public_id)");

  const asset = await AssetModel.findOne({ key: publicId });
  if (!asset) throw new Error("Asset not found for this URL");

  if (!canManageAsset(user, asset)) throw new Error("Not allowed");

  // Safety: prevent breaking references if you later start tracking usage
  if (asset.refCount > 0) {
    throw new Error(
      `Asset is still used in ${asset.refCount} place(s). Detach first.`,
    );
  }

  asset.status = "pending_delete";
  await asset.save();

  await destroyFromCloudinary(asset.key);

  asset.status = "deleted";
  asset.deletedAt = new Date();
  await asset.save();

  return asset.toObject();
}
export const AssetService = {
  uploadImage,
  replaceImage,
  deleteAsset,
  deleteAssetByUrl,
};
