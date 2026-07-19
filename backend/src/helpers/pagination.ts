import { PAGINATION } from '../constants';
import { PaginationMeta } from '../interfaces';

/**
 * Build pagination metadata from count + query params
 */
export function buildPagination(total: number, page: number, limit: number): PaginationMeta {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), PAGINATION.MAX_LIMIT);

  return {
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit),
    hasNext: safePage * safeLimit < total,
    hasPrev: safePage > 1,
  };
}

/**
 * Parse page/limit from query string with safe defaults
 */
export function parsePagination(query: { page?: string | number; limit?: string | number }): {
  page: number;
  limit: number;
} {
  const page = Math.max(1, Number(query.page) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    Math.max(1, Number(query.limit) || PAGINATION.DEFAULT_LIMIT),
    PAGINATION.MAX_LIMIT
  );
  return { page, limit };
}
