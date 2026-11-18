import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getProfile = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'name',
    'skillLevel',
    'preferredLanguage',
    'dailyStudyTime',
    'learningGoal',
    'onboardingCompleted',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      req.user[field] = req.body[field];
    }
  });

  await req.user.save();
  res.json({ user: req.user });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!user) throw new ApiError(404, 'Account not found.', 'USER_NOT_FOUND');

  const valid = await user.comparePassword(currentPassword);
  if (!valid) {
    throw new ApiError(401, 'Your current password is incorrect.', 'INVALID_PASSWORD');
  }

  user.password = newPassword;
  await user.save();

  res.json({ message: 'Password updated successfully.' });
});
