import { Router } from 'express';
import {
  createRoadmap,
  getRoadmap,
  updateTopic,
} from '../controllers/roadmapController.js';
import { protect } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import {
  generateRoadmapSchema,
  roadmapTopicParamsSchema,
  updateTopicSchema,
} from '../utils/schemas.js';

const router = Router();

router.use(protect);
router.get('/', getRoadmap);
router.post(
  '/generate',
  aiLimiter,
  validate({ body: generateRoadmapSchema }),
  createRoadmap
);
router.patch(
  '/topics/:topicId',
  validate({ params: roadmapTopicParamsSchema, body: updateTopicSchema }),
  updateTopic
);

export default router;
