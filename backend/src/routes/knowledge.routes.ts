import { Router } from 'express';
import { knowledgeController } from '../controllers/knowledge.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { USER_ROLES } from '../constants';
import { z } from 'zod';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

const createKbSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(300),
    content: z.string().min(20),
    category: z.enum([
      'stadium_sop',
      'emergency_procedure',
      'volunteer_handbook',
      'accessibility_guide',
      'fifa_rules',
      'general',
    ]),
    tags: z.array(z.string()).optional(),
  }),
});

router.use(authenticate);

router.get('/', knowledgeController.getAll);
router.get('/:id', knowledgeController.getById);

// Admin/Organizer can manage knowledge base
router.post(
  '/',
  authorize(USER_ROLES.ADMIN, USER_ROLES.ORGANIZER),
  validate(createKbSchema),
  knowledgeController.create
);
router.put(
  '/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.ORGANIZER),
  knowledgeController.update
);
router.delete(
  '/:id',
  authorize(USER_ROLES.ADMIN),
  knowledgeController.remove
);

export default router;
