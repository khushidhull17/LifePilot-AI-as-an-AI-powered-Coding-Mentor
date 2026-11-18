import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import roadmapRoutes from './roadmapRoutes.js';
import mentorRoutes from './mentorRoutes.js';
import debuggerRoutes from './debuggerRoutes.js';
import practiceRoutes from './practiceRoutes.js';
import progressRoutes from './progressRoutes.js';
import projectRoutes from './projectRoutes.js';
import agentRoutes from './agentRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roadmap', roadmapRoutes);
router.use('/mentor', mentorRoutes);
router.use('/debugger', debuggerRoutes);
router.use('/practice', practiceRoutes);
router.use('/progress', progressRoutes);
router.use('/projects', projectRoutes);
router.use('/agent', agentRoutes);

export default router;
