import { Document, model, Schema } from "mongoose";
import { Department, StudentStatus } from "../types/types";

interface IAcademicDetails extends Document {
  student: Schema.Types.ObjectId;
  batch: Schema.Types.ObjectId;
  department: (typeof Department)[keyof typeof Department];
  status: (typeof StudentStatus)[keyof typeof StudentStatus];
}

const academicDetailsSchema = new Schema<IAcademicDetails>(
  {
    student: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    batch: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "batches",
    },
    department: {
      type: String,
      required: true,
      enum: Object.values(Department),
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(StudentStatus),
      default: StudentStatus.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

const AcademicDetailsModel = model<IAcademicDetails>(
  "academicDetails",
  academicDetailsSchema
);

export { AcademicDetailsModel, type IAcademicDetails };
