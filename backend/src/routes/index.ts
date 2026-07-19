import { Router } from 'express';
import authRoutes from './auth.routes';
import incidentRoutes from './incident.routes';
import aiRoutes from './ai.routes';
import userRoutes from './user.routes';
import knowledgeRoutes from './knowledge.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/incidents', incidentRoutes);
router.use('/ai', aiRoutes);
router.use('/users', userRoutes);
router.use('/knowledge', knowledgeRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'MatchLens AI API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

export default router;
