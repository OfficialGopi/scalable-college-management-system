import { Router } from "express";
import {
  changeStudentStatus,
  createStudent,
  getAllStudents,
  getStudentDetails,
  updateStudent,
} from "../controllers/admin.controller";
import { checkAdminAccess } from "../middlewares/auth.middleware";
import { AdminAccess } from "../types/types";

const router = Router();

//STUDENT ACCESS
router.get(
  "/student",
  checkAdminAccess(AdminAccess.STUDENT_ACCESS),
  getAllStudents
);
router.post(
  "/student",
  checkAdminAccess(AdminAccess.STUDENT_ACCESS),
  createStudent
);
router.get(
  "/student/:studentId",
  checkAdminAccess(AdminAccess.STUDENT_ACCESS),
  getStudentDetails
);
router.put(
  "/student/:studentId",
  checkAdminAccess(AdminAccess.STUDENT_ACCESS),
  updateStudent
);
router.patch(
  "/student/:studentId",
  checkAdminAccess(AdminAccess.STUDENT_ACCESS),
  changeStudentStatus
);

export { router as adminRouter };
