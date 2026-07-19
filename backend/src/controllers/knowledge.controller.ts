import { Request, Response, NextFunction } from 'express';
import { KnowledgeBase } from '../models/KnowledgeBase.model';
import { sendSuccess, sendCreated, sendNotFound } from '../utils/response';
import { HTTP_STATUS, PAGINATION } from '../constants';
import mongoose from 'mongoose';

export class KnowledgeController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number(req.query.page) || PAGINATION.DEFAULT_PAGE;
      const limit = Math.min(
        Number(req.query.limit) || PAGINATION.DEFAULT_LIMIT,
        PAGINATION.MAX_LIMIT
      );
      const skip = (page - 1) * limit;

      const query: mongoose.FilterQuery<typeof KnowledgeBase> = { isActive: true };
      if (req.query.category) query.category = req.query.category;
      if (req.query.search) {
        query.$text = { $search: req.query.search as string };
      }

      const [docs, total] = await Promise.all([
        KnowledgeBase.find(query, req.query.search ? { score: { $meta: 'textScore' } } : {})
          .populate('createdBy', 'name')
          .sort(req.query.search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
          .skip(skip)
          .limit(limit),
        KnowledgeBase.countDocuments(query),
      ]);

      sendSuccess(res, docs, 'Knowledge base retrieved', HTTP_STATUS.OK as number, {
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
      const doc = await KnowledgeBase.findById(req.params.id).populate('createdBy', 'name');
      if (!doc) {
        sendNotFound(res, 'Document');
        return;
      }
      sendSuccess(res, doc, 'Document retrieved');
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = await KnowledgeBase.create({
        ...req.body,
        createdBy: new mongoose.Types.ObjectId(req.user!.userId),
      });
      sendCreated(res, doc, 'Knowledge base document created');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = await KnowledgeBase.findByIdAndUpdate(
        req.params.id,
        {
          ...req.body,
          updatedBy: new mongoose.Types.ObjectId(req.user!.userId),
        },
        { new: true, runValidators: true }
      );

      if (!doc) {
        sendNotFound(res, 'Document');
        return;
      }
      sendSuccess(res, doc, 'Document updated');
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = await KnowledgeBase.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );
      if (!doc) {
        sendNotFound(res, 'Document');
        return;
      }
      sendSuccess(res, null, 'Document deleted');
    } catch (error) {
      next(error);
    }
  }
}

export const knowledgeController = new KnowledgeController();
