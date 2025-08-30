import "dotenv/config";

import { z } from "zod";

function parseEnv(env: NodeJS.ProcessEnv) {
  const envSchema = z.object({
    PORT: z.coerce.number().default(3000),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    MONGO_URI: z.string(),
    ACCESS_TOKEN_SECRET: z.string(),
    REFRESH_TOKEN_SECRET: z.string(),
    ACCESS_TOKEN_EXPIRY: z.coerce.number(),
    REFRESH_TOKEN_EXPIRY: z.coerce.number(),
    CLIENT_URL: z.string(),
    CLOUDINARY_NAME: z.string(),
    CLOUDINARY_KEY: z.string(),
    CLOUDINARY_SECRET: z.string(),
    SUPER_ADMIN_SECRET: z.string(),
    SUPER_ADMIN_USERNAME: z.string(),
    SUPER_ADMIN_PASSWORD: z.string(),
    SUPER_ADMIN_AUTH_TOKEN: z.string(),
    SUPER_ADMIN_SESSION_SECRET: z.string(),
  });

  const parsedEnv = envSchema.safeParse(env);

  if (parsedEnv.success) {
    return parsedEnv.data;
  } else {
    throw new Error(parsedEnv.error.message);
  }
}

export const env = parseEnv(process.env);
