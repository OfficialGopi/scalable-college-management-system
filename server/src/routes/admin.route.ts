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
import {
  createTeacher,
  updateTeacher,
  getAllTeachers,
  getTeacherDetails,
  changeTeacherStatus,
} from "../controllers/admin.controller";

router.get(
  "/teacher",
  checkAdminAccess(AdminAccess.TEACHER_ACCESS),
  getAllTeachers
);
router.post(
  "/teacher",
  checkAdminAccess(AdminAccess.TEACHER_ACCESS),
  createTeacher
);
router.get(
  "/teacher/:teacherId",
  checkAdminAccess(AdminAccess.TEACHER_ACCESS),
  getTeacherDetails
);
router.put(
  "/teacher/:teacherId",
  checkAdminAccess(AdminAccess.TEACHER_ACCESS),
  updateTeacher
);
router.patch(
  "/teacher/:teacherId",
  checkAdminAccess(AdminAccess.TEACHER_ACCESS),
  changeTeacherStatus
);

//SUBJECT ACCESS
import {
  createSubject,
  updateSubject,
  getAllSubjects,
  getSubjectDetails,
} from "../controllers/admin.controller";

router.get(
  "/subject",
  checkAdminAccess(AdminAccess.SUBJECT_ACCESS),
  getAllSubjects
);
router.post(
  "/subject",
  checkAdminAccess(AdminAccess.SUBJECT_ACCESS),
  createSubject
);
router.get(
  "/subject/:subjectId",
  checkAdminAccess(AdminAccess.SUBJECT_ACCESS),
  getSubjectDetails
);
router.put(
  "/subject/:subjectId",
  checkAdminAccess(AdminAccess.SUBJECT_ACCESS),
  updateSubject
);

//ASSIGNMENT ACCESS
import {
  createAssignment,
  updateAssignment,
  getAllAssignments,
  getAssignmentDetails,
} from "../controllers/admin.controller";

router.get(
  "/assignment",
  checkAdminAccess(AdminAccess.ASSIGNMENT_MONITOR_ACCESS),
  getAllAssignments
);
router.post(
  "/assignment",
  checkAdminAccess(AdminAccess.ASSIGNMENT_MONITOR_ACCESS),
  createAssignment
);
router.get(
  "/assignment/:assignmentId",
  checkAdminAccess(AdminAccess.ASSIGNMENT_MONITOR_ACCESS),
  getAssignmentDetails
);
router.put(
  "/assignment/:assignmentId",
  checkAdminAccess(AdminAccess.ASSIGNMENT_MONITOR_ACCESS),
  updateAssignment
);

//MATERIAL ACCESS
import {
  createMaterial,
  updateMaterial,
  getAllMaterials,
  getMaterialDetails,
} from "../controllers/admin.controller";

router.get(
  "/material",
  checkAdminAccess(AdminAccess.SUBJECT_ACCESS),
  getAllMaterials
);
router.post(
  "/material",
  checkAdminAccess(AdminAccess.SUBJECT_ACCESS),
  createMaterial
);
router.get(
  "/material/:materialId",
  checkAdminAccess(AdminAccess.SUBJECT_ACCESS),
  getMaterialDetails
);
router.put(
  "/material/:materialId",
  checkAdminAccess(AdminAccess.SUBJECT_ACCESS),
  updateMaterial
);

//ROUTINE ACCESS
import {
  createRoutine,
  updateRoutine,
  getAllRoutines,
  getRoutineDetails,
} from "../controllers/admin.controller";

router.get(
  "/routine",
  checkAdminAccess(AdminAccess.ROUTINE_ACCESS),
  getAllRoutines
);
router.post(
  "/routine",
  checkAdminAccess(AdminAccess.ROUTINE_ACCESS),
  createRoutine
);
router.get(
  "/routine/:routineId",
  checkAdminAccess(AdminAccess.ROUTINE_ACCESS),
  getRoutineDetails
);
router.put(
  "/routine/:routineId",
  checkAdminAccess(AdminAccess.ROUTINE_ACCESS),
  updateRoutine
);

//RESULT ACCESS
import {
  createResult,
  updateResult,
  getAllResults,
  getResultDetails,
} from "../controllers/admin.controller";

router.get(
  "/result",
  checkAdminAccess(AdminAccess.RESULT_ACCESS),
  getAllResults
);
router.post(
  "/result",
  checkAdminAccess(AdminAccess.RESULT_ACCESS),
  createResult
);
router.get(
  "/result/:resultId",
  checkAdminAccess(AdminAccess.RESULT_ACCESS),
  getResultDetails
);
router.put(
  "/result/:resultId",
  checkAdminAccess(AdminAccess.RESULT_ACCESS),
  updateResult
);

//NOTICE ACCESS
import {
  createNotice,
  updateNotice,
  getAllNotices,
  getNoticeDetails,
} from "../controllers/admin.controller";

router.get(
  "/notice",
  checkAdminAccess(AdminAccess.NOTICE_ACCESS),
  getAllNotices
);
router.post(
  "/notice",
  checkAdminAccess(AdminAccess.NOTICE_ACCESS),
  createNotice
);
router.get(
  "/notice/:noticeId",
  checkAdminAccess(AdminAccess.NOTICE_ACCESS),
  getNoticeDetails
);
router.put(
  "/notice/:noticeId",
  checkAdminAccess(AdminAccess.NOTICE_ACCESS),
  updateNotice
);

export { router as adminRouter };
