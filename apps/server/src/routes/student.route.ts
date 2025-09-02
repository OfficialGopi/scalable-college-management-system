// Student routes: require auth and restrict to STUDENT/ADMIN for self-service.
import { Router } from "express";
import { checkRole, checkUser } from "../middlewares/auth.middleware";

const router = Router();

router.use(checkUser); //AUTHENTICATION MIDDLEWARE

router.use(checkRole([UserRole.STUDENT, UserRole.ADMIN])); //AUTHORIZATION MIDDLEWARE

//STUDENT DETAILS
import { UserRole } from "../types/types";
import { getStudentAcademicDetails } from "../controllers/student.controller";

router.get("/academic-details", getStudentAcademicDetails);

//BATCH DETAILS
import { getStudentBatchDetails } from "../controllers/student.controller";

router.get("/batch-details", getStudentBatchDetails);

//MATERIAL DETAILS
import { getMaterials } from "../controllers/student.controller";

router.get("/materials", getMaterials);

//ROUTINE DETAILS

//SUBJECT DETAILS

//ASSIGNMENT DETAILS
import {
  listMySubmissions,
  submitAssignment,
} from "../controllers/student.controller";

router.get("/submissions", listMySubmissions);
router.post("/submit-assignment", ...submitAssignment);

//RESULT DETAILS

//SUBJECT DETAILS

//NOTICE DETAILS

export { router as studentRouter };
