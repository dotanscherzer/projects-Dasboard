import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IWorkItem extends Document {
  projectId: Types.ObjectId;
  title: string;
  type: 'dev' | 'automation' | 'infra' | 'content' | 'other';
  status: 'todo' | 'in_progress' | 'blocked' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  blockedBy?: Types.ObjectId; // Self-reference to another WorkItem
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkItemSchema = new Schema<IWorkItem>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['dev', 'automation', 'infra', 'content', 'other'],
      required: true,
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'blocked', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
    },
    blockedBy: {
      type: Schema.Types.ObjectId,
      ref: 'WorkItem',
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

// Index for efficient querying
WorkItemSchema.index({ projectId: 1, status: 1 });
WorkItemSchema.index({ blockedBy: 1 });

export default mongoose.model<IWorkItem>('WorkItem', WorkItemSchema);

