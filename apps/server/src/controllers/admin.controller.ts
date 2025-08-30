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
} from "../schemas/admin.schema";
import { SubjectModel } from "../models/subject.model";
import { AssignmentModel } from "../models/assignment.model";
import { MaterialModel } from "../models/material.model";
import { RoutineModel } from "../models/routine.model";
import { ResultModel } from "../models/result.model";
import { NoticeModel } from "../models/notice.model";

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
  createTeacher,
  updateTeacher,
  getAllTeachers,
  getTeacherDetails,
  changeTeacherStatus,
  createSubject,
  updateSubject,
  getAllSubjects,
  getSubjectDetails,
  createAssignment,
  updateAssignment,
  getAllAssignments,
  getAssignmentDetails,
  createMaterial,
  updateMaterial,
  getAllMaterials,
  getMaterialDetails,
  createRoutine,
  updateRoutine,
  getAllRoutines,
  getRoutineDetails,
  createResult,
  updateResult,
  getAllResults,
  getResultDetails,
  createNotice,
  updateNotice,
  getAllNotices,
  getNoticeDetails,
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
const createTeacher = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.TEACHER_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const { data, success } = createTeacherSchema.safeParse(req.body);

  if (!success || !data) {
    throw new ApiError(400, "All Fields Are required");
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

  const teacher = await UserModel.create({
    name: data.name,
    secretId: data.secretId,
    dateOfBirth: new Date(data.dateOfBirth).toISOString(),
    gender: data.gender,
    role: UserRole.TEACHER,
    phoneNumber: data.phoneNumber,
    address: data.address,
    bloodGroup: data.bloodGroup,
    email: data.email,
    password: hashedPassword.data,
    createdBy: req.user._id,
  });

  return new ApiResponse(
    201,
    {
      teacher,
    },
    "Teacher created successfully"
  ).send(res);
});

const updateTeacher = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.TEACHER_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const teacherId = req.params.teacherId;
  if (!teacherId) {
    throw new ApiError(400, "Teacher not found");
  }

  const { data, success } = updateTeacherSchema.safeParse(req.body);

  if (!success || !data) {
    throw new ApiError(400, "Atleast one field is required to update");
  }

  const teacher = await UserModel.findById(teacherId);

  if (!teacher || teacher.role !== UserRole.TEACHER) {
    throw new ApiError(400, "Teacher not found");
  }

  const updatedTeacher = await UserModel.findByIdAndUpdate(
    teacherId,
    {
      $set: {
        ...data,
        ...(data.dateOfBirth && {
          dateOfBirth: new Date(data.dateOfBirth).toISOString(),
        }),
      },
    },
    { new: true }
  );

  return new ApiResponse(
    200,
    {
      teacher: updatedTeacher,
    },
    "Teacher updated successfully"
  ).send(res);
});

const getAllTeachers = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.TEACHER_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const { data, success } = getAllTeachersSchema.safeParse(req.query);

  if (!success || !data) {
    throw new ApiError(400, "Invalid query parameters");
  }

  const query: any = { role: UserRole.TEACHER };

  if (data.onlyActive !== undefined) {
    query.isActive = data.onlyActive;
  }

  const teachers = await UserModel.find(query)
    .select("-password -emailVerificationToken -emailVerificationExpiry")
    .skip((data.page - 1) * data.limit)
    .limit(data.limit)
    .lean();

  const totalTeachers = await UserModel.countDocuments(query);

  return new ApiResponse(
    200,
    {
      teachers,
      totalTeachers,
    },
    "Teachers fetched successfully"
  ).send(res);
});

const getTeacherDetails = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.TEACHER_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const teacherId = req.params.teacherId;
  if (!teacherId) {
    throw new ApiError(400, "Teacher not found");
  }

  const teacher = await UserModel.findById(teacherId)
    .select("-password -emailVerificationToken -emailVerificationExpiry")
    .lean();

  if (!teacher || teacher.role !== UserRole.TEACHER) {
    throw new ApiError(400, "Teacher not found");
  }

  return new ApiResponse(
    200,
    {
      teacher,
    },
    "Teacher details fetched successfully"
  ).send(res);
});

const changeTeacherStatus = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.TEACHER_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const teacherId = req.params.teacherId;
  if (!teacherId) {
    throw new ApiError(400, "Teacher not found");
  }

  const teacher = await UserModel.findById(teacherId);

  if (!teacher || teacher.role !== UserRole.TEACHER) {
    throw new ApiError(400, "Teacher not found");
  }

  teacher.isActive = !teacher.isActive;
  await teacher.save();

  return new ApiResponse(
    200,
    {
      teacher,
    },
    `Teacher ${teacher.isActive ? "activated" : "deactivated"} successfully`
  ).send(res);
});

//SUBJECT ACCESS
const createSubject = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.SUBJECT_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const { data, success } = createSubjectSchema.safeParse(req.body);

  if (!success || !data) {
    throw new ApiError(400, "All Fields Are required");
  }

  const subject = await SubjectModel.create({
    subjectCode: data.subjectCode,
    subjectName: data.subjectName,
    department: data.department,
    semester: data.semester,
    subjectType: data.subjectType,
    credits: data.credits,
    assignedTeacher: data.assignedTeacher
      ? new Types.ObjectId(data.assignedTeacher)
      : undefined,
  });

  return new ApiResponse(
    201,
    {
      subject,
    },
    "Subject created successfully"
  ).send(res);
});

const updateSubject = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.SUBJECT_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const subjectId = req.params.subjectId;
  if (!subjectId) {
    throw new ApiError(400, "Subject not found");
  }

  const { data, success } = updateSubjectSchema.safeParse(req.body);

  if (!success || !data) {
    throw new ApiError(400, "Atleast one field is required to update");
  }

  const subject = await SubjectModel.findById(subjectId);

  if (!subject) {
    throw new ApiError(400, "Subject not found");
  }

  const updatedSubject = await SubjectModel.findByIdAndUpdate(
    subjectId,
    {
      $set: {
        ...data,
        ...(data.assignedTeacher && {
          assignedTeacher: new Types.ObjectId(data.assignedTeacher),
        }),
      },
    },
    { new: true }
  );

  return new ApiResponse(
    200,
    {
      subject: updatedSubject,
    },
    "Subject updated successfully"
  ).send(res);
});

const getAllSubjects = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.SUBJECT_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const { data, success } = getAllSubjectsSchema.safeParse(req.query);

  if (!success || !data) {
    throw new ApiError(400, "Invalid query parameters");
  }

  const query: any = { department: data.department };

  if (data.semester) {
    query.semester = data.semester;
  }

  const subjects = await SubjectModel.find(query)
    .populate("assignedTeacher", "name secretId")
    .skip((data.page - 1) * data.limit)
    .limit(data.limit)
    .lean();

  const totalSubjects = await SubjectModel.countDocuments(query);

  return new ApiResponse(
    200,
    {
      subjects,
      totalSubjects,
    },
    "Subjects fetched successfully"
  ).send(res);
});

const getSubjectDetails = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.SUBJECT_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const subjectId = req.params.subjectId;
  if (!subjectId) {
    throw new ApiError(400, "Subject not found");
  }

  const subject = await SubjectModel.findById(subjectId)
    .populate("assignedTeacher", "name secretId")
    .lean();

  if (!subject) {
    throw new ApiError(400, "Subject not found");
  }

  return new ApiResponse(
    200,
    {
      subject,
    },
    "Subject details fetched successfully"
  ).send(res);
});

//ASSIGNMENT ACCESS
const createAssignment = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.ASSIGNMENT_MONITOR_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const { data, success } = createAssignmentSchema.safeParse(req.body);

  if (!success || !data) {
    throw new ApiError(400, "All Fields Are required");
  }

  const batch = await BatchModel.findById(data.batch);
  if (!batch) {
    throw new ApiError(400, "Batch not found");
  }

  const subject = await SubjectModel.findById(data.subject);
  if (!subject) {
    throw new ApiError(400, "Subject not found");
  }

  const assignment = await AssignmentModel.create({
    batch: new Types.ObjectId(data.batch),
    subject: new Types.ObjectId(data.subject),
    title: data.title,
    description: data.description,
    dueDate: new Date(data.dueDate),
    marks: data.marks,
    givenBy: req.user._id,
  });

  return new ApiResponse(
    201,
    {
      assignment,
    },
    "Assignment created successfully"
  ).send(res);
});

const updateAssignment = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.ASSIGNMENT_MONITOR_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const assignmentId = req.params.assignmentId;
  if (!assignmentId) {
    throw new ApiError(400, "Assignment not found");
  }

  const { data, success } = updateAssignmentSchema.safeParse(req.body);

  if (!success || !data) {
    throw new ApiError(400, "Atleast one field is required to update");
  }

  const assignment = await AssignmentModel.findById(assignmentId);

  if (!assignment) {
    throw new ApiError(400, "Assignment not found");
  }

  const updatedAssignment = await AssignmentModel.findByIdAndUpdate(
    assignmentId,
    {
      $set: {
        ...data,
        ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
      },
    },
    { new: true }
  );

  return new ApiResponse(
    200,
    {
      assignment: updatedAssignment,
    },
    "Assignment updated successfully"
  ).send(res);
});

const getAllAssignments = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.ASSIGNMENT_MONITOR_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const { data, success } = getAllAssignmentsSchema.safeParse(req.query);

  if (!success || !data) {
    throw new ApiError(400, "Invalid query parameters");
  }

  const query: any = {};

  if (data.batch) {
    query.batch = new Types.ObjectId(data.batch);
  }

  if (data.subject) {
    query.subject = new Types.ObjectId(data.subject);
  }

  const assignments = await AssignmentModel.find(query)
    .populate("batch", "name")
    .populate("subject", "subjectName subjectCode")
    .populate("givenBy", "name")
    .skip((data.page - 1) * data.limit)
    .limit(data.limit)
    .lean();

  const totalAssignments = await AssignmentModel.countDocuments(query);

  return new ApiResponse(
    200,
    {
      assignments,
      totalAssignments,
    },
    "Assignments fetched successfully"
  ).send(res);
});

const getAssignmentDetails = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.ASSIGNMENT_MONITOR_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const assignmentId = req.params.assignmentId;
  if (!assignmentId) {
    throw new ApiError(400, "Assignment not found");
  }

  const assignment = await AssignmentModel.findById(assignmentId)
    .populate("batch", "name")
    .populate("subject", "subjectName subjectCode")
    .populate("givenBy", "name")
    .populate("submissions")
    .lean();

  if (!assignment) {
    throw new ApiError(400, "Assignment not found");
  }

  return new ApiResponse(
    200,
    {
      assignment,
    },
    "Assignment details fetched successfully"
  ).send(res);
});

//MATERIAL ACCESS
const createMaterial = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.SUBJECT_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const { data, success } = createMaterialSchema.safeParse(req.body);

  if (!success || !data) {
    throw new ApiError(400, "All Fields Are required");
  }

  const batch = await BatchModel.findById(data.batch);
  if (!batch) {
    throw new ApiError(400, "Batch not found");
  }

  const subject = await SubjectModel.findById(data.subject);
  if (!subject) {
    throw new ApiError(400, "Subject not found");
  }

  const material = await MaterialModel.create({
    batch: new Types.ObjectId(data.batch),
    subject: new Types.ObjectId(data.subject),
    title: data.title,
    description: data.description,
    materialUrl: data.materialUrl,
  });

  return new ApiResponse(
    201,
    {
      material,
    },
    "Material created successfully"
  ).send(res);
});

const updateMaterial = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.SUBJECT_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const materialId = req.params.materialId;
  if (!materialId) {
    throw new ApiError(400, "Material not found");
  }

  const { data, success } = updateMaterialSchema.safeParse(req.body);

  if (!success || !data) {
    throw new ApiError(400, "Atleast one field is required to update");
  }

  const material = await MaterialModel.findById(materialId);

  if (!material) {
    throw new ApiError(400, "Material not found");
  }

  const updatedMaterial = await MaterialModel.findByIdAndUpdate(
    materialId,
    {
      $set: data,
    },
    { new: true }
  );

  return new ApiResponse(
    200,
    {
      material: updatedMaterial,
    },
    "Material updated successfully"
  ).send(res);
});

const getAllMaterials = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.SUBJECT_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const { data, success } = getAllMaterialsSchema.safeParse(req.query);

  if (!success || !data) {
    throw new ApiError(400, "Invalid query parameters");
  }

  const query: any = {};

  if (data.batch) {
    query.batch = new Types.ObjectId(data.batch);
  }

  if (data.subject) {
    query.subject = new Types.ObjectId(data.subject);
  }

  const materials = await MaterialModel.find(query)
    .populate("batch", "name")
    .populate("subject", "subjectName subjectCode")
    .skip((data.page - 1) * data.limit)
    .limit(data.limit)
    .lean();

  const totalMaterials = await MaterialModel.countDocuments(query);

  return new ApiResponse(
    200,
    {
      materials,
      totalMaterials,
    },
    "Materials fetched successfully"
  ).send(res);
});

const getMaterialDetails = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.SUBJECT_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const materialId = req.params.materialId;
  if (!materialId) {
    throw new ApiError(400, "Material not found");
  }

  const material = await MaterialModel.findById(materialId)
    .populate("batch", "name")
    .populate("subject", "subjectName subjectCode")
    .lean();

  if (!material) {
    throw new ApiError(400, "Material not found");
  }

  return new ApiResponse(
    200,
    {
      material,
    },
    "Material details fetched successfully"
  ).send(res);
});

//ROUTINE ACCESS
const createRoutine = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.ROUTINE_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const { data, success } = createRoutineSchema.safeParse(req.body);

  if (!success || !data) {
    throw new ApiError(400, "All Fields Are required");
  }

  const batch = await BatchModel.findById(data.batch);
  if (!batch) {
    throw new ApiError(400, "Batch not found");
  }

  const subject = await SubjectModel.findById(data.subject);
  if (!subject) {
    throw new ApiError(400, "Subject not found");
  }

  const routine = await RoutineModel.create({
    batch: new Types.ObjectId(data.batch),
    subject: new Types.ObjectId(data.subject),
    day: data.day,
    shift: data.shift,
    semester: data.semester,
    createdBy: req.user._id,
  });

  return new ApiResponse(
    201,
    {
      routine,
    },
    "Routine created successfully"
  ).send(res);
});

const updateRoutine = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.ROUTINE_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const routineId = req.params.routineId;
  if (!routineId) {
    throw new ApiError(400, "Routine not found");
  }

  const { data, success } = updateRoutineSchema.safeParse(req.body);

  if (!success || !data) {
    throw new ApiError(400, "Atleast one field is required to update");
  }

  const routine = await RoutineModel.findById(routineId);

  if (!routine) {
    throw new ApiError(400, "Routine not found");
  }

  const updatedRoutine = await RoutineModel.findByIdAndUpdate(
    routineId,
    {
      $set: {
        ...data,
        ...(data.subject && { subject: new Types.ObjectId(data.subject) }),
      },
    },
    { new: true }
  );

  return new ApiResponse(
    200,
    {
      routine: updatedRoutine,
    },
    "Routine updated successfully"
  ).send(res);
});

const getAllRoutines = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.ROUTINE_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const { data, success } = getAllRoutinesSchema.safeParse(req.query);

  if (!success || !data) {
    throw new ApiError(400, "Invalid query parameters");
  }

  const query: any = {};

  if (data.batch) {
    query.batch = new Types.ObjectId(data.batch);
  }

  if (data.subject) {
    query.subject = new Types.ObjectId(data.subject);
  }

  if (data.day) {
    query.day = data.day;
  }

  const routines = await RoutineModel.find(query)
    .populate("batch", "name")
    .populate("subject", "subjectName subjectCode")
    .populate("createdBy", "name")
    .skip((data.page - 1) * data.limit)
    .limit(data.limit)
    .lean();

  const totalRoutines = await RoutineModel.countDocuments(query);

  return new ApiResponse(
    200,
    {
      routines,
      totalRoutines,
    },
    "Routines fetched successfully"
  ).send(res);
});

const getRoutineDetails = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.ROUTINE_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const routineId = req.params.routineId;
  if (!routineId) {
    throw new ApiError(400, "Routine not found");
  }

  const routine = await RoutineModel.findById(routineId)
    .populate("batch", "name")
    .populate("subject", "subjectName subjectCode")
    .populate("createdBy", "name")
    .lean();

  if (!routine) {
    throw new ApiError(400, "Routine not found");
  }

  return new ApiResponse(
    200,
    {
      routine,
    },
    "Routine details fetched successfully"
  ).send(res);
});

//RESULT ACCESS
const createResult = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.RESULT_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const { data, success } = createResultSchema.safeParse(req.body);

  if (!success || !data) {
    throw new ApiError(400, "All Fields Are required");
  }

  const subject = await SubjectModel.findById(data.subject);
  if (!subject) {
    throw new ApiError(400, "Subject not found");
  }

  const student = await UserModel.findById(data.student);
  if (!student || student.role !== UserRole.STUDENT) {
    throw new ApiError(400, "Student not found");
  }

  const result = await ResultModel.create({
    subject: new Types.ObjectId(data.subject),
    student: new Types.ObjectId(data.student),
    pointsAchived: data.pointsAchived,
    createdBy: req.user._id,
  });

  return new ApiResponse(
    201,
    {
      result,
    },
    "Result created successfully"
  ).send(res);
});

const updateResult = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.RESULT_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const resultId = req.params.resultId;
  if (!resultId) {
    throw new ApiError(400, "Result not found");
  }

  const { data, success } = updateResultSchema.safeParse(req.body);

  if (!success || !data) {
    throw new ApiError(400, "Atleast one field is required to update");
  }

  const result = await ResultModel.findById(resultId);

  if (!result) {
    throw new ApiError(400, "Result not found");
  }

  const updatedResult = await ResultModel.findByIdAndUpdate(
    resultId,
    {
      $set: data,
    },
    { new: true }
  );

  return new ApiResponse(
    200,
    {
      result: updatedResult,
    },
    "Result updated successfully"
  ).send(res);
});

const getAllResults = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.RESULT_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const { data, success } = getAllResultsSchema.safeParse(req.query);

  if (!success || !data) {
    throw new ApiError(400, "Invalid query parameters");
  }

  const query: any = {};

  if (data.subject) {
    query.subject = new Types.ObjectId(data.subject);
  }

  if (data.student) {
    query.student = new Types.ObjectId(data.student);
  }

  const results = await ResultModel.find(query)
    .populate("subject", "subjectName subjectCode")
    .populate("student", "name secretId")
    .populate("createdBy", "name")
    .skip((data.page - 1) * data.limit)
    .limit(data.limit)
    .lean();

  const totalResults = await ResultModel.countDocuments(query);

  return new ApiResponse(
    200,
    {
      results,
      totalResults,
    },
    "Results fetched successfully"
  ).send(res);
});

const getResultDetails = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.RESULT_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const resultId = req.params.resultId;
  if (!resultId) {
    throw new ApiError(400, "Result not found");
  }

  const result = await ResultModel.findById(resultId)
    .populate("subject", "subjectName subjectCode")
    .populate("student", "name secretId")
    .populate("createdBy", "name")
    .lean();

  if (!result) {
    throw new ApiError(400, "Result not found");
  }

  return new ApiResponse(
    200,
    {
      result,
    },
    "Result details fetched successfully"
  ).send(res);
});

//NOTICE ACCESS
const createNotice = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.NOTICE_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const { data, success } = createNoticeSchema.safeParse(req.body);

  if (!success || !data) {
    throw new ApiError(400, "All Fields Are required");
  }

  const notice = await NoticeModel.create({
    title: data.title,
    description: data.description,
    date: new Date(data.date),
    department: data.department,
    semester: data.semester,
    attachments: data.attachments || [],
    createdBy: req.user._id,
  });

  return new ApiResponse(
    201,
    {
      notice,
    },
    "Notice created successfully"
  ).send(res);
});

const updateNotice = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.NOTICE_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const noticeId = req.params.noticeId;
  if (!noticeId) {
    throw new ApiError(400, "Notice not found");
  }

  const { data, success } = updateNoticeSchema.safeParse(req.body);

  if (!success || !data) {
    throw new ApiError(400, "Atleast one field is required to update");
  }

  const notice = await NoticeModel.findById(noticeId);

  if (!notice) {
    throw new ApiError(400, "Notice not found");
  }

  const updatedNotice = await NoticeModel.findByIdAndUpdate(
    noticeId,
    {
      $set: {
        ...data,
        ...(data.date && { date: new Date(data.date) }),
      },
    },
    { new: true }
  );

  return new ApiResponse(
    200,
    {
      notice: updatedNotice,
    },
    "Notice updated successfully"
  ).send(res);
});

const getAllNotices = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.NOTICE_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const { data, success } = getAllNoticesSchema.safeParse(req.query);

  if (!success || !data) {
    throw new ApiError(400, "Invalid query parameters");
  }

  const query: any = {};

  if (data.department) {
    query.department = data.department;
  }

  if (data.semester) {
    query.semester = data.semester;
  }

  const notices = await NoticeModel.find(query)
    .populate("createdBy", "name")
    .skip((data.page - 1) * data.limit)
    .limit(data.limit)
    .lean();

  const totalNotices = await NoticeModel.countDocuments(query);

  return new ApiResponse(
    200,
    {
      notices,
      totalNotices,
    },
    "Notices fetched successfully"
  ).send(res);
});

const getNoticeDetails = AsyncHandler(async (req, res) => {
  if (
    !req.user ||
    req.user.role !== UserRole.ADMIN ||
    !req.user.adminAccess.includes(AdminAccess.NOTICE_ACCESS)
  ) {
    throw new ApiError(400, "You aren't allowed to access this");
  }

  const noticeId = req.params.noticeId;
  if (!noticeId) {
    throw new ApiError(400, "Notice not found");
  }

  const notice = await NoticeModel.findById(noticeId)
    .populate("createdBy", "name")
    .lean();

  if (!notice) {
    throw new ApiError(400, "Notice not found");
  }

  return new ApiResponse(
    200,
    {
      notice,
    },
    "Notice details fetched successfully"
  ).send(res);
});
