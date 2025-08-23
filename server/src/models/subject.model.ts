import { Document, model, Schema } from "mongoose";
import { Department, Semester, SubjectTypes } from "../types/types";
import { Types } from "mongoose";

interface ISubject extends Document {
  subjectCode: string;
  subjectName: string;
  department: (typeof Department)[keyof typeof Department];
  semester: (typeof Semester)[keyof typeof Semester];
  subjectType: (typeof SubjectTypes)[keyof typeof SubjectTypes];
  credits: number;
  isDeprecated: boolean;
  assignedTeacher: Schema.Types.ObjectId;
  routines: Types.ObjectId[];
  batches: Types.ObjectId[];
  results: Types.ObjectId[];
}

const subjectSchema = new Schema<ISubject>(
  {
    subjectCode: {
      type: String,
      required: true,
      unique: true,
    },
    subjectName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
      enum: Object.values(Department),
    },
    semester: {
      type: String,
      required: true,
      enum: Object.values(Semester),
    },
    subjectType: {
      type: String,
      required: true,
      enum: Object.values(SubjectTypes),
    },
    credits: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    isDeprecated: {
      type: Boolean,
      default: false,
    },
    assignedTeacher: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },

    //RELATIONS
    routines: {
      type: [Schema.Types.ObjectId],
      ref: "routines",
    },
    batches: {
      type: [Schema.Types.ObjectId],
      ref: "batches",
    },
    results: {
      type: [Schema.Types.ObjectId],
      ref: "results",
    },
  },
  {
    timestamps: true,
  }
);

const SubjectModel = model<ISubject>("subjects", subjectSchema);

export { SubjectModel, type ISubject };
