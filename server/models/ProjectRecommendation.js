import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 160 },
    description: { type: String, required: true, maxlength: 1200 },
    difficulty: { type: String, default: 'beginner', maxlength: 40 },
    estimatedTime: { type: String, default: '', maxlength: 80 },
    skills: [{ type: String, maxlength: 80 }],
    features: [{ type: String, maxlength: 300 }],
    steps: [{ type: String, maxlength: 500 }],
  },
  { _id: false }
);

const recommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    context: {
      language: { type: String, default: '' },
      skillLevel: { type: String, default: '' },
      completedTopics: [{ type: String }],
    },
    projects: [projectSchema],
  },
  { timestamps: true }
);

recommendationSchema.index({ userId: 1, createdAt: -1 });

export const ProjectRecommendation = mongoose.model('ProjectRecommendation', recommendationSchema);
