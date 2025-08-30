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

// Teacher schemas
const createTeacherSchema = z.object({
  name: z.string(),
  secretId: z.string(),
  dateOfBirth: z.coerce.date(),
  gender: z.enum(Object.values(Gender)),
  phoneNumber: z.string().length(10),
  address: z.string(),
  bloodGroup: z.enum(Object.values(BloodGroup)),
  email: z.string().email(),
});

const updateTeacherSchema = z.object({
  name: z.string().optional(),
  secretId: z.string().optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.enum(Object.values(Gender)).optional(),
  phoneNumber: z.string().length(10).optional(),
  address: z.string().optional(),
  bloodGroup: z.enum(Object.values(BloodGroup)).optional(),
  email: z.string().email().optional(),
});

const getAllTeachersSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  onlyActive: z.coerce.boolean().optional(),
});

// Subject schemas
const createSubjectSchema = z.object({
  subjectCode: z.string(),
  subjectName: z.string(),
  department: z.enum(Object.values(Department)),
  semester: z.enum(Object.values(Semester)),
  subjectType: z.enum(["THEORY", "LAB", "SEMINAR"]),
  credits: z.number().min(0).max(5),
  assignedTeacher: z.string().optional(),
});

const updateSubjectSchema = z.object({
  subjectCode: z.string().optional(),
  subjectName: z.string().optional(),
  department: z.enum(Object.values(Department)).optional(),
  semester: z.enum(Object.values(Semester)).optional(),
  subjectType: z.enum(["THEORY", "LAB", "SEMINAR"]).optional(),
  credits: z.number().min(0).max(5).optional(),
  assignedTeacher: z.string().optional(),
  isDeprecated: z.boolean().optional(),
});

const getAllSubjectsSchema = z.object({
  department: z.enum(Object.values(Department)),
  semester: z.enum(Object.values(Semester)).optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
});

// Assignment schemas
const createAssignmentSchema = z.object({
  batch: z.string(),
  subject: z.string(),
  title: z.string(),
  description: z.string(),
  dueDate: z.coerce.date(),
  marks: z.number().min(1),
});

const updateAssignmentSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  marks: z.number().min(1).optional(),
  isClosed: z.boolean().optional(),
});

const getAllAssignmentsSchema = z.object({
  batch: z.string().optional(),
  subject: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
});

// Material schemas
const createMaterialSchema = z.object({
  batch: z.string(),
  subject: z.string(),
  title: z.string(),
  description: z.string(),
  materialUrl: z.object({
    public_id: z.string(),
    url: z.string(),
  }),
});

const updateMaterialSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  materialUrl: z
    .object({
      public_id: z.string(),
      url: z.string(),
    })
    .optional(),
});

const getAllMaterialsSchema = z.object({
  batch: z.string().optional(),
  subject: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
});

// Routine schemas
const createRoutineSchema = z.object({
  batch: z.string(),
  subject: z.string(),
  day: z.enum([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ]),
  shift: z.enum(["FIRST", "SECOND", "THIRD", "FOURTH"]),
  semester: z.enum(Object.values(Semester)),
});

const updateRoutineSchema = z.object({
  subject: z.string().optional(),
  day: z
    .enum([
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ])
    .optional(),
  shift: z.enum(["FIRST", "SECOND", "THIRD", "FOURTH"]).optional(),
  semester: z.enum(Object.values(Semester)).optional(),
});

const getAllRoutinesSchema = z.object({
  batch: z.string().optional(),
  subject: z.string().optional(),
  day: z
    .enum([
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ])
    .optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
});

// Result schemas
const createResultSchema = z.object({
  subject: z.string(),
  student: z.string(),
  pointsAchived: z.number().min(0).max(10),
});

const updateResultSchema = z.object({
  pointsAchived: z.number().min(0).max(10),
});

const getAllResultsSchema = z.object({
  subject: z.string().optional(),
  student: z.string().optional(),
  batch: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
});

// Notice schemas
const createNoticeSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  department: z.enum(Object.values(Department)).optional(),
  semester: z.enum(Object.values(Semester)).optional(),
  attachments: z
    .array(
      z.object({
        public_id: z.string(),
        url: z.string(),
      })
    )
    .optional(),
});

const updateNoticeSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  date: z.coerce.date().optional(),
  department: z.enum(Object.values(Department)).optional(),
  semester: z.enum(Object.values(Semester)).optional(),
  attachments: z
    .array(
      z.object({
        public_id: z.string(),
        url: z.string(),
      })
    )
    .optional(),
});

const getAllNoticesSchema = z.object({
  department: z.enum(Object.values(Department)).optional(),
  semester: z.enum(Object.values(Semester)).optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
});

export {
  createStudentSchema,
  updateStudentSchema,
  getAllStudentsSchema,
  createBatchSchema,
  updateBatchSchema,
  getAllBatchesQuerySchema,
  createTeacherSchema,
  updateTeacherSchema,
  getAllTeachersSchema,
  createSubjectSchema,
  updateSubjectSchema,
  getAllSubjectsSchema,
  createAssignmentSchema,
  updateAssignmentSchema,
  getAllAssignmentsSchema,
  createMaterialSchema,
  updateMaterialSchema,
  getAllMaterialsSchema,
  createRoutineSchema,
  updateRoutineSchema,
  getAllRoutinesSchema,
  createResultSchema,
  updateResultSchema,
  getAllResultsSchema,
  createNoticeSchema,
  updateNoticeSchema,
  getAllNoticesSchema,
};
