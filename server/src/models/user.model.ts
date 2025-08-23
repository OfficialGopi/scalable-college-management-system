import { Document, model, Schema, Types } from "mongoose";
import { AdminAccess, BloodGroup, Gender, UserRole } from "../types/types";

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  dateOfBirth: Date;
  role: (typeof UserRole)[keyof typeof UserRole];
  gender: (typeof Gender)[keyof typeof Gender];
  bloodGroup: (typeof BloodGroup)[keyof typeof BloodGroup];
  isFirstLogin: boolean;
  phoneNumber: string;
  address: string;
  profileImage: {
    public_id: string;
    url: string;
  };
  isActive: boolean;
  adminAccess: (typeof AdminAccess)[keyof typeof AdminAccess][];
  sessions: Types.ObjectId[];
  assignedSubject: Types.ObjectId;
  subjectsCreated: Types.ObjectId[];
  isEmailVerified: boolean;
  emailVerificationToken: string;
  emailVerificationExpiry: Date;
  createdBy: Types.ObjectId;
  studentsAcademicDetails: Types.ObjectId[];
  routinesCreated: Types.ObjectId[];
  batchesCreated: Types.ObjectId[];
  results: Types.ObjectId[];
  resultsCreated: Types.ObjectId[];
  noticesCreated: Types.ObjectId[];
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpiry: {
      type: Date,
    },
    password: {
      type: String,
      required: true,
    },
    isFirstLogin: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.STUDENT,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: Object.values(Gender),
    },
    phoneNumber: {
      type: String,
      required: true,
      maxLength: 10,
      minlength: 10,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    profileImage: {
      type: {
        public_id: String,
        url: String,
      },
    },
    bloodGroup: {
      type: String,
      required: true,
    },
    adminAccess: {
      type: [String],
      default: [],
      enum: Object.values(AdminAccess),
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    //RELATIONS
    sessions: {
      type: [Schema.Types.ObjectId],
      default: [],
      ref: "sessions",
    },
    assignedSubject: {
      type: Schema.Types.ObjectId,
      default: [],
      ref: "subjects",
    },
    subjectsCreated: {
      type: [Schema.Types.ObjectId],
      default: [],
      ref: "subjects",
    },
    studentsAcademicDetails: {
      type: [Schema.Types.ObjectId],
      default: [],
      ref: "academicDetails",
    },
    batchesCreated: {
      type: [Schema.Types.ObjectId],
      default: [],
      ref: "batches",
    },
    routinesCreated: {
      type: [Schema.Types.ObjectId],
      default: [],
      ref: "routines",
    },
    results: {
      type: [Schema.Types.ObjectId],
      default: [],
      ref: "results",
    },
    resultsCreated: {
      type: [Schema.Types.ObjectId],
      default: [],
      ref: "results",
    },
    noticesCreated: {
      type: [Schema.Types.ObjectId],
      default: [],
      ref: "notices",
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = model<IUser>("users", userSchema);

export { UserModel, type IUser };
