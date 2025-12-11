import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMetric extends Document {
  serviceId: Types.ObjectId;
  metricName: string; // e.g., health, response_time_ms, deploy_status, db_health, automation_status, automation_duration_ms
  metricValue: string | number | object;
  collectedAt: Date;
}

const MetricSchema = new Schema<IMetric>(
  {
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
      index: true,
    },
    metricName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    metricValue: {
      type: Schema.Types.Mixed,
      required: true,
    },
    collectedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// Index for efficient querying
MetricSchema.index({ serviceId: 1, metricName: 1, collectedAt: -1 });

export default mongoose.model<IMetric>('Metric', MetricSchema);

