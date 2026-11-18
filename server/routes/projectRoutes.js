import { Router } from 'express';
import { getLatest, recommend } from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { recommendProjectsSchema } from '../utils/schemas.js';

const router = Router();

router.use(protect);
router.get('/latest', getLatest);
router.post('/recommend', aiLimiter, validate({ body: recommendProjectsSchema }), recommend);

export default router;
