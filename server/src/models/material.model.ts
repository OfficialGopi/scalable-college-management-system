import { Document, model, Schema } from "mongoose";

interface IMaterial extends Document {
  batch: Schema.Types.ObjectId;
  subject: Schema.Types.ObjectId;
  title: string;
  description: string;
  materialUrl: {
    public_id: string;
    url: string;
  };
}

const MaterialSchema = new Schema<IMaterial>(
  {
    batch: {
      type: Schema.Types.ObjectId,
      ref: "batches",
      required: true,
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: "subjects",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    materialUrl: {
      type: {
        public_id: String,
        url: String,
      },
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const MaterialModel = model<IMaterial>("materials", MaterialSchema);

export { MaterialModel, type IMaterial };
