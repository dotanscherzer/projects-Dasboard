import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEnvVar extends Document {
  serviceId: Types.ObjectId;
  key: string;
  value: string;
  isSecret: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EnvVarSchema = new Schema<IEnvVar>(
  {
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
      index: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
    },
    isSecret: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
EnvVarSchema.index({ serviceId: 1, key: 1 }, { unique: true });

export default mongoose.model<IEnvVar>('EnvVar', EnvVarSchema);

