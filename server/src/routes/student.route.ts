import { Router } from "express";
import { checkRole, checkUser } from "../middlewares/auth.middleware";
import { UserRole } from "../types/types";

const router = Router();

router.use(checkUser); //AUTHENTICATION MIDDLEWARE

router.use(checkRole([UserRole.STUDENT, UserRole.ADMIN])); //AUTHORIZATION MIDDLEWARE

//STUDENT DETAILS
import { getStudentAcademicDetails } from "../controllers/student.controller";

router.get("/academic-details", getStudentAcademicDetails);

//BATCH DETAILS
import { getStudentBatchDetails } from "../controllers/student.controller";

router.get("/batch-details", getStudentBatchDetails);

//MATERIAL DETAILS
import { getMaterials } from "../controllers/student.controller";

router.get("/materials", getMaterials);

//ROUTINE DETAILS
import { getStudentRoutine } from "../controllers/student.controller";

router.get("/routine", getStudentRoutine);

//SUBJECT DETAILS
import { getStudentSubjects } from "../controllers/student.controller";

router.get("/subjects", getStudentSubjects);

//ASSIGNMENT DETAILS
import {
  getStudentAssignments,
  submitAssignment,
  getAssignmentSubmission,
} from "../controllers/student.controller";

router.get("/assignments", getStudentAssignments);
router.post("/assignments/submit", submitAssignment);
router.get("/assignments/:assignmentId/submission", getAssignmentSubmission);

//RESULT DETAILS
import {
  getStudentResults,
  getSubjectResult,
} from "../controllers/student.controller";

router.get("/results", getStudentResults);
router.get("/results/subject/:subjectId", getSubjectResult);

//NOTICE DETAILS
import {
  getStudentNotices,
  getNoticeDetails,
} from "../controllers/student.controller";

router.get("/notices", getStudentNotices);
router.get("/notices/:noticeId", getNoticeDetails);

//PROFILE MANAGEMENT
import {
  getStudentProfile,
  updateStudentProfile,
} from "../controllers/student.controller";

router.get("/profile", getStudentProfile);
router.put("/profile", updateStudentProfile);

export { router as studentRouter };
