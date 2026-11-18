import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  explanation: { type: String, required: true, trim: true, maxlength: 1500 },
  estimatedMinutes: { type: Number, min: 5, max: 600, default: 45 },
  exercises: [{ type: String, trim: true, maxlength: 400 }],
  miniProject: { type: String, trim: true, maxlength: 600, default: '' },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
});

const phaseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, required: true, trim: true, maxlength: 800 },
  estimatedHours: { type: Number, min: 1, max: 200, default: 8 },
  topics: {
    type: [topicSchema],
    validate: {
      validator: (topics) => topics.length > 0 && topics.length <= 12,
      message: 'A phase must have between 1 and 12 topics',
    },
  },
});

const roadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 1200 },
    learningGoal: { type: String, trim: true, maxlength: 300, default: '' },
    language: { type: String, trim: true, maxlength: 80, default: '' },
    skillLevel: { type: String, trim: true, maxlength: 40, default: '' },
    phases: {
      type: [phaseSchema],
      validate: {
        validator: (phases) => phases.length > 0 && phases.length <= 12,
        message: 'A roadmap must have between 1 and 12 phases',
      },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

roadmapSchema.index({ userId: 1, isActive: 1, createdAt: -1 });

export const Roadmap = mongoose.model('Roadmap', roadmapSchema);
