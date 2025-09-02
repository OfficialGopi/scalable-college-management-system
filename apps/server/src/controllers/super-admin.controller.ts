// Super Admin controller: privileged operations on admins using bearer token.
import { env } from "../env";
import { hashPassword } from "../helpers/bcrypt.helper";
import { signToken } from "../helpers/jwt.helper";
import { UserModel } from "../models/user.model";
import {
  adminIdSchema,
  createAdminSchema,
  superAdminLoginSchema,
  updateAdminSchema,
} from "../schemas/super-admin.schema";
import { UserRole } from "../types/types";
import { AsyncHandler } from "../utils/async-handler.util";
import { ApiError, ApiResponse } from "../utils/response-formatter.util";

// POST /super-admin/login
// Verifies static super-admin creds from env and issues a bearer token
const superAdminLogin = AsyncHandler(async (req, res) => {
  const { data, success } = superAdminLoginSchema.safeParse(req.body);

  if (!success) {
    throw new ApiError(400, "All Fields Are required");
  }

  if (
    data.username !== env.SUPER_ADMIN_USERNAME ||
    data.password !== env.SUPER_ADMIN_PASSWORD ||
    data.secretKey !== env.SUPER_ADMIN_SECRET
  ) {
    throw new ApiError(400, "Wrong credentials");
  }

  // Generate a signed token using configured secret
  const token = signToken(
    {
      username: env.SUPER_ADMIN_USERNAME,
      password: env.SUPER_ADMIN_PASSWORD,
      sessionSecret: env.SUPER_ADMIN_SESSION_SECRET,
    },
    env.SUPER_ADMIN_AUTH_TOKEN
  );

  new ApiResponse(
    200,
    {
      token,
    },
    "Super Admin login successful"
  ).send(res);
});

// GET /super-admin/admin
// Lists admins with pagination and optional active-only filter
const getAllAdmins = AsyncHandler(async (req, res) => {
  if (!req.superAdmin) {
    throw new ApiError(400, "You are not authorized to access this");
  }

  const page = req.query.page || 1;
  const limit = req.query.limit || 10;

  const onlyActive = req.query.onlyActive;

  // Query admins by role + optional active filter, with pagination
  const admins = await UserModel.find(
    {
      role: UserRole.ADMIN,
      isActive:
        onlyActive === "true"
          ? true
          : onlyActive === "false"
            ? false
            : {
                $in: [true, false],
              },
    },
    {
      skip: (Number(page) - 1) * Number(limit),
      limit: Number(limit),
    }
  )
    .select("-password -emailVerificationToken -emailVerificationExpiry")
    .lean();

  const totalAdmins = await UserModel.countDocuments({
    role: UserRole.ADMIN,
    isActive:
      onlyActive === "true"
        ? true
        : onlyActive === "false"
          ? false
          : {
              $in: [true, false],
            },
  }).lean();

  if (!admins) {
    throw new ApiError(400, "Something went wrong");
  }

  new ApiResponse(
    200,
    {
      admins,
      totalAdmins,
    },
    "Admins fetched successfully"
  ).send(res);
});

// GET /super-admin/admin/:adminId
// Returns a single admin's public profile by id
const getAdminDetails = AsyncHandler(async (req, res) => {
  if (!req.superAdmin) {
    throw new ApiError(400, "You are not authorized to access this");
  }

  const params = adminIdSchema.safeParse(req.params);

  if (!params.success || !params.data) {
    throw new ApiError(400, "Invalid Admin Id");
  }

  const admin = await UserModel.findById(params.data.adminId)
    .select("-password -emailVerificationToken -emailVerificationExpiry")
    .lean();

  if (!admin) {
    throw new ApiError(400, "Admin not found");
  }

  new ApiResponse(
    200,
    {
      admin,
    },
    "Admin details fetched successfully"
  ).send(res);
});

// POST /super-admin/admin
// Creates an admin with default password derived from DOB
const createAdmin = AsyncHandler(async (req, res) => {
  if (!req.superAdmin) {
    throw new ApiError(400, "You are not authorized to access this");
  }

  const { data, success } = createAdminSchema.safeParse(req.body);

  if (!success) {
    throw new ApiError(400, "All Fields Are required");
  }

  // First login password is a hash of date (ddmmyyyy-like numeric sum)
  const hashedPassword = await hashPassword(
    `${
      new Date(data.dateOfBirth).getDate() +
      new Date(data.dateOfBirth).getMonth() +
      new Date(data.dateOfBirth).getFullYear()
    }`
  );

  if (!hashedPassword.success || !hashedPassword.data) {
    throw new ApiError(400, hashedPassword.message);
  }

  const newAdmin = await UserModel.create({
    name: data.name,
    secretId: data.secretId,
    dateOfBirth: new Date(data.dateOfBirth).toISOString(),
    gender: data.gender,
    role: UserRole.ADMIN,
    phoneNumber: data.phoneNumber,
    address: data.address,
    bloodGroup: data.bloodGroup,
    adminAccess: data.adminAccess,
    password: hashedPassword.data,
  });

  new ApiResponse(
    201,
    {
      admin: newAdmin,
    },
    "Admin created successfully"
  ).send(res);
});

// PUT /super-admin/admin/:adminId
// Updates an admin's non-sensitive fields and access list
const updateAdmin = AsyncHandler(async (req, res) => {
  if (!req.superAdmin) {
    throw new ApiError(400, "You are not authorized to access this");
  }

  const params = adminIdSchema.safeParse(req.params);

  if (!params.success || !params.data) {
    throw new ApiError(400, "Invalid Admin Id");
  }

  const adminId = params.data.adminId;

  const { data, success } = updateAdminSchema.safeParse(req.body);

  if (!success || !data) {
    throw new ApiError(400, "All Fields Are required");
  }

  const admin = await UserModel.findById(adminId);

  if (!admin) {
    throw new ApiError(400, "Admin not found");
  }

  // Persist changes via $set to avoid replacing document
  await UserModel.updateOne(
    {
      _id: adminId,
    },

    {
      $set: {
        name: data.name,
        secretId: data.secretId,
        dateOfBirth: new Date(data.dateOfBirth!).toISOString(),
        gender: data.gender,
        phoneNumber: data.phoneNumber,
        address: data.address,
        bloodGroup: data.bloodGroup,
        adminAccess: data.adminAccess,
      },
    }
  );

  const updatedAdmin = await UserModel.findById(adminId);

  new ApiResponse(
    200,
    {
      admin: updatedAdmin,
    },
    "Admin updated successfully"
  ).send(res);
});

// PATCH /super-admin/admin/:adminId
// Toggles admin isActive flag
const changeAdminActivity = AsyncHandler(async (req, res) => {
  if (!req.superAdmin) {
    throw new ApiError(400, "You are not authorized to access this");
  }

  const params = adminIdSchema.safeParse(req.params);

  if (!params.success || !params.data) {
    throw new ApiError(400, "Invalid Admin Id");
  }

  const adminId = params.data.adminId;

  const admin = await UserModel.findById(adminId);

  if (!admin) {
    throw new ApiError(400, "Admin not found");
  }

  const updatedAdmin = await UserModel.updateOne(
    {
      _id: adminId,
    },
    {
      $set: {
        isActive: !admin.isActive,
      },
    }
  );

  return new ApiResponse(
    200,
    {
      admin: updatedAdmin,
    },
    `Admin ${admin.isActive ? "deactivated" : "activated"} successfully`
  ).send(res);
});

// PATCH /super-admin/admin/:adminId/reset-password
// Resets password to a hash derived from admin's DOB and marks as first login
const adminResetPassword = AsyncHandler(async (req, res) => {
  if (!req.superAdmin) {
    throw new ApiError(400, "You are not authorized to access this");
  }

  const params = adminIdSchema.safeParse(req.params);

  if (!params.success || !params.data) {
    throw new ApiError(400, "Invalid Admin Id");
  }

  const adminId = params.data.adminId;

  const admin = await UserModel.findById(adminId);

  if (!admin) {
    throw new ApiError(400, "Admin not found");
  }

  const hashedPassword = await hashPassword(
    `${
      new Date(admin.dateOfBirth).getDate() +
      new Date(admin.dateOfBirth).getMonth() +
      new Date(admin.dateOfBirth).getFullYear()
    }`
  );

  if (!hashedPassword.success || !hashedPassword.data) {
    throw new ApiError(400, hashedPassword.message);
  }

  await UserModel.updateOne(
    {
      _id: adminId,
    },
    {
      $set: {
        password: hashedPassword.data,
        isFirstLogin: true,
      },
    }
  );
  const updatedAdmin = await UserModel.findById(adminId);
  return new ApiResponse(200, {
    admin: updatedAdmin,
  }).send(res);
});

export {
  superAdminLogin,
  createAdmin,
  updateAdmin,
  changeAdminActivity,
  getAllAdmins,
  getAdminDetails,
  adminResetPassword,
};
