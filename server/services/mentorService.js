import { Chat } from '../models/Chat.js';
import { generateChatReply } from './geminiService.js';
import { mentorSystemPrompt } from './prompts.js';
import { getActiveRoadmap } from './roadmapService.js';
import { computeRoadmapStats } from '../utils/roadmap.js';
import { ApiError } from '../utils/ApiError.js';
import { recordMilestone } from './progressService.js';

const MAX_HISTORY_MESSAGES = 20;

export async function listChats(userId) {
  const chats = await Chat.find({ userId })
    .sort({ lastMessageAt: -1 })
    .select('title messages lastMessageAt createdAt')
    .lean();

  return chats.map((chat) => {
    const last = chat.messages[chat.messages.length - 1];
    return {
      id: chat._id,
      title: chat.title,
      messageCount: chat.messages.length,
      lastMessage: last?.content?.slice(0, 140) || '',
      lastMessageAt: chat.lastMessageAt,
      createdAt: chat.createdAt,
    };
  });
}

export async function getChat(userId, chatId) {
  const chat = await Chat.findOne({ _id: chatId, userId });
  if (!chat) throw new ApiError(404, 'Chat not found.', 'CHAT_NOT_FOUND');
  return chat;
}

export async function deleteChat(userId, chatId) {
  const chat = await Chat.findOneAndDelete({ _id: chatId, userId });
  if (!chat) throw new ApiError(404, 'Chat not found.', 'CHAT_NOT_FOUND');
}

export async function sendMentorMessage(user, { chatId, message }) {
  let chat = chatId ? await getChat(user._id, chatId) : null;
  const isNewChat = !chat;

  if (!chat) {
    chat = new Chat({
      userId: user._id,
      title: message.length > 70 ? `${message.slice(0, 67)}...` : message,
      messages: [],
    });
  }

  const history = chat.messages.slice(-MAX_HISTORY_MESSAGES).map((item) => ({
    role: item.role,
    content: item.content,
  }));

  const roadmap = await getActiveRoadmap(user._id);
  const stats = computeRoadmapStats(roadmap);

  const systemInstruction = `${mentorSystemPrompt(user)}

Current roadmap context:
- Active roadmap: ${roadmap ? roadmap.title : 'not generated yet'}
- Progress: ${stats.completedTopics}/${stats.totalTopics} topics complete (${stats.completionPercent}%)
- Next suggested topic: ${stats.nextTopic?.title || 'generate a roadmap first'}`;

  const reply = await generateChatReply({
    systemInstruction,
    history,
    message,
  });

  chat.messages.push({ role: 'user', content: message });
  chat.messages.push({ role: 'assistant', content: reply });
  chat.lastMessageAt = new Date();
  await chat.save();

  if (isNewChat) {
    await recordMilestone(user._id, {
      type: 'mentor_session',
      title: 'Asked the AI mentor a question',
      description: chat.title,
      minutes: 10,
    });
  }

  return chat;
}
