import { env } from "../env";
import { extractDataFromToken } from "../helper/jwt.helper";
import { superAdminAuthenticationHeaderSchema } from "../schemas/super-admin.schema";
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

export { checkSuperAdmin };
