import { Router } from 'express';
import {
  getChallenges,
  getOneChallenge,
  markChallengeComplete,
} from '../controllers/practiceController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { challengeParamsSchema, practiceQuerySchema } from '../utils/schemas.js';

const router = Router();

router.use(protect);
router.get('/', validate({ query: practiceQuerySchema }), getChallenges);
router.get('/:challengeId', validate({ params: challengeParamsSchema }), getOneChallenge);
router.post(
  '/:challengeId/complete',
  validate({ params: challengeParamsSchema }),
  markChallengeComplete
);

export default router;
