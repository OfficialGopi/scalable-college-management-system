import { cookieFieldNames } from "../constants/cookie.constant";
import { env } from "../env";
import { extractDataFromToken } from "../helper/jwt.helper";
import { UserModel } from "../models/user.model";
import { superAdminAuthenticationHeaderSchema } from "../schemas/super-admin.schema";
import { AdminAccess, UserRole } from "../types/types";
import { AsyncHandler } from "../utils/async-handler.util";
import { ApiError } from "../utils/response-formatter.util";

const checkSuperAdmin = AsyncHandler(async (req, _, next) => {
  const { data, success } = superAdminAuthenticationHeaderSchema.safeParse(
    req.headers
  );

  if (!success || !data.Authorization) {
    throw new ApiError(401, "You are not authorized to access this");
  }

  const result = extractDataFromToken(
    data.Authorization,
    env.SUPER_ADMIN_AUTH_TOKEN
  ) as {
    success: boolean;
    data?: {
      username: string;
      password: string;
      sessionSecret: string;
    };
    message?: string;
  };

  if (!result.success || !result.data) {
    throw new ApiError(400, result.message ?? "Session Expired");
  }

  if (
    result.data.username !== env.SUPER_ADMIN_USERNAME ||
    result.data.password !== env.SUPER_ADMIN_PASSWORD ||
    result.data.sessionSecret !== env.SUPER_ADMIN_SESSION_SECRET
  ) {
    throw new ApiError(400, "You are not authorized to access this");
  }
  req.superAdmin = true;
  next();
});

const checkUser = AsyncHandler(async (req, _, next) => {
  const accessToken =
    req.cookies[cookieFieldNames.accessToken] ?? req.headers.Authorization;

  if (!accessToken) {
    throw new ApiError(401, "You are not authorized to access this");
  }

  const result = extractDataFromToken(accessToken, env.ACCESS_TOKEN_SECRET) as {
    success: boolean;
    data?: {
      _id: string;
      secretId: string;
    };
    message?: string;
  };

  if (!result.success || !result.data) {
    throw new ApiError(400, result.message ?? "Session Expired");
  }

  const user = await UserModel.findById(result.data._id, {
    password: 0,
    emailVerificationExpiry: 0,
    emailVerificationToken: 0,
  }).lean();

  if (!user) {
    throw new ApiError(400, "You are not authorized to access this");
  }

  req.user = {
    _id: user._id,
    secretId: user.secretId,
    role: user.role,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    adminAccess: user.adminAccess,
  };

  next();
});

const checkRole = (
  role:
    | (typeof UserRole)[keyof typeof UserRole]
    | (typeof UserRole)[keyof typeof UserRole][]
) => {
  if (!Array.isArray(role)) {
    role = [role];
  }

  return AsyncHandler(async (req, _, next) => {
    if (!req.user || !role.includes(req.user.role)) {
      throw new ApiError(403, "You are not authorized to access this");
    }
    next();
  });
};

const checkAdminAccess = (
  access: (typeof AdminAccess)[keyof typeof AdminAccess]
) => {
  return AsyncHandler(async (req, _, next) => {
    if (
      !req.user ||
      req.user.role !== UserRole.ADMIN ||
      !req.user.adminAccess.includes(access)
    ) {
      throw new ApiError(403, "You are not authorized to access this");
    }
    next();
  });
};

const checkIsActive = AsyncHandler(async (req, _, next) => {
  if (!req.user) {
    throw new ApiError(403, "You are not authorized to access this");
  }

  const user = await UserModel.findById(req.user._id, {
    password: 0,
    emailVerificationExpiry: 0,
    emailVerificationToken: 0,
  }).lean();

  if (!user || !user.isActive) {
    throw new ApiError(403, "You are not authorized to access this");
  }

  next();
});

export {
  checkSuperAdmin,
  checkUser,
  checkRole,
  checkAdminAccess,
  checkIsActive,
};
