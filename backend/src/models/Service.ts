import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IService extends Document {
  projectId: Types.ObjectId;
  name: string;
  type: 'backend' | 'frontend' | 'db' | 'worker' | 'automation' | 'other';
  provider: 'render' | 'netlify' | 'mongodb_atlas' | 'make' | 'supabase' | 'other';
  providerInternalId: string; // Required unique identifier for querying services
  url?: string;
  dashboardUrl?: string;
  region?: string;
  status: 'unknown' | 'up' | 'down' | 'degraded' | 'ok' | 'failing' | 'stale';
  lastCheckedAt?: Date;
  lastDeployAt?: Date;
  // Automation fields
  lastRunAt?: Date;
  lastRunStatus?: 'success' | 'error' | null;
  expectedFrequencyMinutes?: number;
  providerStatus?: object; // Raw provider info
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['backend', 'frontend', 'db', 'worker', 'automation', 'other'],
      required: true,
    },
    provider: {
      type: String,
      enum: ['render', 'netlify', 'mongodb_atlas', 'make', 'supabase', 'other'],
      required: true,
    },
    providerInternalId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    url: {
      type: String,
      trim: true,
    },
    dashboardUrl: {
      type: String,
      trim: true,
    },
    region: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['unknown', 'up', 'down', 'degraded', 'ok', 'failing', 'stale'],
      default: 'unknown',
    },
    lastCheckedAt: {
      type: Date,
    },
    lastDeployAt: {
      type: Date,
    },
    // Automation fields
    lastRunAt: {
      type: Date,
    },
    lastRunStatus: {
      type: String,
      enum: ['success', 'error', null],
      default: null,
    },
    expectedFrequencyMinutes: {
      type: Number,
    },
    providerStatus: {
      type: Schema.Types.Mixed,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying by provider and providerInternalId
ServiceSchema.index({ provider: 1, providerInternalId: 1 }, { unique: true });
ServiceSchema.index({ projectId: 1 });

export default mongoose.model<IService>('Service', ServiceSchema);

