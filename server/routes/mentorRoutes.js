import { Router } from 'express';
import {
  getChats,
  getOneChat,
  postMessage,
  removeChat,
} from '../controllers/mentorController.js';
import { protect } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { chatParamsSchema, mentorChatSchema } from '../utils/schemas.js';

const router = Router();

router.use(protect);
router.get('/chats', getChats);
router.get('/chats/:chatId', validate({ params: chatParamsSchema }), getOneChat);
router.post('/chat', aiLimiter, validate({ body: mentorChatSchema }), postMessage);
router.delete('/chats/:chatId', validate({ params: chatParamsSchema }), removeChat);

export default router;
