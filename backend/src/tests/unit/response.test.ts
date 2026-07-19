import { describe, it, expect, vi } from 'vitest';
import { sendSuccess, sendError, sendNotFound, sendUnauthorized } from '../../utils/response';

function mockRes() {
  const res = {
    _status: 0,
    _body: {} as unknown,
    status(code: number) {
      this._status = code;
      return this;
    },
    json(body: unknown) {
      this._body = body;
      return this;
    },
  };
  return res;
}

describe('Response utilities', () => {
  describe('sendSuccess', () => {
    it('returns 200 with correct shape', () => {
      const res = mockRes();
      sendSuccess(res as never, { id: 1 }, 'OK');
      expect(res._status).toBe(200);
      expect((res._body as { success: boolean }).success).toBe(true);
      expect((res._body as { message: string }).message).toBe('OK');
      expect((res._body as { data: { id: number } }).data).toEqual({ id: 1 });
    });

    it('includes pagination when provided', () => {
      const res = mockRes();
      const pagination = {
        total: 100,
        page: 1,
        limit: 20,
        totalPages: 5,
        hasNext: true,
        hasPrev: false,
      };
      sendSuccess(res as never, [], 'List', 200, pagination);
      expect((res._body as { pagination: typeof pagination }).pagination).toEqual(pagination);
    });

    it('includes timestamp', () => {
      const res = mockRes();
      sendSuccess(res as never, null, 'ok');
      expect((res._body as { timestamp: string }).timestamp).toBeTruthy();
      expect(new Date((res._body as { timestamp: string }).timestamp).getTime()).toBeGreaterThan(0);
    });
  });

  describe('sendError', () => {
    it('returns 500 by default', () => {
      const res = mockRes();
      sendError(res as never, 'Something went wrong');
      expect(res._status).toBe(500);
      expect((res._body as { success: boolean }).success).toBe(false);
    });

    it('accepts custom status code', () => {
      const res = mockRes();
      sendError(res as never, 'Not found', 404);
      expect(res._status).toBe(404);
    });
  });

  describe('sendNotFound', () => {
    it('returns 404 with resource name', () => {
      const res = mockRes();
      sendNotFound(res as never, 'Incident');
      expect(res._status).toBe(404);
      expect((res._body as { message: string }).message).toContain('Incident');
    });
  });

  describe('sendUnauthorized', () => {
    it('returns 401', () => {
      const res = mockRes();
      sendUnauthorized(res as never);
      expect(res._status).toBe(401);
    });
  });
});
