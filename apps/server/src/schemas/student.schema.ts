import { z } from "zod";

const getMaterialsQuerySchema = z.object({
  batch: z.string(),
  subject: z.string(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
});

// Submission Assignment schemas
const createSubmissionAssignmentSchema = z.object({
  assignment: z.string(),
  // file will come from multer; validate presence separately if needed
});

const gradeSubmissionAssignmentSchema = z.object({
  marksObtained: z.number().min(0),
  read: z.boolean().optional(),
});

const getSubmissionsQuerySchema = z.object({
  assignment: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
});

export {
  getMaterialsQuerySchema,
  createSubmissionAssignmentSchema,
  gradeSubmissionAssignmentSchema,
  getSubmissionsQuerySchema,
};
