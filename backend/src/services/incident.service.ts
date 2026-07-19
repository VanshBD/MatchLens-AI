import { Incident, IIncident } from '../models/Incident.model';
import { AuditLog } from '../models/AuditLog.model';
import { Notification } from '../models/Notification.model';
import { INCIDENT_STATUS, IncidentStatus, INCIDENT_SEVERITY, IncidentSeverity } from '../constants';
import mongoose from 'mongoose';
import { logger } from '../config/logger';

export interface IncidentFilters {
  type?: string;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  reportedBy?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class IncidentService {
  async findAll(filters: IncidentFilters) {
    const {
      type,
      severity,
      status,
      reportedBy,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const query: mongoose.FilterQuery<IIncident> = {};

    if (type) query.type = type;
    if (severity) query.severity = severity;
    if (status) query.status = status;
    if (reportedBy) query.reportedBy = new mongoose.Types.ObjectId(reportedBy);
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { incidentId: { $regex: search, $options: 'i' } },
      ];
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
      Incident.find(query)
        .populate('reportedBy', 'name role avatar')
        .populate('assignedTo', 'name role avatar')
        .sort(sort)
        .skip(skip)
        .limit(Math.min(limit, 100)),
      Incident.countDocuments(query),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async findById(id: string) {
    return Incident.findById(id)
      .populate('reportedBy', 'name role avatar phone')
      .populate('assignedTo', 'name role avatar phone')
      .populate('timeline.performedBy', 'name role');
  }

  async updateStatus(
    incidentId: string,
    status: IncidentStatus,
    performedBy: mongoose.Types.ObjectId,
    notes?: string
  ) {
    const incident = await Incident.findById(incidentId);
    if (!incident) throw new Error('Incident not found');

    incident.status = status;
    if (status === INCIDENT_STATUS.RESOLVED) {
      incident.isResolved = true;
      incident.resolvedAt = new Date();
    }
    incident.timeline.push({
      action: `Status changed to ${status}`,
      performedBy,
      timestamp: new Date(),
      notes,
    });

    await incident.save();
    logger.info('Incident status updated', { incidentId: incident.incidentId, status });
    return incident;
  }

  async assign(incidentId: string, assigneeId: string, performedBy: mongoose.Types.ObjectId) {
    const incident = await Incident.findByIdAndUpdate(
      incidentId,
      {
        assignedTo: new mongoose.Types.ObjectId(assigneeId),
        status: INCIDENT_STATUS.IN_PROGRESS,
        $push: {
          timeline: {
            action: `Incident assigned`,
            performedBy,
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    ).populate('assignedTo', 'name role');

    if (!incident) throw new Error('Incident not found');
    return incident;
  }

  async getStats() {
    const [bySeverity, byStatus, byType, total] = await Promise.all([
      Incident.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]),
      Incident.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Incident.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
      Incident.countDocuments(),
    ]);

    return {
      total,
      bySeverity: Object.fromEntries(bySeverity.map((s) => [s._id, s.count])),
      byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
      byType: Object.fromEntries(byType.map((s) => [s._id, s.count])),
    };
  }

  async createAuditLog(params: {
    userId?: mongoose.Types.ObjectId;
    action: string;
    resource: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    await AuditLog.create(params);
  }
}

export const incidentService = new IncidentService();
