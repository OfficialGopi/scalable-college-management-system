import { Types } from "mongoose";
import { hashPassword } from "../helpers/bcrypt.helper";
import {
  AcademicDetailsModel,
  IAcademicDetails,
} from "../models/academicDetails.model";
import { BatchModel } from "../models/batch.model";
import { IUser, UserModel } from "../models/user.model";
import { AdminAccess, Department, Semester, UserRole } from "../types/types";
import { AsyncHandler } from "../utils/async-handler.util";
import { ApiError, ApiResponse } from "../utils/response-formatter.util";
import {
  createBatchSchema,
  createStudentSchema,
  getAllBatchesQuerySchema,
  getAllStudentsSchema,
  updateBatchSchema,
  updateStudentSchema,
} from "../schemas/admin.schema";
import { SubjectModel } from "../models/subject.model";

//STUDENT ACCESS
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

//BATCH ACCESS
const createBatch = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.BATCH_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const { data, success } = createBatchSchema.safeParse(req.body);

  if (!success || !data) {
    throw new ApiError(400, "All Fields Are required");
  }
  let promises = [];
  for (const department of Object.values(Department)) {
    const subjects = await SubjectModel.find({
      department: department,
      semester: data.currentSemester,
    })
      .select("_id")
      .lean();

    promises.push(
      BatchModel.create({
        name: data.name,
        startingYear: new Date(data.startingYear).toISOString(),
        currentSemester: data.currentSemester,
        department: department,
        createdBy: req.user._id,
        subjects: subjects.map((subject) => subject._id),
      })
    );
  }

  await Promise.all(promises).catch((err) => {
    throw new ApiError(400, "Something went wrong");
  });

  return new ApiResponse(200, {}, "Batch created successfully").send(res);
});

const updateBatch = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.BATCH_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const batchId = req.params.batchId;
  if (!batchId) {
    throw new ApiError(400, "Batch not found");
  }

  const { data, success } = updateBatchSchema.safeParse(req.body);

  if (!success || !data) {
    throw new ApiError(400, "Atleast one field is required to update");
  }

  const batch = await BatchModel.findById(batchId);

  if (!batch) {
    throw new ApiError(400, "Batch not found");
  }

  const updatedBatch = await BatchModel.findByIdAndUpdate(
    {
      _id: batchId,
    },
    {
      $set: {
        ...data,
      },
    },
    {
      new: true,
    }
  );

  return new ApiResponse(
    200,
    {
      batch: updatedBatch,
    },
    "Batch updated successfully"
  ).send(res);
});

const getAllBatches = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.BATCH_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const { data, success } = getAllBatchesQuerySchema.safeParse(req.query);

  if (!success || !data) {
    throw new ApiError(400, "All Fields Are required");
  }

  const query: {
    department: (typeof Department)[keyof typeof Department];
    isCompleted?: boolean;
  } = {
    department: data.department,
  };
  if (!data.includeCompletedBatches) {
    query.isCompleted = false;
  }

  const batches = await BatchModel.find(query);

  const totalBatches = await BatchModel.countDocuments();

  return new ApiResponse(
    200,
    {
      batches,
      totalBatches,
    },
    "Batches fetched successfully"
  ).send(res);
});

const getBatchDetails = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.BATCH_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const batchId = req.params.batchId;
  if (!batchId) {
    throw new ApiError(400, "Batch not found");
  }

  const batch = await BatchModel.findById(batchId).populate("subjects");

  if (!batch) {
    throw new ApiError(400, "Batch not found");
  }

  return new ApiResponse(
    200,
    {
      batch,
    },
    "Batch details fetched successfully"
  ).send(res);
});

const promoteBatch = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.BATCH_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const batchId = req.params.batchId;
  if (!batchId) {
    throw new ApiError(400, "Batch not found");
  }

  const batch = await BatchModel.findById(batchId);

  if (!batch) {
    throw new ApiError(400, "Batch not found");
  }

  let newSemester;
  if (batch.currentSemester === Semester.FIRST) {
    newSemester = Semester.SECOND;
  } else if (batch.currentSemester === Semester.SECOND) {
    newSemester = Semester.THIRD;
  } else if (batch.currentSemester === Semester.THIRD) {
    newSemester = Semester.FOURTH;
  } else if (batch.currentSemester === Semester.FOURTH) {
    newSemester = Semester.FIFTH;
  } else if (batch.currentSemester === Semester.FIFTH) {
    newSemester = Semester.SIXTH;
  } else if (batch.currentSemester === Semester.SIXTH) {
    newSemester = Semester.SEVENTH;
  } else if (batch.currentSemester === Semester.SEVENTH) {
    newSemester = Semester.EIGHTH;
  } else {
    throw new ApiError(400, "Batch not found");
  }
  batch.currentSemester = newSemester;

  const subjects = await SubjectModel.find({
    department: batch.department,
    semester: newSemester,
  })
    .select("_id")
    .lean();

  const promotedBatch = BatchModel.findOneAndUpdate(
    {
      _id: batch._id,
    },
    {
      $set: {
        currentSemester: newSemester,
        subjects: [
          ...batch.subjects,
          ...subjects.map((subject) => subject._id as Types.ObjectId),
        ],
      },
    }
  );

  return new ApiResponse(
    200,
    {
      batch: promotedBatch,
    },
    "Batch promoted successfully"
  ).send(res);
});

const publishResultAndCompleteBatch = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.BATCH_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const batchId = req.params.batchId;
  if (!batchId) {
    throw new ApiError(400, "Batch not found");
  }

  const batch = await BatchModel.findById(batchId);

  if (!batch) {
    throw new ApiError(400, "Batch not found");
  }

  if (batch.currentSemester !== Semester.EIGHTH) {
    throw new ApiError(400, "Batch is not completed yet");
  }

  const completedBatch = await BatchModel.findOneAndUpdate(
    {
      _id: batch._id,
    },
    {
      $set: {
        isCompleted: true,
        isResultsPublished: true,
      },
    }
  );

  return new ApiResponse(
    200,
    {
      batch: completedBatch,
    },
    "Batch promoted successfully"
  ).send(res);
});

export {
  createBatch,
  updateBatch,
  getAllBatches,
  getBatchDetails,
  promoteBatch,
  publishResultAndCompleteBatch,
};

//TEACHER ACCESS

//SUBJECT ACCESS

//ASSIGNMENT ACCESS

//MATERIAL ACCESS

//ROUTINE ACCESS

//RESULT ACCESS

//NOTICE ACCESS
