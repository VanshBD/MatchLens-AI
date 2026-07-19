import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { USER_ROLES } from '../constants';

const router = Router();

router.use(authenticate);

// Admin only
router.get('/', authorize(USER_ROLES.ADMIN), userController.getAll);
router.get('/audit-logs', authorize(USER_ROLES.ADMIN), userController.getAuditLogs);
router.get('/:id', authorize(USER_ROLES.ADMIN), userController.getById);
router.put('/:id/role', authorize(USER_ROLES.ADMIN), userController.updateRole);
router.put('/:id/toggle-active', authorize(USER_ROLES.ADMIN), userController.toggleActive);

export default router;
