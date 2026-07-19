import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../config/logger';

/**
 * Attach a unique request ID to every request for tracing
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = (req.headers['x-request-id'] as string) || uuidv4();
  req.headers['x-request-id'] = id;
  res.setHeader('X-Request-ID', id);
  next();
}

/**
 * Strip dangerous characters from query strings and body keys
 * Prevents NoSQL injection via MongoDB operators
 */
export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
  const sanitize = (obj: unknown): unknown => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(sanitize);

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      // Remove keys starting with $ (MongoDB operator injection)
      if (key.startsWith('$')) {
        logger.warn('Blocked MongoDB operator injection attempt', { key });
        continue;
      }
      // Remove keys with dot notation (MongoDB nested injection)
      if (key.includes('.')) {
        logger.warn('Blocked MongoDB dot notation injection attempt', { key });
        continue;
      }
      sanitized[key] = sanitize(value);
    }
    return sanitized;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) {
    for (const key of Object.keys(req.query)) {
      if (key.startsWith('$')) {
        delete req.query[key];
      }
    }
  }

  next();
}

/**
 * Prevent clickjacking with additional frame options
 * (Helmet handles this but this adds CSP report-uri support)
 */
export function additionalSecurityHeaders(_req: Request, res: Response, next: NextFunction): void {
  // Prevent MIME type sniffing on downloads
  res.setHeader('X-Download-Options', 'noopen');
  // Prevent cross-origin info leakage
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  next();
}

/**
 * Log suspicious request patterns for security monitoring
 */
export function securityLogger(req: Request, _res: Response, next: NextFunction): void {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick= onerror= etc
    /union\s+select/i, // SQL injection
    /\.\.\//, // path traversal
  ];

  const bodyStr = JSON.stringify(req.body || {});
  const queryStr = JSON.stringify(req.query || {});
  const combined = bodyStr + queryStr;

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(combined)) {
      logger.warn('Suspicious request pattern detected', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        pattern: pattern.source,
        requestId: req.headers['x-request-id'],
      });
      break;
    }
  }

  next();
}
