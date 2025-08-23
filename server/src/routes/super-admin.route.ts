import { Router } from "express";
import {
  changeAdminActivity,
  createAdmin,
  getAdminDetails,
  getAllAdmins,
  superAdminLogin,
} from "../controllers/super-admin.controller";
import { checkSuperAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.post("/login", superAdminLogin);

router.use(checkSuperAdmin); //AUTHENTICATION MIDDLEWARE

router.get("/admin", getAllAdmins);
router.post("/admin", createAdmin);
router.get("/admin/:adminId", getAdminDetails);
router.put("/admin/:adminId", createAdmin);
router.patch("/admin/:adminId", changeAdminActivity);

export { router as superAdminRouter };
