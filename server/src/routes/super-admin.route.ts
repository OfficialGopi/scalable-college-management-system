import { Router } from "express";
import {
  adminResetPassword,
  changeAdminActivity,
  createAdmin,
  getAdminDetails,
  getAllAdmins,
  superAdminLogin,
  updateAdmin,
} from "../controllers/super-admin.controller";
import { checkSuperAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.post("/login", superAdminLogin);

router.use(checkSuperAdmin); //AUTHENTICATION MIDDLEWARE

router.get("/admin", getAllAdmins);
router.post("/admin", createAdmin);
router.get("/admin/:adminId", getAdminDetails);
router.put("/admin/:adminId", updateAdmin);
router.patch("/admin/:adminId", changeAdminActivity);
router.patch("/admin/:adminId/reset-password", adminResetPassword);

export { router as superAdminRouter };
