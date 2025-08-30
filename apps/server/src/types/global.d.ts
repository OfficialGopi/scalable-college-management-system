import { IUser } from "../models/user.model";

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: IUser["_id"];
        secretId: IUser["secretId"];
        role: IUser["role"];
        name: IUser["name"];
        email: IUser["email"];
        phoneNumber: IUser["phoneNumber"];
        adminAccess: IUser["adminAccess"];
      };
      superAdmin?: boolean;
    }
  }
}

export {};
