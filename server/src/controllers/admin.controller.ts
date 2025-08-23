import { Types } from "mongoose";
import { hashPassword } from "../helpers/bcrypt.helper";
import {
  AcademicDetailsModel,
  IAcademicDetails,
} from "../models/academicDetails.model";
import { BatchModel } from "../models/batch.model";
import { IUser, UserModel } from "../models/user.model";
import { AdminAccess, UserRole } from "../types/types";
import { AsyncHandler } from "../utils/async-handler.util";
import { ApiError, ApiResponse } from "../utils/response-formatter.util";
import {
  createStudentSchema,
  getAllStudentsSchema,
  updateStudentSchema,
} from "../schemas/admin.schema";

const createStudent = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.STUDENT_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const { data, success } = createStudentSchema.safeParse(req.body);

  if (!success || !data) {
    throw new ApiError(400, "All Fields Are required");
  }

  const batch = await BatchModel.findById(data.batch);
  if (!batch) {
    throw new ApiError(400, "Batch not found");
  }

  const hashedPassword = await hashPassword(
    `${
      new Date(data.dateOfBirth).getDate() +
      new Date(data.dateOfBirth).getMonth() +
      new Date(data.dateOfBirth).getFullYear()
    }`
  );

  if (!hashedPassword.success || !hashedPassword.data) {
    throw new ApiError(400, hashedPassword.message);
  }

  const user = new UserModel({
    name: data.name,
    secretId: data.secretId,
    dateOfBirth: new Date(data.dateOfBirth).toISOString(),
    gender: data.gender,
    role: UserRole.STUDENT,
    phoneNumber: data.phoneNumber,
    password: hashedPassword.data,
  });

  const student = new AcademicDetailsModel({
    student: user._id,
    batch: batch._id,
    department: data.department,
  });
  user.studentAcademicDetails = student._id as Types.ObjectId;

  await user.save();
  await student.save();

  return new ApiResponse(
    200,
    {
      user,
    },
    "User created successfully"
  ).send(res);
});

const updateStudent = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.STUDENT_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }
  const studentId = req.params.studentId;
  if (!studentId) {
    throw new ApiError(400, "Student not found");
  }

  const { data, success } = updateStudentSchema.safeParse(req.body);

  if (!success || !data) {
    throw new ApiError(400, "Atleast one field is required to update");
  }

  const user = (await UserModel.findById(studentId).populate(
    "studentAcademicDetails"
  )) as unknown as IUser & {
    studentAcademicDetails: IAcademicDetails;
  };

  if (!user || !user.studentAcademicDetails) {
    throw new ApiError(400, "User not found");
  }

  if (data.dateOfBirth) {
    user.dateOfBirth = new Date(data.dateOfBirth);
  }

  if (data.name) {
    user.name = data.name;
  }

  if (data.secretId) {
    user.secretId = data.secretId;
  }

  if (data.gender) {
    user.gender = data.gender;
  }

  if (data.phoneNumber) {
    user.phoneNumber = data.phoneNumber;
  }

  if (data.address) {
    user.address = data.address;
  }

  if (data.bloodGroup) {
    user.bloodGroup = data.bloodGroup;
  }

  if (data.department) {
    user.studentAcademicDetails.department = data.department;
  }

  if (data.batch) {
    user.studentAcademicDetails.batch = data.batch as unknown as Types.ObjectId;
  }

  await user.save();

  const updatedUser = await UserModel.findById(studentId).populate(
    "studentAcademicDetails"
  );

  return new ApiResponse(
    200,
    {
      user: updatedUser,
    },
    "Student updated successfully"
  ).send(res);
});

const getAllStudents = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.STUDENT_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const { data, success } = getAllStudentsSchema.safeParse(req.query);

  if (!success || !data) {
    throw new ApiError(400, "All Fields are required");
  }

  const students = await UserModel.aggregate([
    {
      $match: { role: UserRole.STUDENT }, // only students
    },
    {
      $lookup: {
        from: "academicDetails", // collection name for IAcademicDetails
        localField: "studentAcademicDetails",
        foreignField: "_id",
        as: "studentAcademicDetails",
      },
    },
    { $unwind: "$studentAcademicDetails" },
    {
      $match: {
        "studentAcademicDetails.department": data.department,
        "studentAcademicDetails.batch": data.batch,
      },
    },
    {
      $skip: (data.page - 1) * data.limit,
    },
    {
      $limit: data.limit,
    },
  ]);

  return new ApiResponse(
    200,
    {
      students,
    },
    "Students fetched successfully"
  ).send(res);
});

const getStudentDetails = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.STUDENT_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const studentId = req.params.studentId;
  if (!studentId) {
    throw new ApiError(400, "Student not found");
  }

  const student = await UserModel.findById(studentId).populate(
    "studentAcademicDetails"
  );

  if (!student) {
    throw new ApiError(400, "Student not found");
  }

  return new ApiResponse(
    200,
    {
      student,
    },
    "Student details fetched successfully"
  ).send(res);
});

const changeStudentStatus = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.STUDENT_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const studentId = req.params.studentId;
  if (!studentId) {
    throw new ApiError(400, "Student not found");
  }

  const student = await UserModel.findById(studentId, {
    password: 0,
    emailVerificationExpiry: 0,
    emailVerificationToken: 0,
  }).lean();

  if (!student) {
    throw new ApiError(400, "Student not found");
  }

  student.isActive = !student.isActive;

  await student.save();

  return new ApiResponse(
    200,
    {
      student,
    },
    "Student status changed successfully"
  ).send(res);
});
export {
  createStudent,
  updateStudent,
  getAllStudents,
  getStudentDetails,
  changeStudentStatus,
};
