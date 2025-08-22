import { Document, model, Schema } from "mongoose";

interface IResult extends Document {
  subject: Schema.Types.ObjectId;
  student: Schema.Types.ObjectId;
  pointsAchived: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  createdBy: Schema.Types.ObjectId;
}

const resultSchema = new Schema<IResult>(
  {
    subject: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "subjects",
    },
    student: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    pointsAchived: {
      type: Number,
      required: true,
      enum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
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

const ResultModel = model<IResult>("results", resultSchema);

export { ResultModel, type IResult };
