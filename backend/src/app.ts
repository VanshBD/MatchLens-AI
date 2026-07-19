import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { logger } from './config/logger';
import { globalRateLimit } from './middlewares/rateLimit.middleware';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { requestId, sanitizeInput, additionalSecurityHeaders, securityLogger } from './middlewares/security.middleware';
import { responseTime } from './middlewares/performance.middleware';
import routes from './routes';

const app = express();

// ─── Request ID (must be first) ───────────────────────────────────────────────
app.use(requestId);

// ─── Performance monitoring ───────────────────────────────────────────────────
app.use(responseTime);

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // needed for Swagger UI
}));
app.use(additionalSecurityHeaders);
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:3001'];
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID', 'Server-Timing'],
  })
);

// ─── Performance ──────────────────────────────────────────────────────────────
app.use(compression());

// ─── Rate limiting ────────────────────────────────────────────────────────────
app.use(globalRateLimit);

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Input sanitization (NoSQL injection prevention) ─────────────────────────
app.use(sanitizeInput);
app.use(securityLogger);

// ─── Request logging ──────────────────────────────────────────────────────────
if (env.NODE_ENV !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) },
      skip: (req) => req.path === '/api/v1/health',
    })
  );
}

// Trust proxy (for Render deployment)
app.set('trust proxy', 1);

// Swagger documentation
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MatchLens AI - Volunteer Copilot API',
      version: '1.0.0',
      description:
        'AI-powered smart stadium operations platform for FIFA World Cup 2026',
      contact: {
        name: 'MatchLens AI Team',
      },
    },
    servers: [
      {
        url: `${env.SERVER_URL}/api/v1`,
        description: env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use('/api/v1', routes);

// Root
app.get('/', (_req, res) => {
  res.json({
    name: 'MatchLens AI - Volunteer Copilot',
    version: '1.0.0',
    description: 'AI-powered smart stadium operations for FIFA World Cup 2026',
    docs: `${env.SERVER_URL}/api/docs`,
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
