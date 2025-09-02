## Server (Apps / Server)

Minimal Express + Mongoose API packaged for a Turborepo monorepo.

### Prerequisites

- Node.js 18+
- MongoDB connection string

### Environment

Create a `.env` file in `apps/server` with:

```
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/college
CLIENT_URL=http://localhost:5173

ACCESS_TOKEN_SECRET=change_me
REFRESH_TOKEN_SECRET=change_me
ACCESS_TOKEN_EXPIRY=900
REFRESH_TOKEN_EXPIRY=2592000

CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret

SUPER_ADMIN_SECRET=change_me
SUPER_ADMIN_USERNAME=admin
SUPER_ADMIN_PASSWORD=admin
SUPER_ADMIN_AUTH_TOKEN=change_me
SUPER_ADMIN_SESSION_SECRET=change_me
```

### Install

From monorepo root:

```bash
pnpm install # or npm install / yarn install
```

### Run

- Dev (watch):

```bash
pnpm --filter server dev
```

- Build:

```bash
pnpm --filter server build
```

- Start (after build):

```bash
pnpm --filter server start
```

### API Base URL

`/api/v1`

### Routes

- Super Admin: `/api/v1/super-admin`
- Admin access: `/api/v1/admin-access` (requires Admin role)
- User: `/api/v1/user`
- Student: `/api/v1/student`
- Others: `/api/v1/others`

### Structure

```
apps/server/
  src/
    constants/      # cookies, cors
    controllers/    # route handlers
    db/             # database connection
    helpers/        # bcrypt, jwt, model utilities
    libs/           # cloudinary
    middlewares/    # auth, error, multer
    models/         # mongoose models
    routes/         # express routers
    schemas/        # zod validation
    types/          # shared types and request augments
    utils/          # async handler, responses
    index.ts        # app entry
```

### Notes

- Cookies carry access/refresh tokens; CORS uses `CLIENT_URL`.
- Admin-only endpoints are protected by role and fine-grained access checks.

---

## API Documentation

This section documents all available endpoints, auth requirements, request/response shapes, and query parameters. All responses follow a common shape:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "...",
  "data": { ... }
}
```

Errors use the same shape with `success: false` and an appropriate `statusCode`.

### Authentication & Authorization

- Session cookies: `access-token` and `refresh-token` are set on successful login.
- Most routes require `checkUser` (authenticated user). Some require additional role/access checks:
  - `checkRole(UserRole.ADMIN)` for admin-scoped mounts.
  - `checkAdminAccess(AdminAccess.X)` for fine-grained admin capabilities.

---

## User

Base: `/api/v1/user`

- POST `/login`
  - Body: `{ secretId: string, password: string }`
  - Sets cookies and returns tokens.
- POST `/logout` (auth)
- GET `/me` (auth)
- PUT `/update-profile-image` (auth, multipart)
  - Form field `profileImage`: file

## Super Admin

Base: `/api/v1/super-admin`

- POST `/login`
  - Body: `{ username, password, secretKey }`
  - Returns bearer token for super-admin operations (checked via `checkSuperAdmin`).
- GET `/admin` (super-admin)
  - Query: `page?, limit?, onlyActive?`
- POST `/admin` (super-admin)
  - Body: `{ name, secretId, dateOfBirth, gender, phoneNumber, address, bloodGroup, adminAccess[] }`
- GET `/admin/:adminId` (super-admin)
- PUT `/admin/:adminId` (super-admin)
- PATCH `/admin/:adminId` (super-admin) toggle activity
- PATCH `/admin/:adminId/reset-password` (super-admin)

## Admin Access

Base: `/api/v1/admin-access` (route is mounted under `checkRole(UserRole.ADMIN)` and individual endpoints are guarded by `checkAdminAccess`):

### Students
- GET `/student` (AdminAccess.STUDENT_ACCESS)
  - Query: `{ department, batch, page, limit }`
- POST `/student` (AdminAccess.STUDENT_ACCESS)
  - Body: `{ name, secretId, dateOfBirth, gender, phoneNumber, address, bloodGroup, batch, department }`
- GET `/student/:studentId` (AdminAccess.STUDENT_ACCESS)
- PUT `/student/:studentId` (AdminAccess.STUDENT_ACCESS)
- PATCH `/student/:studentId` (AdminAccess.STUDENT_ACCESS) toggle student active status

### Batches
- GET `/batch` (AdminAccess.BATCH_ACCESS)
  - Query: `{ includeCompletedBatches, department, page, limit }`
- GET `/batch/:batchId` (AdminAccess.BATCH_ACCESS)
- POST `/batch` (AdminAccess.BATCH_ACCESS)
  - Body: `{ name, startingYear, currentSemester }`
- PUT `/batch/:batchId` (AdminAccess.BATCH_ACCESS)
- PUT `/batch/promote/:batchId` (AdminAccess.BATCH_ACCESS)
- PUT `/batch/complete/:batchId` (AdminAccess.BATCH_ACCESS)

### Teachers
- GET `/teacher` (AdminAccess.TEACHER_ACCESS)
  - Query: `{ page?, limit?, onlyActive? }`
- POST `/teacher` (AdminAccess.TEACHER_ACCESS)
  - Body: `{ name, secretId, dateOfBirth, gender, phoneNumber, address, bloodGroup, email }`
- GET `/teacher/:teacherId` (AdminAccess.TEACHER_ACCESS)
- PUT `/teacher/:teacherId` (AdminAccess.TEACHER_ACCESS)
- PATCH `/teacher/:teacherId` (AdminAccess.TEACHER_ACCESS) toggle activity

### Subjects
- GET `/subject` (AdminAccess.SUBJECT_ACCESS)
  - Query: `{ department, semester?, page?, limit? }`
- POST `/subject` (AdminAccess.SUBJECT_ACCESS)
- GET `/subject/:subjectId` (AdminAccess.SUBJECT_ACCESS)
- PUT `/subject/:subjectId` (AdminAccess.SUBJECT_ACCESS)

### Assignments
- GET `/assignment` (AdminAccess.ASSIGNMENT_MONITOR_ACCESS)
  - Query: `{ batch?, subject?, page?, limit? }`
- POST `/assignment` (AdminAccess.ASSIGNMENT_MONITOR_ACCESS)
- GET `/assignment/:assignmentId` (AdminAccess.ASSIGNMENT_MONITOR_ACCESS)
- PUT `/assignment/:assignmentId` (AdminAccess.ASSIGNMENT_MONITOR_ACCESS)
- GET `/assignment/:assignmentId/submissions` (AdminAccess.ASSIGNMENT_MONITOR_ACCESS)
  - Query: `{ page?, limit? }`
- PATCH `/assignment/submission/:submissionId` (AdminAccess.ASSIGNMENT_MONITOR_ACCESS)
  - Body: `{ marksObtained: number, read?: boolean }` — grade and/or mark as read

### Materials
- GET `/material` (AdminAccess.SUBJECT_ACCESS)
  - Query: `{ batch?, subject?, page?, limit? }`
- POST `/material` (AdminAccess.SUBJECT_ACCESS)
- GET `/material/:materialId` (AdminAccess.SUBJECT_ACCESS)
- PUT `/material/:materialId` (AdminAccess.SUBJECT_ACCESS)

### Routines
- GET `/routine` (AdminAccess.ROUTINE_ACCESS)
  - Query: `{ batch?, subject?, day?, page?, limit? }`
- POST `/routine` (AdminAccess.ROUTINE_ACCESS)
- GET `/routine/:routineId` (AdminAccess.ROUTINE_ACCESS)
- PUT `/routine/:routineId` (AdminAccess.ROUTINE_ACCESS)

### Results
- GET `/result` (AdminAccess.RESULT_ACCESS)
  - Query: `{ subject?, student?, page?, limit? }`
- POST `/result` (AdminAccess.RESULT_ACCESS)
- GET `/result/:resultId` (AdminAccess.RESULT_ACCESS)
- PUT `/result/:resultId` (AdminAccess.RESULT_ACCESS)

### Notices
- GET `/notice` (AdminAccess.NOTICE_ACCESS)
  - Query: `{ department?, semester?, page?, limit? }`
- POST `/notice` (AdminAccess.NOTICE_ACCESS)
- GET `/notice/:noticeId` (AdminAccess.NOTICE_ACCESS)
- PUT `/notice/:noticeId` (AdminAccess.NOTICE_ACCESS)

## Student

Base: `/api/v1/student` (requires `checkUser` and `checkRole([STUDENT, ADMIN])`)

### Academic Details
- GET `/academic-details`

### Batch Details
- GET `/batch-details`

### Materials
- GET `/materials`
  - Query: `{ batch, subject, page?, limit? }`

### Assignment Submissions
- GET `/submissions`
  - Query: `{ assignment?, page?, limit? }`
- POST `/submit-assignment` (multipart)
  - Form fields:
    - `file`: file (assignment file)
    - `assignment`: string (assignment id)

## Others

Base: `/api/v1/others`

- POST `/getstudentscountdata` (auth)
  - Body: none
  - Returns aggregated counts (see controller implementation).

---

## Pagination

For endpoints that accept `page` and `limit`, responses return `total*` counters alongside the item arrays. Pagination is 1-based; `skip = (page - 1) * limit`.

## File Uploads

- Profile image: single file under field `profileImage`, up to ~5MB.
- Assignment submission: single file under field `file`, up to ~25MB.

## Common Enums

Most body/query validations are enforced with Zod schemas that mirror enums in `types/types.ts` (e.g., `Department`, `Semester`, `UserRole`, `AdminAccess`). Refer to those for allowed values.
