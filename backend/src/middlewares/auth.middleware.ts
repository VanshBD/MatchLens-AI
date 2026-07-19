import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { User } from '../models/User.model';
import { UserRole } from '../constants';
import { sendUnauthorized, sendForbidden } from '../utils/response';
import { logger } from '../config/logger';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: UserRole;
        name: string;
        email: string;
      };
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      sendUnauthorized(res, 'Authentication token required');
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = authService.verifyAccessToken(token);

    if (payload.type !== 'access') {
      sendUnauthorized(res, 'Invalid token type');
      return;
    }

    // Verify user still exists and is active
    const user = await User.findById(payload.userId).select('name email role isActive');
    if (!user || !user.isActive) {
      sendUnauthorized(res, 'User not found or deactivated');
      return;
    }

    req.user = {
      userId: payload.userId,
      role: user.role,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    const message =
      error instanceof Error && error.name === 'TokenExpiredError'
        ? 'Token expired'
        : 'Invalid token';
    sendUnauthorized(res, message);
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res);
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user.userId,
        role: req.user.role,
        requiredRoles: roles,
        path: req.path,
      });
      sendForbidden(res, 'Insufficient permissions for this action');
      return;
    }

    next();
  };
}
