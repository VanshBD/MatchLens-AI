import { Request } from 'express';
import mongoose from 'mongoose';
import { UserRole } from '../constants';

/**
 * Authenticated Express Request — guarantees req.user is defined
 */
export interface AuthRequest extends Request {
  user: {
    userId: string;
    role: UserRole;
    name: string;
    email: string;
  };
}

/**
 * Standard paginated query params
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Standard API response envelope
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: PaginationMeta;
  timestamp: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Service layer result types
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * JWT token payload
 */
export interface JwtPayload {
  userId: string;
  role: UserRole;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

/**
 * Socket.IO authenticated socket data
 */
export interface AuthenticatedSocketData {
  userId: string;
  role: UserRole;
  name: string;
}

/**
 * AI service request/response types
 */
export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AiAnalysisResult {
  severity: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  protocol: string[];
  nextActions: string[];
  escalationRequired: boolean;
}

/**
 * File upload result from Cloudinary
 */
export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
}

/**
 * Audit log entry
 */
export interface AuditEntry {
  userId?: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}
