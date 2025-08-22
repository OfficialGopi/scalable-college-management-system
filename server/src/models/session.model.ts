import { Document, model, Schema } from "mongoose";

interface ISession extends Document {
  user: Schema.Types.ObjectId;
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
    expiresAt: {
      type: Date,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const SessionModel = model<ISession>("sessions", sessionSchema);

export { SessionModel, type ISession };
