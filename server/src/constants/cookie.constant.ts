import { CookieOptions } from "express";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
};

const cookieFieldNames = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
};

export { cookieOptions, cookieFieldNames };
