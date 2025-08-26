import { Document, model, Schema, Types } from "mongoose";
import { Day, RoutineShift, Semester } from "../types/types";

interface IRoutine extends Document {
  batch: Types.ObjectId;
  subject: Types.ObjectId;
  day: (typeof Day)[keyof typeof Day];
  shift: (typeof RoutineShift)[keyof typeof RoutineShift];
  semester: (typeof Semester)[keyof typeof Semester];
  createdBy: Types.ObjectId;
}

const routineSchema = new Schema<IRoutine>(
  {
    batch: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "batches",
    },
    subject: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "subjects",
    },
    day: {
      type: String,
      required: true,
      enum: Object.values(Day),
    },
    shift: {
      type: String,
      required: true,
      enum: Object.values(RoutineShift),
    },
    semester: {
      type: String,
      required: true,
      enum: Object.values(Semester),
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
  },
  {
    timestamps: true,
  }
);

const RoutineModel = model<IRoutine>("routines", routineSchema);

export { RoutineModel, type IRoutine };
