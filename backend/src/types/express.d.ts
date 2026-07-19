import { UserRole } from '../constants';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: UserRole;
        name: string;
        email: string;
      };
      requestId?: string;
      startTime?: number;
    }
  }
}

export {};
