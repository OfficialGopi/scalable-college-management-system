import { Document, model, Schema } from "mongoose";
import { Department, Semester } from "../types/types";

interface INotice extends Document {
  title: string;
  description: string;
  date: Date;
  attachments: {
    public_id: string;
    url: string;
  }[];
  createdBy: Schema.Types.ObjectId;
  department: (typeof Department)[keyof typeof Department];
  semster: (typeof Semester)[keyof typeof Semester];
}

const noticeSchema = new Schema<INotice>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    attachments: {
      type: [
        {
          public_id: String,
          url: String,
        },
      ],
      default: [],
    },
    department: {
      type: String,
      enum: Object.values(Department),
    },
    semster: {
      type: String,
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

const NoticeModel = model<INotice>("notices", noticeSchema);

export { NoticeModel, type INotice };
