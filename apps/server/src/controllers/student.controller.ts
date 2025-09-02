// Student controller: expose self-service endpoints using authenticated user context.
import { AcademicDetailsModel } from "../models/academicDetails.model";
import { IBatch } from "../models/batch.model";
import { MaterialModel } from "../models/material.model";
import { IUser } from "../models/user.model";
import { AsyncHandler } from "../utils/async-handler.util";
import { ApiError, ApiResponse } from "../utils/response-formatter.util";

// GET /student/academic-details
// Returns the academic details document for the authenticated student
const getStudentAcademicDetails = AsyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(400, "Student not found");
  }

  const userId = req.user._id;

  const student = await AcademicDetailsModel.findOne({
    student: userId,
  }).lean();

  if (!student) {
    throw new ApiError(400, "Student not found");
  }

  return new ApiResponse(
    200,
    {
      student,
    },
    "Academic details fetched successfully"
  ).send(res);
});

export { getStudentAcademicDetails };

// GET /student/batch-details
// Fetches the batch referenced in student's academic details
const getStudentBatchDetails = AsyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(400, "Student not found");
  }

  const userId = req.user._id;

  const student = (await AcademicDetailsModel.findOne({
    student: userId,
  })
    .select("batch")
    .populate("batch")
    .lean()) as unknown as Partial<IUser> & {
    batch: IBatch;
  };
  if (!student || !student.batch) {
    throw new ApiError(400, "Student not found");
  }

  return new ApiResponse(
    200,
    {
      batch: student.batch,
    },
    "Academic details fetched successfully"
  ).send(res);
});

export { getStudentBatchDetails };

// MATERIAL DETAILS
import { getMaterialsQuerySchema } from "./../schemas/student.schema";

// GET /student/materials
// Lists materials for a given batch and subject
const getMaterials = AsyncHandler(async (req, res) => {
  const { data, success } = getMaterialsQuerySchema.safeParse(req.query);
  if (!success || !data) {
    throw new ApiError(400, "Invalid query parameters");
  }
  // Filter by batch and subject; pagination is optional
  const materials = await MaterialModel.find({
    batch: data.batch,
    subject: data.subject,
  });

  return new ApiResponse(
    200,
    {
      materials,
    },
    "Materials fetched successfully"
  ).send(res);
});

export { getMaterials };
//ROUTINE DETAILS

//SUBJECT DETAILS

//ASSIGNMENT DETAILS

//RESULT DETAILS

//SUBJECT DETAILS

// NOTICE DETAILS
import { assignmentUpload } from "../middlewares/multer.middleware";
import { uploadOnCloudinary } from "../libs/cloudinary.lib";
import { SubmissionAssignmentModel } from "../models/submissionAssignment.model";
import {
  createSubmissionAssignmentSchema,
  getSubmissionsQuerySchema,
  gradeSubmissionAssignmentSchema,
} from "../schemas/student.schema";
import { Types } from "mongoose";

// POST /student/submit-assignment (multipart)
// Uploads a file to Cloudinary and creates a submission tied to the assignment and student
const submitAssignment = [
  assignmentUpload,
  AsyncHandler(async (req, res) => {
    if (!req.user) {
      throw new ApiError(400, "User not found");
    }

    // Validate assignment id in body
    const { data, success } = createSubmissionAssignmentSchema.safeParse(
      req.body
    );

    if (!success || !data) {
      throw new ApiError(400, "Invalid request body");
    }

    // Require uploaded file
    const file = req.file;
    if (!file) {
      throw new ApiError(400, "Please upload a file");
    }

    // Upload to Cloudinary
    const uploaded = await uploadOnCloudinary(file.path);
    if (!uploaded || !uploaded.public_id || !uploaded.url) {
      throw new ApiError(400, "File upload failed");
    }

    // Persist submission document
    const submission = await SubmissionAssignmentModel.create({
      assignment: new Types.ObjectId(data.assignment),
      student: req.user._id,
      file: {
        public_id: uploaded.public_id,
        url: uploaded.url,
      },
      read: false,
      marksObtained: 0,
    });

    return new ApiResponse(201, { submission }, "Submission uploaded").send(
      res
    );
  }),
];

// GET /student/submissions
// Lists the authenticated student's submissions, optionally filtered by assignment
const listMySubmissions = AsyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(400, "User not found");
  }

  const { data, success } = getSubmissionsQuerySchema.safeParse(req.query);
  if (!success || !data) {
    throw new ApiError(400, "Invalid query parameters");
  }

  const query: any = { student: req.user._id };
  if (data.assignment) query.assignment = new Types.ObjectId(data.assignment);

  const submissions = await SubmissionAssignmentModel.find(query)
    .populate("assignment")
    .lean();

  return new ApiResponse(200, { submissions }, "Submissions fetched").send(res);
});

export { submitAssignment, listMySubmissions };
