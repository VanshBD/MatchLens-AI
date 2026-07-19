import { Response } from 'express';
import { HTTP_STATUS } from '../constants';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode: number = HTTP_STATUS.OK,
  pagination?: ApiResponse['pagination']
): Response {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  if (pagination) response.pagination = pagination;
  return res.status(statusCode).json(response);
}

export function sendCreated<T>(res: Response, data: T, message = 'Created successfully'): Response {
  return sendSuccess(res, data, message, HTTP_STATUS.CREATED as number);
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  error?: string
): Response {
  const response: ApiResponse = {
    success: false,
    message,
    error: error || message,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(response);
}

export function sendNotFound(res: Response, resource = 'Resource'): Response {
  return sendError(res, `${resource} not found`, HTTP_STATUS.NOT_FOUND as number);
}

export function sendUnauthorized(res: Response, message = 'Unauthorized'): Response {
  return sendError(res, message, HTTP_STATUS.UNAUTHORIZED as number);
}

export function sendForbidden(res: Response, message = 'Forbidden'): Response {
  return sendError(res, message, HTTP_STATUS.FORBIDDEN as number);
}

export function sendBadRequest(res: Response, message: string): Response {
  return sendError(res, message, HTTP_STATUS.BAD_REQUEST as number);
}
