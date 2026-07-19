import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess, sendCreated, sendError } from '../utils/response';
import { HTTP_STATUS } from '../constants';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, tokens } = await authService.register(
        req.body,
        req.ip,
        req.headers['user-agent']
      );
      sendCreated(res, { user, tokens }, 'Registration successful');
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already registered') {
        sendError(res, error.message, HTTP_STATUS.CONFLICT as number);
        return;
      }
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, tokens } = await authService.login(req.body, req.ip, req.headers['user-agent']);
      sendSuccess(res, { user, tokens }, 'Login successful');
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, error.message, HTTP_STATUS.UNAUTHORIZED as number);
        return;
      }
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshTokens(refreshToken);
      sendSuccess(res, tokens, 'Tokens refreshed');
    } catch (error) {
      sendError(res, 'Invalid or expired refresh token', HTTP_STATUS.UNAUTHORIZED as number);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.logout(req.user!.userId);
      sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response): Promise<void> {
    sendSuccess(res, req.user, 'User profile retrieved');
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { oldPassword, newPassword } = req.body;
      await authService.changePassword(req.user!.userId, oldPassword, newPassword);
      sendSuccess(res, null, 'Password changed successfully');
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, error.message, HTTP_STATUS.BAD_REQUEST as number);
        return;
      }
      next(error);
    }
  }
}

export const authController = new AuthController();
