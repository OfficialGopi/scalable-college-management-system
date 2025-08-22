import { Document, model, Schema } from "mongoose";

interface ISubmissionAssignment extends Document {
  assignment: Schema.Types.ObjectId;
  student: Schema.Types.ObjectId;
  file: {
    public_id: string;
    url: string;
  };
  read: boolean;
  marksObtained: number;
}

const submissionAssignmentSchema = new Schema<ISubmissionAssignment>(
  {
    assignment: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "assignments",
    },
    student: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    file: {
      type: {
        public_id: String,
        url: String,
      },
    },
    read: {
      type: Boolean,
      required: true,
      default: false,
    },
    marksObtained: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const SubmissionAssignmentModel = model<ISubmissionAssignment>(
  "submissionAssignments",
  submissionAssignmentSchema
);

export { SubmissionAssignmentModel, type ISubmissionAssignment };
