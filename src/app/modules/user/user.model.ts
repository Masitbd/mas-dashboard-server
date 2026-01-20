import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "./user.interface";

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "editor", "author", "reader"],
      default: "reader",
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "disabled"],
      default: "active",
      index: true,
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    uuid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  { timestamps: true },
);

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
