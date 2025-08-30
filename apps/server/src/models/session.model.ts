import { Document, model, Schema, Types } from "mongoose";

interface ISession extends Document {
  user: Types.ObjectId;
  expiresAt: Date;
  refreshToken: string;
}

const sessionSchema = new Schema<ISession>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    refreshToken: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const SessionModel = model<ISession>("sessions", sessionSchema);

export { SessionModel, type ISession };
