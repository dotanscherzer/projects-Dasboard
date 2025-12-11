import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  name: string;
  code: string;
  description?: string;
  owner: string;
  status: 'active' | 'paused' | 'deprecated';
  lifecycleStage: 'idea' | 'planned' | 'in_development' | 'ready_for_deploy' | 'live' | 'maintenance' | 'on_hold';
  priority: 'low' | 'medium' | 'high';
  nextAction?: string;
  targetReleaseDate?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    owner: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'deprecated'],
      default: 'active',
    },
    lifecycleStage: {
      type: String,
      enum: ['idea', 'planned', 'in_development', 'ready_for_deploy', 'live', 'maintenance', 'on_hold'],
      default: 'idea',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    nextAction: {
      type: String,
      required: false,
      trim: true,
    },
    targetReleaseDate: {
      type: Date,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProject>('Project', ProjectSchema);

