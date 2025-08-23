import z from "zod";
import {
  BloodGroup,
  Department,
  Gender,
  Semester,
  StudentStatus,
} from "../types/types";

const createStudentSchema = z.object({
  name: z.string(),
  secretId: z.string(),
  dateOfBirth: z.coerce.date(),
  gender: z.enum(Object.values(Gender)),
  phoneNumber: z.string().length(10),
  address: z.string(),
  bloodGroup: z.enum(Object.values(BloodGroup)),
  batch: z.string(),
  department: z.enum(Object.values(Department)),
});

const updateStudentSchema = z.object({
  name: z.string().optional(),
  secretId: z.string().optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.enum(Object.values(Gender)).optional(),
  phoneNumber: z.string().length(10).optional(),
  address: z.string().optional(),
  bloodGroup: z.enum(Object.values(BloodGroup)).optional(),
  batch: z.string().optional(),
  department: z.enum(Object.values(Department)).optional(),
  isActive: z.enum(Object.values(StudentStatus)).optional(),
});

const getAllStudentsSchema = z.object({
  department: z.enum(Object.values(Department)),
  batch: z.string(),
  page: z.coerce.number(),
  limit: z.coerce.number().default(10),
});

const createBatchSchema = z.object({
  name: z.string(),
  startingYear: z.coerce.date(),
  currentSemester: z.enum(Object.values(Semester)).default(Semester.FIRST),
});

const updateBatchSchema = z.object({
  name: z.string().optional(),
  department: z.enum(Object.values(Department)).optional(),
  startingYear: z.coerce.date().optional(),
  currentSemester: z.enum(Object.values(Semester)).optional(),
  isResultsPublished: z.boolean().optional(),
  isCompleted: z.boolean().optional(),
});

const getAllBatchesQuerySchema = z.object({
  includeCompletedBatches: z.coerce.boolean(),
  department: z.enum(Object.values(Department)),
  page: z.coerce.number(),
  limit: z.coerce.number().default(10),
});

export {
  createStudentSchema,
  updateStudentSchema,
  getAllStudentsSchema,
  createBatchSchema,
  updateBatchSchema,
  getAllBatchesQuerySchema,
};
