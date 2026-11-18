import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signToken } from '../middleware/auth.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists. Please log in.', 'EMAIL_IN_USE');
  }

  const user = await User.create({ name, email, password });
  const token = signToken(user._id);

  res.status(201).json({ token, user });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  const valid = user ? await user.comparePassword(password) : false;

  if (!valid) {
    throw new ApiError(401, 'Email or password is incorrect.', 'INVALID_CREDENTIALS');
  }

  const token = signToken(user._id);
  user.password = undefined;

  res.json({ token, user });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
