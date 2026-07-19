/**
 * Incident Repository — Data access layer
 * Keeps business logic in services separate from DB queries
 */

import mongoose from 'mongoose';
import { Incident, IIncident } from '../models/Incident.model';
import { IncidentFilters } from '../services/incident.service';
import { PaginatedResult } from '../interfaces';
import { PAGINATION } from '../constants';

export class IncidentRepository {
  async findAll(filters: IncidentFilters): Promise<PaginatedResult<IIncident>> {
    const {
      type,
      severity,
      status,
      reportedBy,
      search,
      startDate,
      endDate,
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
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
      if (startDate) (query.createdAt as Record<string, Date>).$gte = startDate;
      if (endDate) (query.createdAt as Record<string, Date>).$lte = endDate;
    }

    const safeLimit = Math.min(limit, PAGINATION.MAX_LIMIT);
    const skip = (page - 1) * safeLimit;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
      Incident.find(query)
        .populate('reportedBy', 'name role avatar')
        .populate('assignedTo', 'name role avatar')
        .sort(sort)
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Incident.countDocuments(query),
    ]);

    return {
      data: data as unknown as IIncident[],
      pagination: {
        total,
        page,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
        hasNext: page * safeLimit < total,
        hasPrev: page > 1,
      },
    };
  }

  async findById(id: string): Promise<IIncident | null> {
    return Incident.findById(id)
      .populate('reportedBy', 'name role avatar phone')
      .populate('assignedTo', 'name role avatar phone')
      .populate('timeline.performedBy', 'name role');
  }

  async findByIncidentId(incidentId: string): Promise<IIncident | null> {
    return Incident.findOne({ incidentId });
  }

  async create(data: Partial<IIncident>): Promise<IIncident> {
    return Incident.create(data);
  }

  async updateById(id: string, update: mongoose.UpdateQuery<IIncident>): Promise<IIncident | null> {
    return Incident.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  }

  async getStats(): Promise<{
    total: number;
    bySeverity: Record<string, number>;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
  }> {
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
}

export const incidentRepository = new IncidentRepository();
