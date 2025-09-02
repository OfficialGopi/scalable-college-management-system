// User controller: authentication, session cookies, profile operations.
// Imports application-level constants, env, helpers, models, validation, utilities and cloud upload lib
import { cookieFieldNames, cookieOptions } from "../constants/cookie.constant";
import { env } from "../env";
import { comparePassword } from "../helpers/bcrypt.helper";
import {
  deleteExpiredSessions,
  generateTokenAndSaveToDatabase,
} from "../helpers/model.helper";
import { SessionModel } from "../models/session.model";
import { IUser, UserModel } from "../models/user.model";
import { userLoginSchema } from "../schemas/user.schema";
import { AsyncHandler } from "../utils/async-handler.util";
import { ApiError, ApiResponse } from "../utils/response-formatter.util";
import { uploadOnCloudinary } from "../libs/cloudinary.lib";

// POST /user/login
// Validates credentials, verifies password, issues tokens, sets cookies, returns tokens
const login = AsyncHandler(async (req, res) => {
  // Validate incoming body with zod schema
  const { data, success } = userLoginSchema.safeParse(req.body);

  if (!success) {
    throw new ApiError(400, "All Fields Are required");
  }

  // Find user by secretId
  const user = await UserModel.findOne({
    secretId: data.secretId,
  });

  if (!user) {
    throw new ApiError(400, "User not found");
  }

  // Compare plaintext password with hashed password
  const isPasswordCorrect = await comparePassword(data.password, user.password);

  if (!isPasswordCorrect.success || !isPasswordCorrect.data) {
    throw new ApiError(400, isPasswordCorrect.message);
  }

  // Generate access and refresh tokens, store session
  const tokens = await generateTokenAndSaveToDatabase({
    user,
    accessTokenSecret: env.ACCESS_TOKEN_SECRET,
    refreshTokenSecret: env.REFRESH_TOKEN_SECRET,
    refreshTokenExpiry: env.REFRESH_TOKEN_EXPIRY,
    accessTokenExpiry: env.ACCESS_TOKEN_EXPIRY,
  });

  if (!tokens.success || !tokens.data) {
    throw new ApiError(400, tokens.message);
  }

  // Clean up any expired sessions for this user to avoid bloat
  await deleteExpiredSessions(user._id as string);

  // Set httpOnly cookies for access and refresh tokens
  res.cookie(
    cookieFieldNames.accessToken,
    tokens.data.accessToken,
    cookieOptions
  );
  res.cookie(
    cookieFieldNames.refreshToken,
    tokens.data.refreshToken,
    cookieOptions
  );

  // Return tokens for clients that also want to store them (optional)
  return new ApiResponse(200, {
    tokens: {
      "access-token": tokens.data.accessToken,
      "refresh-token": tokens.data.refreshToken,
    },
  }).send(res);
});

// POST /user/logout
// Clears user session and authentication cookies
const logout = AsyncHandler(async (req, res) => {
  // If no user is attached (already logged out), still clear cookies
  if (!req.user) {
    res.clearCookie(cookieFieldNames.accessToken);
    res.clearCookie(cookieFieldNames.refreshToken);
    return new ApiResponse(200, "User logged out successfully").send(res);
  }

  // Remove refresh token from user's sessions in DB
  await UserModel.updateOne(
    {
      _id: req.user._id,
    },
    {
      $pull: {
        sessions: [req.cookies[cookieFieldNames.refreshToken]],
      },
    }
  );

  // Delete matching session document
  await SessionModel.deleteOne({
    refreshToken: req.cookies[cookieFieldNames.refreshToken],
  });

  // Clear cookies and respond
  res.clearCookie(cookieFieldNames.accessToken);
  res.clearCookie(cookieFieldNames.refreshToken);
  return new ApiResponse(200, "User logged out successfully").send(res);
});

// GET /user/me
// Returns authenticated user's public profile
const getUser = AsyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(400, "User not found");
  }

  // Fetch fresh copy of user excluding sensitive fields
  const user = await UserModel.findById(req.user._id, {
    password: 0,
    emailVerificationExpiry: 0,
    emailVerificationToken: 0,
  }).lean();

  return new ApiResponse(200, user, "User details updated successfully").send(
    res
  );
});

// PUT /user/update-profile-image
// Uploads image to Cloudinary, stores reference in user's profileImage
const updateProfileImage = AsyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(400, "User not found");
  }

  // Multer populates req.file
  const file = req.file;

  if (!file) throw new ApiError(400, "Please Upload Avatar");

  // Upload to Cloudinary and derive the asset reference
  const result = await uploadOnCloudinary(file.path);

  let avatar: { public_id: string; url: string } | null = null;

  if (result && result?.public_id && result?.url) {
    avatar = {
      public_id: result.public_id,
      url: result.url,
    };
  }

  // Update user's profileImage
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      profileImage: avatar,
    },
    {
      new: true,
    }
  );

  return new ApiResponse(200, user, "User details updated successfully").send(
    res
  );
});

export { login, logout, getUser, updateProfileImage };
