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

const getAllAdmins = AsyncHandler(async (req, res) => {
  if (!req.superAdmin) {
    throw new ApiError(400, "You are not authorized to access this");
  }

  const page = req.query.page || 1;
  const limit = req.query.limit || 10;

  const onlyActive = req.query.onlyActive;

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

const createAdmin = AsyncHandler(async (req, res) => {
  if (!req.superAdmin) {
    throw new ApiError(400, "You are not authorized to access this");
  }

  const { data, success } = createAdminSchema.safeParse(req.body);

  if (!success) {
    throw new ApiError(400, "All Fields Are required");
  }

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

  const deletedAdmin = await UserModel.updateOne(
    {
      _id: adminId,
    },
    {
      $set: {
        isActive: true,
      },
    }
  );

  return new ApiResponse(
    200,
    {
      admin: deletedAdmin,
    },
    "Admin deleted successfully"
  ).send(res);
});

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
