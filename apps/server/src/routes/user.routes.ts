// User routes: login/logout, self profile and avatar update.
import { Router } from "express";
import {
  getUser,
  login,
  logout,
  updateProfileImage,
} from "../controllers/user.controller";
import {
  checkAdminAccess,
  checkIsActive,
  checkRole,
  checkUser,
} from "../middlewares/auth.middleware";
import { AdminAccess, UserRole } from "../types/types";
import { profileImageUpload } from "../middlewares/multer.middleware";

const router = Router();

router.post("/login", login);

router.use(checkUser, checkIsActive); //AUTHENTICATION MIDDLEWARE

router.post("/logout", logout);
router.get("/me", getUser);
router.put("/update-profile-image", profileImageUpload, updateProfileImage);

export { router as userRouter };
