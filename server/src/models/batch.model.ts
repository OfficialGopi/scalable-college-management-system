import { Document, model, Schema, Types } from "mongoose";
import { Department, Semester } from "../types/types";

interface IBatch extends Document {
  name: string;
  department: (typeof Department)[keyof typeof Department];
  startingYear: Date;
  currentSemester: (typeof Semester)[keyof typeof Semester];
  isResultsPublished: boolean;
  isCompleted: boolean;
  createdBy: Types.ObjectId;
  subjects: Types.ObjectId[];
}

const batchSchema = new Schema<IBatch>(
  {
    name: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      enum: Object.values(Department),
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
  },
  {
    timestamps: true,
  }
);

const BatchModel = model<IBatch>("batches", batchSchema);

export { BatchModel, type IBatch };
