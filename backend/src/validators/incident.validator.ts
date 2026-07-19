import { z } from 'zod';
import { INCIDENT_TYPES, INCIDENT_SEVERITY, INCIDENT_STATUS } from '../constants';

export const createIncidentSchema = z.object({
  body: z.object({
    type: z.enum(Object.values(INCIDENT_TYPES) as [string, ...string[]]),
    title: z.string().min(5).max(200),
    description: z.string().min(10).max(5000),
    severity: z.enum(Object.values(INCIDENT_SEVERITY) as [string, ...string[]]).optional(),
    location: z
      .object({
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        section: z.string().optional(),
        gate: z.string().optional(),
        description: z.string().optional(),
      })
      .optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const updateIncidentStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.enum(Object.values(INCIDENT_STATUS) as [string, ...string[]]),
    notes: z.string().optional(),
  }),
});

export const incidentFiltersSchema = z.object({
  query: z.object({
    type: z.string().optional(),
    severity: z.string().optional(),
    status: z.string().optional(),
    search: z.string().optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export const createLostChildSchema = z.object({
  body: z.object({
    description: z.string().min(10).max(2000),
    guardianName: z.string().min(2).max(100),
    guardianContact: z.string().min(5).max(50),
    lastSeenLocation: z.string().min(3).max(200),
    childName: z.string().optional(),
    childAge: z.number().min(0).max(17).optional(),
    lastSeenTime: z.string().datetime().optional(),
  }),
});

export const createMedicalIncidentSchema = z.object({
  body: z.object({
    description: z.string().min(10).max(2000),
    location: z.string().min(3).max(200),
    section: z.string().optional(),
    patientAge: z.number().min(0).max(150).optional(),
    patientGender: z.string().optional(),
  }),
});
