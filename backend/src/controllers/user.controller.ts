import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model';
import { AuditLog } from '../models/AuditLog.model';
import { sendSuccess, sendNotFound, sendError } from '../utils/response';
import { HTTP_STATUS, PAGINATION } from '../constants';
import mongoose from 'mongoose';

export class UserController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number(req.query.page) || PAGINATION.DEFAULT_PAGE;
      const limit = Math.min(
        Number(req.query.limit) || PAGINATION.DEFAULT_LIMIT,
        PAGINATION.MAX_LIMIT
      );
      const skip = (page - 1) * limit;

      const query: mongoose.FilterQuery<typeof User> = {};
      if (req.query.role) query.role = req.query.role;
      if (req.query.search) {
        query.$or = [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
        ];
      }

      const [users, total] = await Promise.all([
        User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(query),
      ]);

      sendSuccess(res, users, 'Users retrieved', HTTP_STATUS.OK as number, {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        sendNotFound(res, 'User');
        return;
      }
      sendSuccess(res, user, 'User retrieved');
    } catch (error) {
      next(error);
    }
  }

  async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role } = req.body;
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true, runValidators: true }
      );

      if (!user) {
        sendNotFound(res, 'User');
        return;
      }

      await AuditLog.create({
        user: new mongoose.Types.ObjectId(req.user!.userId),
        action: 'update',
        resource: 'user',
        resourceId: req.params.id,
        newValue: { role },
        success: true,
      });

      sendSuccess(res, user, 'User role updated');
    } catch (error) {
      next(error);
    }
  }

  async toggleActive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        sendNotFound(res, 'User');
        return;
      }

      // Prevent deactivating own account
      if (user._id.toString() === req.user!.userId) {
        sendError(res, 'Cannot deactivate your own account', HTTP_STATUS.BAD_REQUEST as number);
        return;
      }

      user.isActive = !user.isActive;
      await user.save();

      await AuditLog.create({
        user: new mongoose.Types.ObjectId(req.user!.userId),
        action: 'update',
        resource: 'user',
        resourceId: req.params.id,
        newValue: { isActive: user.isActive },
        success: true,
      });

      sendSuccess(res, user, `User ${user.isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Math.min(Number(req.query.limit) || 50, 100);
      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        AuditLog.find()
          .populate('user', 'name email role')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        AuditLog.countDocuments(),
      ]);

      sendSuccess(res, logs, 'Audit logs retrieved', HTTP_STATUS.OK as number, {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
