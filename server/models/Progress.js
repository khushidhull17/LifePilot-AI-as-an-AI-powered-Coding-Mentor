import mongoose from 'mongoose';

const completedTopicSchema = new mongoose.Schema(
  {
    roadmapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', required: true },
    topicId: { type: mongoose.Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    phaseTitle: { type: String, default: '' },
    estimatedMinutes: { type: Number, default: 30 },
    completedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const completedChallengeSchema = new mongoose.Schema(
  {
    challengeId: { type: String, required: true },
    title: { type: String, required: true },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    score: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'topic_completed',
        'topic_reopened',
        'challenge_completed',
        'roadmap_generated',
        'projects_generated',
        'mentor_session',
        'agent_action',
      ],
      required: true,
    },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 500 },
    minutes: { type: Number, default: 0, min: 0, max: 600 },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    completedTopics: [completedTopicSchema],
    completedChallenges: [completedChallengeSchema],
    totalScore: { type: Number, default: 0, min: 0 },
    learningStreak: { type: Number, default: 0, min: 0 },
    longestStreak: { type: Number, default: 0, min: 0 },
    lastActiveDate: { type: Date, default: null },
    activities: [activitySchema],
  },
  { timestamps: true }
);

export const Progress = mongoose.model('Progress', progressSchema);
