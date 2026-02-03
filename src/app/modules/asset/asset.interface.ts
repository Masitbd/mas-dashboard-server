import { Types } from "mongoose";

export type AssetProvider = "cloudinary" | "s3" | "r2" | "local";
export type AssetStatus = "active" | "orphaned" | "pending_delete" | "deleted";
export type AssetRefKind = "post" | "profile" | "category" | "comment";

export interface IAssetUseRef {
  kind: AssetRefKind;
  refId: Types.ObjectId; // points to any collection (post/profile/etc)
  field: string; // "coverImage" | "avatar" | "contentImage" etc.
}

export interface IAsset {
  // virtual
  id?: string;

  url: string; // serve url (usually secure_url)
  provider: AssetProvider;

  /**
   * Cloudinary: public_id
   * S3/R2: object key
   * Local: file path
   */
  key: string;

  owner: Types.ObjectId; // ref: User
  status: AssetStatus;

  // tracking (internal/admin)
  refCount: number;
  usedBy: IAssetUseRef[];

  // optional metadata
  mimeType?: string;
  size?: number; // bytes
  width?: number;
  height?: number;
  format?: string; // jpg/png/webp
  originalName?: string;

  orphanedAt?: Date | null;
  deletedAt?: Date | null;

  createdAt?: Date;
  updatedAt?: Date;
}
