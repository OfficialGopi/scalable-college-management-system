import { AcademicDetailsModel } from "../models/academicDetails.model";
import { IBatch } from "../models/batch.model";
import { MaterialModel } from "../models/material.model";
import { UserModel, IUser } from "../models/user.model";
import { AsyncHandler } from "../utils/async-handler.util";
import { ApiError, ApiResponse } from "../utils/response-formatter.util";
import { RoutineModel } from "../models/routine.model";
import { SubjectModel } from "../models/subject.model";
import { AssignmentModel } from "../models/assignment.model";
import { ResultModel } from "../models/result.model";
import { NoticeModel } from "../models/notice.model";
import { SubmissionAssignmentModel } from "../models/submissionAssignment.model";
import {
  getMaterialsQuerySchema,
  submitAssignmentSchema,
  updateProfileSchema,
} from "./../schemas/student.schema";

//STUDENT DETAILS
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
    "Batch details fetched successfully"
  ).send(res);
});

export { getStudentBatchDetails };

//MATERIAL DETAILS
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
const getStudentRoutine = AsyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(400, "Student not found");
  }

  const userId = req.user._id;

  // Get student's academic details to find batch
  const student = await AcademicDetailsModel.findOne({
    student: userId,
  }).select("batch");

  if (!student) {
    throw new ApiError(400, "Student not found");
  }

  // Get routine for the student's batch
  const routine = await RoutineModel.find({
    batch: student.batch,
  })
    .populate("subject", "subjectName subjectCode")
    .populate("createdBy", "name secretId")
    .lean();

  return new ApiResponse(
    200,
    {
      routine,
    },
    "Routine fetched successfully"
  ).send(res);
});

export { getStudentRoutine };

//SUBJECT DETAILS
const getStudentSubjects = AsyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(400, "Student not found");
  }

  const userId = req.user._id;

  // Get student's academic details to find batch
  const student = await AcademicDetailsModel.findOne({
    student: userId,
  }).select("batch department");

  if (!student) {
    throw new ApiError(400, "Student not found");
  }

  // Get subjects for the student's batch and department
  const subjects = await SubjectModel.find({
    batches: student.batch,
    department: student.department,
  })
    .populate("assignedTeacher", "name secretId")
    .lean();

  return new ApiResponse(
    200,
    {
      subjects,
    },
    "Subjects fetched successfully"
  ).send(res);
});

export { getStudentSubjects };

//ASSIGNMENT DETAILS
const getStudentAssignments = AsyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(400, "Student not found");
  }

  const userId = req.user._id;

  // Get student's academic details to find batch
  const student = await AcademicDetailsModel.findOne({
    student: userId,
  }).select("batch");

  if (!student) {
    throw new ApiError(400, "Student not found");
  }

  // Get assignments for the student's batch
  const assignments = await AssignmentModel.find({
    batch: student.batch,
  })
    .populate("subject", "subjectName subjectCode")
    .populate("givenBy", "name secretId")
    .lean();

  return new ApiResponse(
    200,
    {
      assignments,
    },
    "Assignments fetched successfully"
  ).send(res);
});

export { getStudentAssignments };

//SUBMIT ASSIGNMENT
const submitAssignment = AsyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(400, "Student not found");
  }

  const userId = req.user._id;

  const { data, success } = submitAssignmentSchema.safeParse(req.body);
  if (!success || !data) {
    throw new ApiError(400, "Invalid request data");
  }

  const { assignmentId, file } = data;

  // Check if assignment exists and is not closed
  const assignment = await AssignmentModel.findById(assignmentId);
  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  if (assignment.isClosed) {
    throw new ApiError(400, "Assignment is closed for submission");
  }

  // Check if student has already submitted
  const existingSubmission = await SubmissionAssignmentModel.findOne({
    assignment: assignmentId,
    student: userId,
  });

  if (existingSubmission) {
    throw new ApiError(400, "Assignment already submitted");
  }

  // Create submission
  const submission = await SubmissionAssignmentModel.create({
    assignment: assignmentId,
    student: userId,
    file,
    read: false,
    marksObtained: 0,
  });

  return new ApiResponse(
    201,
    {
      submission,
    },
    "Assignment submitted successfully"
  ).send(res);
});

export { submitAssignment };

//GET ASSIGNMENT SUBMISSION
const getAssignmentSubmission = AsyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(400, "Student not found");
  }

  const userId = req.user._id;
  const { assignmentId } = req.params;

  const submission = await SubmissionAssignmentModel.findOne({
    assignment: assignmentId,
    student: userId,
  }).populate("assignment", "title description dueDate marks");

  if (!submission) {
    throw new ApiError(404, "Submission not found");
  }

  return new ApiResponse(
    200,
    {
      submission,
    },
    "Submission fetched successfully"
  ).send(res);
});

export { getAssignmentSubmission };

//RESULT DETAILS
const getStudentResults = AsyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(400, "Student not found");
  }

  const userId = req.user._id;

  // Get results for the student
  const results = await ResultModel.find({
    student: userId,
  })
    .populate("subject", "subjectName subjectCode credits")
    .populate("createdBy", "name secretId")
    .lean();

  return new ApiResponse(
    200,
    {
      results,
    },
    "Results fetched successfully"
  ).send(res);
});

export { getStudentResults };

//GET SPECIFIC SUBJECT RESULT
const getSubjectResult = AsyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(400, "Student not found");
  }

  const userId = req.user._id;
  const { subjectId } = req.params;

  const result = await ResultModel.findOne({
    student: userId,
    subject: subjectId,
  })
    .populate("subject", "subjectName subjectCode credits")
    .populate("createdBy", "name secretId")
    .lean();

  if (!result) {
    throw new ApiError(404, "Result not found for this subject");
  }

  return new ApiResponse(
    200,
    {
      result,
    },
    "Subject result fetched successfully"
  ).send(res);
});

export { getSubjectResult };

//NOTICE DETAILS
const getStudentNotices = AsyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(400, "Student not found");
  }

  const userId = req.user._id;

  // Get student's academic details to find department
  const student = await AcademicDetailsModel.findOne({
    student: userId,
  }).select("department");

  if (!student) {
    throw new ApiError(400, "Student not found");
  }

  // Get notices for the student's department
  const notices = await NoticeModel.find({
    department: student.department,
  })
    .populate("createdBy", "name secretId")
    .sort({ date: -1 })
    .lean();

  return new ApiResponse(
    200,
    {
      notices,
    },
    "Notices fetched successfully"
  ).send(res);
});

export { getStudentNotices };

//GET SPECIFIC NOTICE
const getNoticeDetails = AsyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(400, "Student not found");
  }

  const { noticeId } = req.params;

  const notice = await NoticeModel.findById(noticeId)
    .populate("createdBy", "name secretId")
    .lean();

  if (!notice) {
    throw new ApiError(404, "Notice not found");
  }

  return new ApiResponse(
    200,
    {
      notice,
    },
    "Notice details fetched successfully"
  ).send(res);
});

export { getNoticeDetails };

//GET STUDENT PROFILE
const getStudentProfile = AsyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(400, "Student not found");
  }

  const userId = req.user._id;

  const student = await AcademicDetailsModel.findOne({
    student: userId,
  })
    .populate(
      "student",
      "name secretId email phoneNumber address bloodGroup gender dateOfBirth profileImage"
    )
    .populate("batch", "name startingYear currentSemester")
    .lean();

  if (!student) {
    throw new ApiError(400, "Student not found");
  }

  return new ApiResponse(
    200,
    {
      student,
    },
    "Student profile fetched successfully"
  ).send(res);
});

export { getStudentProfile };

//UPDATE STUDENT PROFILE
const updateStudentProfile = AsyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(400, "Student not found");
  }

  const userId = req.user._id;

  const { data, success } = updateProfileSchema.safeParse(req.body);
  if (!success || !data) {
    throw new ApiError(400, "Invalid request data");
  }

  const { name, phoneNumber, address } = data;

  const updateData: any = {};
  if (name) updateData.name = name;
  if (phoneNumber) updateData.phoneNumber = phoneNumber;
  if (address) updateData.address = address;

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "No fields to update");
  }

  const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, {
    new: true,
  }).select("name phoneNumber address");

  if (!updatedUser) {
    throw new ApiError(400, "Failed to update profile");
  }

  return new ApiResponse(
    200,
    {
      user: updatedUser,
    },
    "Profile updated successfully"
  ).send(res);
});

export { updateStudentProfile };
