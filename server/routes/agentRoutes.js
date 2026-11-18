import { Router } from 'express';
import { confirm, dismiss, getRun, run } from '../controllers/agentController.js';
import { protect } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { agentConfirmSchema, agentRunParamsSchema, agentRunSchema } from '../utils/schemas.js';

const router = Router();

router.use(protect);
router.post('/run', aiLimiter, validate({ body: agentRunSchema }), run);
router.get('/runs/:runId', validate({ params: agentRunParamsSchema }), getRun);
router.post(
  '/runs/:runId/confirm',
  validate({ params: agentRunParamsSchema, body: agentConfirmSchema }),
  confirm
);
router.post(
  '/runs/:runId/dismiss',
  validate({ params: agentRunParamsSchema, body: agentConfirmSchema }),
  dismiss
);

export default router;
