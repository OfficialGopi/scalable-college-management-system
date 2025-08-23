import { Types } from "mongoose";
import { SessionModel } from "../models/session.model";
import { IUser, UserModel } from "../models/user.model";
import { signToken } from "./jwt.helper";

const generateTokenAndSaveToDatabase = async ({
  user,
  accessTokenSecret,
  refreshTokenSecret,
  accessTokenExpiry,
  refreshTokenExpiry,
}: {
  user: IUser;
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accessTokenExpiry: number;
  refreshTokenExpiry: number;
}) => {
  if (!user) {
    return {
      success: false,
      message: "User not found",
    };
  }

  try {
    const isUserExists = await UserModel.findById(user._id);

    if (!isUserExists) {
      return {
        success: false,
        message: "User not found",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong",
    };
  }

  const data = {
    _id: user._id,
    secretId: user.secretId,
  };

  const accessToken = signToken(data, accessTokenSecret, accessTokenExpiry);
  const refreshToken = signToken(data, refreshTokenSecret, refreshTokenExpiry);

  if (!accessToken || !refreshToken) {
    return {
      success: false,
      message: "Something went wrong",
    };
  }
  try {
    const newSession = await SessionModel.create({
      refreshToken: refreshToken,
      user: user._id,
      expiresAt: new Date(
        Date.now() + Number(refreshTokenExpiry * 24 * 60 * 60 * 1000)
      ),
    });

    if (!newSession) {
      return {
        success: false,
        message: "Something went wrong",
      };
    }
    await UserModel.updateOne(
      {
        _id: newSession.user,
      },
      {
        $push: {
          sessions: newSession._id,
        },
      }
    );

    return {
      success: true,
      data: {
        accessToken,
        refreshToken,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong",
    };
  }
};

const deleteExpiredSessions = async (userId: string) => {
  if (!userId) {
    return {
      success: false,
      message: "User not found",
    };
  }

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const expiredSessions = await SessionModel.find({
      user: userId,
      expiresAt: {
        $lt: new Date(),
      },
    }).select("_id"); // only fetch IDs

    const expiredIds = expiredSessions.map((s) => s._id);

    await SessionModel.deleteMany({
      _id: {
        $in: expiredIds,
      },
    });

    await UserModel.updateOne(
      {
        _id: userId,
      },
      {
        $pull: {
          sessions: {
            $in: expiredIds,
          },
        },
      }
    );

    return {
      success: true,
      message: "Sessions deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong",
    };
  }
};

export { generateTokenAndSaveToDatabase, deleteExpiredSessions };
