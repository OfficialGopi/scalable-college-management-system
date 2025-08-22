import { Document, model, Schema } from "mongoose";

interface IAssignment extends Document {
  batch: Schema.Types.ObjectId;
  subject: Schema.Types.ObjectId;
  title: string;
  description: string;
  dueDate: Date;
  isClosed: boolean;
  marks: number;
  givenBy: Schema.Types.ObjectId;
  submissions: Schema.Types.ObjectId;
}
const assignmentSchema = new Schema<IAssignment>(
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
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    isClosed: {
      type: Boolean,
      required: true,
      default: false,
    },
    marks: {
      type: Number,
      required: true,
    },
    givenBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    //RELATION
    submissions: {
      type: [Schema.Types.ObjectId],
      ref: "submissionAssignments",
    },
  },
  {
    timestamps: true,
  }
);

const AssignmentModel = model<IAssignment>("assignments", assignmentSchema);

export { AssignmentModel, type IAssignment };
