import { asyncHandler } from '../utils/asyncHandler.js';
import { deleteChat, getChat, listChats, sendMentorMessage } from '../services/mentorService.js';
import { isAiConfigured } from '../config/env.js';

export const getChats = asyncHandler(async (req, res) => {
  const chats = await listChats(req.user._id);
  res.json({ chats, aiConfigured: isAiConfigured() });
});

export const getOneChat = asyncHandler(async (req, res) => {
  const chat = await getChat(req.user._id, req.params.chatId);
  res.json({ chat });
});

export const postMessage = asyncHandler(async (req, res) => {
  const chat = await sendMentorMessage(req.user, req.body);
  res.json({ chat });
});

export const removeChat = asyncHandler(async (req, res) => {
  await deleteChat(req.user._id, req.params.chatId);
  res.json({ message: 'Conversation deleted.' });
});
