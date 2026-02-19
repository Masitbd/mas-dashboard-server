# MAS Dashboard Server API

Backend API for the MAS Dashboard blog/admin system.

## Base URL

- Local: `http://localhost:<PORT>/api/v1`
- Health check: `GET /health-check`

## Auth and Roles

### Authorization header format

Use the access token directly in `Authorization` header:

```http
Authorization: <accessToken>
```

Do not prepend `Bearer` for this backend.

### Roles used by API

- `super-admin`
- `admin`
- `editor`
- `author`
- `reader`

## Response Format

### Success

```ts
type ApiSuccess<T> = {
  statusCode: number;
  success: true;
  message: string | null;
  meta?: {
    page: number;
    limit: number;
    total: number;
  } | null;
  data: T | null;
};
```

Note: most list endpoints return pagination inside `data.meta` (not top-level `meta`).

### Error

```ts
type ApiError = {
  success: false;
  message: string;
  errorSources: Array<{ path: string; message: string }>;
  err?: unknown;
  stack?: string | null;
};
```

## Core Data Types (Frontend)

```ts
export type UserRole = "admin" | "editor" | "author" | "reader";
export type UserPermission = UserRole | "super-admin";
export type UserStatus = "active" | "disabled";

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
};

export type User = {
  _id: string;
  uuid: string;
  email: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserProfile = {
  _id?: string;
  uuid: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  websiteUrl?: string | null;
  location?: string | null;
  twitterUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Category = {
  id?: string;
  _id?: string;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Tag = {
  id?: string;
  _id?: string;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PostStatus = "draft" | "published" | "archived";
export type PostPlacement = "general" | "featured" | "popular";

export type Post = {
  id?: string;
  _id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string | Category;
  tags: Array<string | Tag>;
  author: string | UserProfile;
  readingTime: string;
  status: PostStatus;
  placement?: PostPlacement;
  createdAt: string;
  updatedAt: string;
};

export type CommentStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "spam"
  | "deleted";

export type Comment = {
  id?: string;
  _id?: string;
  post: string;
  author: string | UserProfile;
  parent?: string | null;
  content: string;
  status: CommentStatus;
  editedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  repliesCount?: number;
};

export type AssetProvider = "cloudinary" | "s3" | "r2" | "local";
export type AssetStatus = "active" | "orphaned" | "pending_delete" | "deleted";

export type Asset = {
  id?: string;
  _id?: string;
  url: string;
  provider: AssetProvider;
  key: string;
  owner: string;
  status: AssetStatus;
  refCount: number;
  usedBy: Array<{ kind: "post" | "profile" | "category" | "comment"; refId: string; field: string }>;
  mimeType?: string;
  size?: number;
  width?: number;
  height?: number;
  format?: string;
  originalName?: string;
  orphanedAt?: string | null;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Contact = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  updatedAt: string;
};

export type NewsletterSubscriber = {
  id?: string;
  _id?: string;
  email: string;
  subscribed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedResult<T> = {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
    pages?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
  data: T[];
};
```

## API Endpoints

All paths below are relative to `/api/v1`.

### Auth

1. `POST /auth/login` (Public)
Request:
```json
{ "email": "user@example.com", "password": "password123" }
```
Response data:
```ts
{ accessToken: string; refreshToken: string }
```

2. `POST /auth/refresh-token` (Public)
- Send refresh token in `Authorization` header.
Response data:
```ts
{ accessToken: string }
```

3. `PATCH /auth/change-password` (Authenticated)
Request:
```json
{ "oldPassword": "oldPass", "newPassword": "newPass123" }
```
Response data: `string`

### User

1. `POST /user/sign-up` (Public)
Request:
```json
{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "password123"
}
```

2. `GET /user/all-users` (Admin, Super Admin)
Query:
- `page`, `limit`
- `searchTerm`
- `sort` (`createdAt | updatedAt | username | lastLoginAt`)
- `sortOrder` (`asc | desc`)
- `role`
- `status`
- `emailVerified` or `emailVarified`
Response data: `PaginatedResult<User & { displayName?: string }>`

3. `GET /user/admin/:uuid` (Admin, Super Admin)
Response data:
```ts
{ user: User | null; profile: UserProfile | null }
```

4. `PATCH /user/change-status/:uuid` (Admin, Super Admin)
Request:
```json
{ "status": "active" }
```

5. `PATCH /user/change-password-admin/:uuid` (Admin, Super Admin)
Request:
```json
{ "password": "newPassword123" }
```

### Profile

1. `POST /profile` (Admin, Super Admin)
Request:
```json
{
  "uuid": "user-uuid",
  "displayName": "John Doe",
  "avatarUrl": null,
  "bio": null,
  "websiteUrl": null,
  "location": null,
  "twitterUrl": null,
  "githubUrl": null,
  "linkedinUrl": null
}
```

2. `GET /profile` (Admin, Super Admin)
Query:
- `page`, `limit`
- `searchTerm`
- `field` (exact location filter)
- `hasAvatar` (`true|false`)
- `sort` (`newest | oldest | nameAsc | nameDesc`)
Response data: `PaginatedResult<UserProfile>`

3. `GET /profile/me` (Authenticated)
4. `PATCH /profile/me` (Authenticated)
5. `GET /profile/:uuid` (Admin, Super Admin)
6. `PATCH /profile/:uuid` (Admin, Super Admin)
7. `DELETE /profile/:uuid` (Admin, Super Admin)

### Categories

1. `POST /categories` (Admin, Super Admin)
Request:
```json
{ "name": "Technology", "description": "Tech related posts" }
```

2. `GET /categories` (Public)
Query:
- `page`, `limit`
- `searchTerm`
- `sort` (`newest | oldest | nameAsc | nameDesc`)
Response data: `PaginatedResult<Category>`

3. `GET /categories/:id` (Admin, Super Admin)
4. `PATCH /categories/:id` (Admin, Super Admin)
5. `DELETE /categories/:id` (Admin, Super Admin)

### Tags

1. `POST /tags` (Admin, Super Admin)
2. `GET /tags` (Public)
Query:
- `page`, `limit`
- `searchTerm`
- `sort` (`newest | oldest | nameAsc | nameDesc`)
Response data: `PaginatedResult<Tag>`
3. `GET /tags/:id` (Public)
4. `PATCH /tags/:id` (Admin, Super Admin)
5. `DELETE /tags/:id` (Admin, Super Admin)

### Posts

1. `POST /posts` (Admin, Super Admin, Editor, Author)
Request:
```json
{
  "title": "Post title",
  "excerpt": "Short summary",
  "content": "Long content...",
  "coverImage": "https://...",
  "category": "64f....",
  "tagIds": ["64f...."]
}
```

2. `GET /posts` (Public)
Query:
- `page`, `limit`
- `searchTerm`
- `category`, `author`, `tag`
- `placement` (`general | featured | popular`)
- `status` (`draft | published | archived`)
- `sort` (`createdAt | updatedAt | title`)
- `sortOrder` (`asc | desc`)
- `populate` (`true` for default population)
Response data: `PaginatedResult<Post>`

3. `GET /posts/slug/:slug` (Public)
4. `GET /posts/:id` (Admin, Super Admin)
5. `PATCH /posts/:id` (Admin, Super Admin)
6. `DELETE /posts/:id` (Admin, Super Admin)

7. `POST /posts/:id/tags` (Admin, Super Admin)
Request:
```json
{ "tagIds": ["64f....", "64a...."] }
```

8. `DELETE /posts/:id/tags` (Admin, Super Admin)
Request:
```json
{ "tagIds": ["64f...."] }
```

9. `PATCH /posts/change-status/test/:id` (Admin, Super Admin, Author)
Request:
```json
{ "status": "published" }
```

10. `PATCH /posts/change-placement/old/:id` (Admin, Super Admin)
Request:
```json
{ "placement": "featured" }
```

11. `GET /posts/top-categories/new` (Public)
Response data:
```ts
Array<Category & { postCount: number }>
```

12. `GET /posts/top-tags/new` (Public)
Response data:
```ts
Array<Tag & { postCount: number }>
```

### Comments

1. `POST /comment` (Authenticated)
Request:
```json
{
  "postId": "64f....",
  "content": "Nice article!",
  "parentCommentId": null
}
```

2. `GET /comment/post/:postId` (Public)
Query:
- `page`, `limit`
- `includeReplies` (`true|false`)
- `sortOrder` (`asc|desc`)
- `status` (`pending|approved|rejected|spam|deleted|all`) - only effective for staff

3. `PATCH /comment/moderate/:id` (Admin, Super Admin, Editor)
Request:
```json
{ "status": "approved" }
```

4. `GET /comment/:id` (Admin, Super Admin)
5. `PATCH /comment/:id` (Authenticated owner/staff)
6. `DELETE /comment/:id` (Authenticated owner/staff)

### Assets

1. `POST /assets/upload` (Authenticated)
- Content type: `multipart/form-data`
- Field name: `file` (image only)
Response data: `Asset`

2. `PATCH /assets/:id/replace` (Authenticated)
- Content type: `multipart/form-data`
- Field name: `file`
Response data: `Asset`

3. `DELETE /assets/:id` (Authenticated)
Response data: `Asset`

4. `DELETE /assets/by-url` (Authenticated)
Request:
```json
{ "url": "https://res.cloudinary.com/.../image/upload/.../abc.png" }
```
Response data: `Asset`

### Contact

1. `POST /contact` (Public)
Request:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Support Request",
  "message": "I need help with..."
}
```
Response data: `Contact`

2. `GET /contact` (Admin, Super Admin)
Query:
- `page`, `limit`
- `searchTerm`
- filters: `name`, `email`, `subject`
- `sort` (`newest | oldest | nameAsc | nameDesc`)
Response data: `PaginatedResult<Contact>`

3. `GET /contact/:id` (Admin, Super Admin)
Response data: `Contact`

### Newsletter Subscriber

1. `POST /newsletter-subscriber` (Public)
Request:
```json
{
  "email": "john@example.com",
  "subscribed": true
}
```
Response data: `NewsletterSubscriber`

2. `GET /newsletter-subscriber` (Admin, Super Admin)
Query:
- `page`, `limit`
- `searchTerm`
- filters: `email`, `subscribed` (`true|false`)
- `sort` (`newest | oldest | emailAsc | emailDesc`)
Response data: `PaginatedResult<NewsletterSubscriber>`

3. `GET /newsletter-subscriber/:id` (Admin, Super Admin)
Response data: `NewsletterSubscriber`

## Frontend Integration Notes

1. Send `Authorization` header with raw JWT access token.
2. For list APIs, expect pagination metadata inside `response.data.meta`.
3. Use `searchTerm` for search in frontend requests.
4. For file upload endpoints, send `multipart/form-data` with key `file`.

## Run Locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run start
```
