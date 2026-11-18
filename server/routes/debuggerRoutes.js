import { Router } from 'express';
import { analyze } from '../controllers/debuggerController.js';
import { protect } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { debuggerSchema } from '../utils/schemas.js';

const router = Router();

router.use(protect);
router.post('/analyze', aiLimiter, validate({ body: debuggerSchema }), analyze);

export default router;
