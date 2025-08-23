import jwt from "jsonwebtoken";

const signToken = (data: any, token: string, expiry?: string) => {
  return jwt.sign(data, token, {
    expiresIn: expiry,
  } as jwt.SignOptions);
};

const extractDataFromToken = (token: string, secret: string) => {
  const data = jwt.verify(token, secret) as jwt.JwtPayload & {
    [key: string]: string;
  };

  if (!data.exp) {
    return {
      success: true,
      data,
    };
  }

  if (data.exp < Date.now() / 1000) {
    return {
      success: false,
      message: "Session Expired",
    };
  }

  return {
    success: true,
    data,
  };
};

export { signToken, extractDataFromToken };
