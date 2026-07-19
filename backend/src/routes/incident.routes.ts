import { Router } from 'express';
import { incidentController } from '../controllers/incident.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createLostChildSchema,
  createMedicalIncidentSchema,
  updateIncidentStatusSchema,
  incidentFiltersSchema,
} from '../validators/incident.validator';
import { USER_ROLES } from '../constants';

const router = Router();

// All routes require authentication
router.use(authenticate);

// General incidents — all authenticated roles
router.get('/', validate(incidentFiltersSchema), incidentController.getAll);
router.get('/stats', incidentController.getStats);
router.get('/:id', incidentController.getById);

// Status update — all roles can update their own, organizer/security/admin can update any
router.put('/:id/status', validate(updateIncidentStatusSchema), incidentController.updateStatus);

// Assignment — only organizer, security, admin
router.put(
  '/:id/assign',
  authorize(USER_ROLES.ADMIN, USER_ROLES.ORGANIZER, USER_ROLES.SECURITY),
  incidentController.assign
);

// Lost child — all roles can report, security has additional access
router.post('/lost-child', validate(createLostChildSchema), incidentController.createLostChild);
router.get('/lost-child/active', incidentController.getLostChildCases);
router.post('/lost-child/announcements', incidentController.generateAnnouncements);

// Medical — all roles can report, only medical/organizer/admin can view all
router.post(
  '/medical',
  validate(createMedicalIncidentSchema),
  incidentController.createMedicalIncident
);
router.get(
  '/medical/active',
  authorize(USER_ROLES.ADMIN, USER_ROLES.ORGANIZER, USER_ROLES.MEDICAL),
  incidentController.getMedicalEmergencies
);

export default router;
