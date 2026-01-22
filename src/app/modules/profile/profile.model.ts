import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

export interface IUserProfile {
  uuid: string; // stable public identifier
  displayName: string;

  avatarUrl?: string | null;
  bio?: string | null;

  websiteUrl?: string | null;
  location?: string | null;

  twitterUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
}

const UserProfileSchema = new Schema<IUserProfile>(
  {
    uuid: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    displayName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 80,
    },

    avatarUrl: { type: String, default: null, trim: true },
    bio: { type: String, default: null, trim: true, maxlength: 500 },

    websiteUrl: { type: String, default: null, trim: true },
    location: { type: String, default: null, trim: true, maxlength: 120 },

    twitterUrl: { type: String, default: null, trim: true },
    githubUrl: { type: String, default: null, trim: true },
    linkedinUrl: { type: String, default: null, trim: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type UserProfileDocument = InferSchemaType<typeof UserProfileSchema>;

export const UserProfileModel: Model<UserProfileDocument> =
  mongoose.models.UserProfile ||
  mongoose.model<UserProfileDocument>("UserProfile", UserProfileSchema);
