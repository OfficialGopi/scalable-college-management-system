import { AcademicDetailsModel } from "../models/academicDetails.model";
import { IBatch } from "../models/batch.model";
import { MaterialModel } from "../models/material.model";
import { IUser } from "../models/user.model";
import { AsyncHandler } from "../utils/async-handler.util";
import { ApiError, ApiResponse } from "../utils/response-formatter.util";

//STUDETNT DETAILS
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

//BATCH DETAILS
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

//MATERIAL DETAILS
import { getMaterialsQuerySchema } from "./../schemas/student.schema";

const getMaterials = AsyncHandler(async (req, res) => {
  const { data, success } = getMaterialsQuerySchema.safeParse(req.query);
  if (!success || !data) {
    throw new ApiError(400, "Invalid query parameters");
  }
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

//NOTICE DETAILS
