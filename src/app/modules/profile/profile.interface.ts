export type IUserProfile = {
  _id: string; // DB primary key
  uuid: string; // stable public identifier

  displayName: string;

  avatarUrl: string | null;
  bio: string | null;

  websiteUrl: string | null;
  location: string | null;

  twitterUrl: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;

  createdAt: Date;
  updatedAt: Date;
};
