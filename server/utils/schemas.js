import { z } from 'zod';

export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Invalid identifier');

export const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(60),
    email: z.string().trim().toLowerCase().email().max(160),
    password: z.string().min(8).max(72),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1).max(72),
  })
  .strict();

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(60).optional(),
    skillLevel: z.enum(['absolute-beginner', 'beginner', 'intermediate']).optional(),
    preferredLanguage: z
      .enum([
        'HTML, CSS & JavaScript',
        'Python',
        'Java',
        'C',
        'C++',
        'React.js',
        'Full Stack Web Development',
      ])
      .optional(),
    dailyStudyTime: z.coerce.number().int().min(15).max(480).optional(),
    learningGoal: z.string().trim().max(300).optional(),
    onboardingCompleted: z.boolean().optional(),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(72),
    newPassword: z.string().min(8).max(72),
  })
  .strict();

export const generateRoadmapSchema = z
  .object({
    goal: z.string().trim().max(300).optional(),
    language: z.string().trim().max(80).optional(),
    skillLevel: z.enum(['absolute-beginner', 'beginner', 'intermediate']).optional(),
    focus: z.string().trim().max(300).optional(),
  })
  .strict()
  .default({});

export const updateTopicSchema = z
  .object({
    completed: z.boolean(),
  })
  .strict();

export const mentorChatSchema = z
  .object({
    chatId: objectIdSchema.optional(),
    message: z.string().trim().min(1).max(4000),
  })
  .strict();

export const debuggerSchema = z
  .object({
    code: z.string().trim().min(1).max(12_000),
    language: z.string().trim().min(1).max(60),
    errorMessage: z.string().trim().max(4000).optional().default(''),
    question: z.string().trim().max(500).optional().default(''),
  })
  .strict();

export const recommendProjectsSchema = z
  .object({
    count: z.coerce.number().int().min(1).max(3).optional().default(3),
  })
  .strict()
  .default({});

export const agentRunSchema = z
  .object({
    message: z.string().trim().min(1).max(1000),
  })
  .strict();

export const agentConfirmSchema = z
  .object({
    actionId: objectIdSchema,
  })
  .strict();

export const idParamSchema = z.object({ id: objectIdSchema }).strict();

export const roadmapTopicParamsSchema = z.object({ topicId: objectIdSchema });
export const chatParamsSchema = z.object({ chatId: objectIdSchema });
export const agentRunParamsSchema = z.object({ runId: objectIdSchema });
export const challengeParamsSchema = z.object({
  challengeId: z.string().trim().min(2).max(100),
});

export const practiceQuerySchema = z
  .object({
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    topic: z.string().trim().max(80).optional(),
    language: z.string().trim().max(80).optional(),
  })
  .strict();

/* ---------- Shapes expected from Gemini ---------- */

const aiTopicSchema = z.object({
  title: z.string().trim().min(3).max(160),
  explanation: z.string().trim().min(20).max(1500),
  estimatedMinutes: z.coerce.number().min(5).max(600).transform((value) => Math.round(value)).default(45),
  exercises: z.array(z.string().trim().min(3).max(400)).max(8).default([]),
  miniProject: z.string().trim().max(600).optional().default(''),
});

const aiPhaseSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(10).max(800),
  estimatedHours: z.coerce.number().min(1).max(200).transform((value) => Math.round(value)).default(8),
  topics: z.array(aiTopicSchema).min(1).max(12),
});

export const roadmapPlanSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(20).max(1200),
  phases: z.array(aiPhaseSchema).min(1).max(12),
});

export const debuggerAnalysisSchema = z.object({
  whatIsWrong: z.string().trim().min(5).max(2000),
  whyItHappened: z.string().trim().min(5).max(2000),
  howToFix: z.string().trim().min(5).max(2500),
  correctedCode: z.string().trim().min(1).max(12_000),
  prevention: z.string().trim().min(5).max(2000),
});

export const projectListSchema = z.object({
  projects: z
    .array(
      z.object({
        title: z.string().trim().min(3).max(160),
        description: z.string().trim().min(20).max(1200),
        difficulty: z.string().trim().max(40).default('beginner'),
        estimatedTime: z.string().trim().max(80).default(''),
        skills: z.array(z.string().trim().min(1).max(80)).min(1).max(10),
        features: z.array(z.string().trim().min(3).max(300)).min(2).max(12),
        steps: z.array(z.string().trim().min(3).max(500)).min(3).max(15),
      })
    )
    .min(1)
    .max(3),
});

export const saveRoadmapArgsSchema = roadmapPlanSchema;
export const updateTopicArgsSchema = z.object({
  topicId: objectIdSchema,
  completed: z.boolean(),
});
