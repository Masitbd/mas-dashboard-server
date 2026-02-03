import mongoose, { Schema, type Model, type HydratedDocument } from "mongoose";
import { IAsset } from "./asset.interface";

export type AssetDocument = HydratedDocument<IAsset>;

const AssetUseRefSchema = new Schema(
  {
    kind: {
      type: String,
      required: true,
      enum: ["post", "profile", "category", "comment"],
    },
    refId: { type: Schema.Types.ObjectId, required: true },
    field: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const AssetSchema = new Schema<IAsset>(
  {
    url: { type: String, required: true, trim: true },

    provider: {
      type: String,
      required: true,
      enum: ["cloudinary", "s3", "r2", "local"],
      default: "cloudinary",
      index: true,
    },

    key: { type: String, required: true, trim: true, index: true }, // public_id

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      required: true,
      enum: ["active", "orphaned", "pending_delete", "deleted"],
      default: "active",
      index: true,
    },

    refCount: { type: Number, required: true, default: 0, index: true },
    usedBy: { type: [AssetUseRefSchema], default: [] },

    mimeType: { type: String, default: undefined },
    size: { type: Number, default: undefined },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    format: { type: String, default: undefined },
    originalName: { type: String, default: undefined },

    orphanedAt: { type: Date, default: null, index: true },
    deletedAt: { type: Date, default: null, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Useful indexes
AssetSchema.index({ owner: 1, createdAt: -1 });
AssetSchema.index({ status: 1, orphanedAt: 1 });

export const AssetModel: Model<IAsset> =
  mongoose.models.Asset || mongoose.model<IAsset>("Asset", AssetSchema);
