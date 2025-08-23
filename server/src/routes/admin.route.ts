import { Router } from "express";
import { checkAdminAccess } from "../middlewares/auth.middleware";
import { AdminAccess } from "../types/types";

const router = Router();

//STUDENT ACCESS
import {
  changeStudentStatus,
  createStudent,
  getAllStudents,
  getStudentDetails,
  updateStudent,
} from "../controllers/admin.controller";

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

//BATCH ACCESS
import {
  createBatch,
  updateBatch,
  getAllBatches,
  getBatchDetails,
  promoteBatch,
  publishResultAndCompleteBatch,
} from "../controllers/admin.controller";

router.get("/batch", checkAdminAccess(AdminAccess.BATCH_ACCESS), getAllBatches);
router.get(
  "/batch/:batchId",
  checkAdminAccess(AdminAccess.BATCH_ACCESS),
  getBatchDetails
);
router.post("/batch", checkAdminAccess(AdminAccess.BATCH_ACCESS), createBatch);
router.put(
  "/batch/:batchId",
  checkAdminAccess(AdminAccess.BATCH_ACCESS),
  updateBatch
);
router.put(
  "/batch/promote/:batchId",
  checkAdminAccess(AdminAccess.BATCH_ACCESS),
  promoteBatch
);
router.put(
  "/batch/complete/:batchId",
  checkAdminAccess(AdminAccess.BATCH_ACCESS),
  publishResultAndCompleteBatch
);

//TEACHER ACCESS

//SUBJECT ACCESS

//ASSIGNMENT ACCESS

//MATERIAL ACCESS

//ROUTINE ACCESS

//RESULT ACCESS

//NOTICE ACCESS

export { router as adminRouter };
