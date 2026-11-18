import mongoose from 'mongoose';

const pendingActionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ['saveRoadmap', 'updateTopicStatus'],
      required: true,
    },
    args: { type: mongoose.Schema.Types.Mixed, required: true },
    summary: { type: String, default: '', maxlength: 500 },
    status: {
      type: String,
      enum: ['pending', 'applied', 'dismissed', 'failed'],
      default: 'pending',
    },
    result: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { _id: true }
);

const agentRunSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    input: { type: String, required: true, maxlength: 2000 },
    output: { type: String, default: '', maxlength: 10_000 },
    steps: { type: Number, default: 0, min: 0 },
    toolTrace: [{ type: String, maxlength: 200 }],
    pendingActions: [pendingActionSchema],
    status: {
      type: String,
      enum: ['completed', 'awaiting_confirmation'],
      default: 'completed',
    },
  },
  { timestamps: true }
);

agentRunSchema.index({ userId: 1, createdAt: -1 });

export const AgentRun = mongoose.model('AgentRun', agentRunSchema);
