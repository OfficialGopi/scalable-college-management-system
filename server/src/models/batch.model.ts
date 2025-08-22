import { Document, model, Schema } from "mongoose";
import { Semester } from "../types/types";

interface IBatch extends Document {
  name: string;
  department: string;
  startingYear: Date;
  currentSemester: (typeof Semester)[keyof typeof Semester];
  isResultsPublished: boolean;
  isCompleted: boolean;
  createdBy: Schema.Types.ObjectId;
  academicDetailsOfTheStudents: Schema.Types.ObjectId[];
  subjects: Schema.Types.ObjectId[];
}

const batchSchema = new Schema<IBatch>(
  {
    name: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    startingYear: {
      type: Date,
      required: true,
    },
    currentSemester: {
      type: String,
      required: true,
      enum: Object.values(Semester),
    },
    isResultsPublished: {
      type: Boolean,
      required: true,
      default: false,
    },
    isCompleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    subjects: {
      type: [Schema.Types.ObjectId],
      required: true,
      ref: "subjects",
    },
    //RELATIONS
    academicDetailsOfTheStudents: {
      type: [Schema.Types.ObjectId],
      required: true,
      ref: "academicDetails",
    },
  },
  {
    timestamps: true,
  }
);

const BatchModel = model<IBatch>("batches", batchSchema);

export { BatchModel, type IBatch };
