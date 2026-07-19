import { Request, Response, NextFunction } from 'express';
import { incidentService } from '../services/incident.service';
import { lostChildService } from '../services/lostChild.service';
import { medicalService } from '../services/medical.service';
import { sendSuccess, sendCreated, sendNotFound } from '../utils/response';
import { HTTP_STATUS } from '../constants';
import mongoose from 'mongoose';

export class IncidentController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        ...req.query,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      };
      const result = await incidentService.findAll(filters);
      sendSuccess(res, result.data, 'Incidents retrieved', HTTP_STATUS.OK, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const incident = await incidentService.findById(req.params.id);
      if (!incident) {
        sendNotFound(res, 'Incident');
        return;
      }
      sendSuccess(res, incident, 'Incident retrieved');
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, notes } = req.body;
      const incident = await incidentService.updateStatus(
        req.params.id,
        status,
        new mongoose.Types.ObjectId(req.user!.userId),
        notes
      );
      sendSuccess(res, incident, 'Incident status updated');
    } catch (error) {
      if (error instanceof Error && error.message === 'Incident not found') {
        sendNotFound(res, 'Incident');
        return;
      }
      next(error);
    }
  }

  async assign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const incident = await incidentService.assign(
        req.params.id,
        req.body.assigneeId,
        new mongoose.Types.ObjectId(req.user!.userId)
      );
      sendSuccess(res, incident, 'Incident assigned');
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await incidentService.getStats();
      sendSuccess(res, stats, 'Statistics retrieved');
    } catch (error) {
      next(error);
    }
  }

  // Lost Child
  async createLostChild(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await lostChildService.createIncident({
        ...req.body,
        reportedBy: new mongoose.Types.ObjectId(req.user!.userId),
      });
      sendCreated(res, result, 'Lost child incident created');
    } catch (error) {
      next(error);
    }
  }

  async getLostChildCases(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const result = await lostChildService.getActiveCases(page, limit);
      sendSuccess(res, result.data, 'Lost child cases retrieved', HTTP_STATUS.OK, {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
        hasNext: result.page * result.limit < result.total,
        hasPrev: result.page > 1,
      });
    } catch (error) {
      next(error);
    }
  }

  async generateAnnouncements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { childDescription, languages } = req.body;
      const announcements = await lostChildService.generateAnnouncements(
        childDescription,
        languages
      );
      sendSuccess(res, announcements, 'Announcements generated');
    } catch (error) {
      next(error);
    }
  }

  // Medical
  async createMedicalIncident(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await medicalService.createIncident({
        ...req.body,
        reportedBy: new mongoose.Types.ObjectId(req.user!.userId),
      });
      sendCreated(res, result, 'Medical incident created');
    } catch (error) {
      next(error);
    }
  }

  async getMedicalEmergencies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const result = await medicalService.getActiveEmergencies(page, limit);
      sendSuccess(res, result.data, 'Medical emergencies retrieved', HTTP_STATUS.OK, {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
        hasNext: result.page * result.limit < result.total,
        hasPrev: result.page > 1,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const incidentController = new IncidentController();
