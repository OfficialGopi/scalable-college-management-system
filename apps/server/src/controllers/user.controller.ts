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

const login = AsyncHandler(async (req, res) => {
  const { data, success } = userLoginSchema.safeParse(req.body);

  if (!success) {
    throw new ApiError(400, "All Fields Are required");
  }

  const user = await UserModel.findOne({
    secretId: data.secretId,
  });

  if (!user) {
    throw new ApiError(400, "User not found");
  }

  const isPasswordCorrect = await comparePassword(data.password, user.password);

  if (!isPasswordCorrect.success || !isPasswordCorrect.data) {
    throw new ApiError(400, isPasswordCorrect.message);
  }

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

  await deleteExpiredSessions(user._id as string);

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

  return new ApiResponse(200, {
    tokens: {
      "access-token": tokens.data.accessToken,
      "refresh-token": tokens.data.refreshToken,
    },
  }).send(res);
});

const logout = AsyncHandler(async (req, res) => {
  if (!req.user) {
    res.clearCookie(cookieFieldNames.accessToken);
    res.clearCookie(cookieFieldNames.refreshToken);
    return new ApiResponse(200, "User logged out successfully").send(res);
  }

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

  await SessionModel.deleteOne({
    refreshToken: req.cookies[cookieFieldNames.refreshToken],
  });

  res.clearCookie(cookieFieldNames.accessToken);
  res.clearCookie(cookieFieldNames.refreshToken);
  return new ApiResponse(200, "User logged out successfully").send(res);
});

const getUser = AsyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(400, "User not found");
  }

  const user = await UserModel.findById(req.user._id, {
    password: 0,
    emailVerificationExpiry: 0,
    emailVerificationToken: 0,
  }).lean();

  return new ApiResponse(200, user, "User details updated successfully").send(
    res
  );
});

const updateProfileImage = AsyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(400, "User not found");
  }

  const file = req.file;

  if (!file) throw new ApiError(400, "Please Upload Avatar");

  const result = await uploadOnCloudinary(file.path);

  let avatar: { public_id: string; url: string } | null = null;

  if (result && result?.public_id && result?.url) {
    avatar = {
      public_id: result.public_id,
      url: result.url,
    };
  }

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
