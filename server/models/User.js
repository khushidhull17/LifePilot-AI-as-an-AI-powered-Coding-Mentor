import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const SKILL_LEVELS = ['absolute-beginner', 'beginner', 'intermediate'];
export const LANGUAGES = [
  'HTML, CSS & JavaScript',
  'Python',
  'Java',
  'C',
  'C++',
  'React.js',
  'Full Stack Web Development',
];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      maxlength: [72, 'Password cannot exceed 72 characters'],
      select: false,
    },
    skillLevel: {
      type: String,
      enum: SKILL_LEVELS,
      default: 'absolute-beginner',
    },
    preferredLanguage: {
      type: String,
      enum: LANGUAGES,
      default: 'HTML, CSS & JavaScript',
    },
    dailyStudyTime: {
      type: Number,
      min: [15, 'Daily study time must be at least 15 minutes'],
      max: [480, 'Daily study time cannot exceed 480 minutes'],
      default: 60,
    },
    learningGoal: {
      type: String,
      trim: true,
      maxlength: [300, 'Learning goal cannot exceed 300 characters'],
      default: '',
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function toSafeUser() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

export const User = mongoose.model('User', userSchema);
