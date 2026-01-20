export type UserRole = "admin" | "editor" | "author" | "reader";
export type UserStatus = "active" | "disabled";
export type IUser = {
  _id: string; // DB primary key (UUID/BIGINT/etc.)
  uuid: string; // stable public identifier

  email: string;
  username: string;
  password: string;

  role: UserRole;
  status: UserStatus;

  emailVerifiedAt: Date | null;
  lastLoginAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
};
