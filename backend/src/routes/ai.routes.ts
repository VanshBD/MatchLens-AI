import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { aiRateLimit } from '../middlewares/rateLimit.middleware';
import { z } from 'zod';
import { validate } from '../middlewares/validate.middleware';
import { USER_ROLES } from '../constants';

const router = Router();

// All AI routes require auth and rate limiting
router.use(authenticate);
router.use(aiRateLimit);

const textSchema = z.object({ body: z.object({ description: z.string().min(5) }) });
const requestSchema = z.object({ body: z.object({ request: z.string().min(5) }) });
const translateSchema = z.object({
  body: z.object({
    text: z.string().min(1),
    fromLang: z.string().length(2),
    toLang: z.string().length(2),
  }),
});
const chatSchema = z.object({
  body: z.object({
    message: z.string().min(1),
    moduleType: z.string().min(1),
    chatId: z.string().optional(),
  }),
});

// Lost child AI — all roles
router.post('/lost-child/analyze', validate(textSchema), aiController.analyzeLostChild);

// Medical AI — all roles
router.post('/medical/analyze', validate(textSchema), aiController.analyzeMedical);

// Crowd AI — all roles
router.post('/crowd/analyze', validate(textSchema), aiController.analyzeCrowd);

// Accessibility — all roles
router.post('/accessibility/assist', validate(requestSchema), aiController.accessibilityAssist);

// Translation — all roles
router.post('/translate', validate(translateSchema), aiController.translate);
router.post(
  '/translate/all',
  validate(z.object({ body: z.object({ text: z.string().min(1) }) })),
  aiController.translateAll
);

// Summarizer — organizer, security, medical, admin
router.post(
  '/summarize',
  authorize(USER_ROLES.ADMIN, USER_ROLES.ORGANIZER, USER_ROLES.SECURITY, USER_ROLES.MEDICAL),
  validate(z.object({ body: z.object({ conversation: z.string().min(10) }) })),
  aiController.summarizeIncident
);

// Knowledge Q&A — all roles
router.post(
  '/knowledge',
  validate(z.object({ body: z.object({ question: z.string().min(5) }) })),
  aiController.queryKnowledge
);

// Chat — all roles
router.post('/chat', validate(chatSchema), aiController.chat);

export default router;
