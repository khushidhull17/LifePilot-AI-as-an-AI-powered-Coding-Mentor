import { Router } from 'express';
import { changePassword, getProfile, updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { changePasswordSchema, updateProfileSchema } from '../utils/schemas.js';

const router = Router();

router.use(protect);
router.get('/me', getProfile);
router.patch('/me', validate({ body: updateProfileSchema }), updateProfile);
router.patch('/me/password', validate({ body: changePasswordSchema }), changePassword);

export default router;
