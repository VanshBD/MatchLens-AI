import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

/**
 * Log slow requests (>1000ms) for performance monitoring
 */
export function responseTime(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      requestId: req.headers['x-request-id'],
    };

    if (duration > 1000) {
      logger.warn('Slow request detected', logData);
    } else if (res.statusCode >= 500) {
      logger.error('Server error response', logData);
    }
    // Note: Do NOT set headers here — response is already sent
  });

  // Set Server-Timing header BEFORE response is sent
  res.setHeader('Server-Timing', `app;desc="MatchLens AI"`);

  next();
}

/**
 * Add cache-control headers for static-like endpoints
 */
export function cacheControl(maxAgeSeconds: number = 0) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    if (maxAgeSeconds > 0) {
      res.setHeader('Cache-Control', `public, max-age=${maxAgeSeconds}, stale-while-revalidate=60`);
    } else {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    }
    next();
  };
}
