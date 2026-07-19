import { describe, it, expect, vi } from 'vitest';
import { sanitizeInput } from '../../middlewares/security.middleware';

type BodyType = Record<string, unknown>;

function makeReqRes(body: BodyType, query: Record<string, string> = {}) {
  const req = {
    body: body as BodyType,
    query,
    headers: {} as Record<string, string>,
    ip: '127.0.0.1',
    path: '/test',
    method: 'POST',
  };
  const res = { setHeader: vi.fn() };
  const next = vi.fn();
  return { req, res, next };
}

describe('Security Middleware', () => {
  describe('sanitizeInput', () => {
    it('passes through clean input unchanged', () => {
      const { req, res, next } = makeReqRes({ name: 'John', email: 'john@test.com' });
      sanitizeInput(req as never, res as never, next);
      expect((req.body as BodyType).name).toBe('John');
      expect((req.body as BodyType).email).toBe('john@test.com');
      expect(next).toHaveBeenCalledOnce();
    });

    it('removes MongoDB $ operator keys from body', () => {
      const { req, res, next } = makeReqRes({ $where: 'malicious', name: 'safe' });
      sanitizeInput(req as never, res as never, next);
      expect((req.body as BodyType).$where).toBeUndefined();
      expect((req.body as BodyType).name).toBe('safe');
    });

    it('removes nested MongoDB operators', () => {
      const { req, res, next } = makeReqRes({
        user: { $gt: '', $ne: null, name: 'valid' } as BodyType,
      });
      sanitizeInput(req as never, res as never, next);
      const user = (req.body as BodyType).user as BodyType;
      expect(user.$gt).toBeUndefined();
      expect(user.$ne).toBeUndefined();
      expect(user.name).toBe('valid');
    });

    it('removes dot notation keys (nested injection)', () => {
      const { req, res, next } = makeReqRes({
        'admin.password': 'hack',
        safe: 'value',
      });
      sanitizeInput(req as never, res as never, next);
      expect((req.body as BodyType)['admin.password']).toBeUndefined();
      expect((req.body as BodyType).safe).toBe('value');
    });

    it('removes $ operators from query params', () => {
      const { req, res, next } = makeReqRes({}, { $where: 'bad', name: 'good' });
      sanitizeInput(req as never, res as never, next);
      expect(req.query['$where']).toBeUndefined();
      expect(req.query.name).toBe('good');
    });

    it('handles arrays in body', () => {
      const { req, res, next } = makeReqRes({ tags: ['safe', 'values'] });
      sanitizeInput(req as never, res as never, next);
      expect((req.body as BodyType).tags).toEqual(['safe', 'values']);
    });

    it('handles null body gracefully', () => {
      const req = { body: null, query: {}, headers: {}, ip: '', path: '', method: '' };
      const res = { setHeader: vi.fn() };
      const next = vi.fn();
      expect(() => sanitizeInput(req as never, res as never, next)).not.toThrow();
      expect(next).toHaveBeenCalledOnce();
    });

    it('handles deeply nested objects', () => {
      const { req, res, next } = makeReqRes({
        level1: {
          level2: {
            $inject: 'bad',
            safe: 'good',
          } as BodyType,
        } as BodyType,
      });
      sanitizeInput(req as never, res as never, next);
      const l2 = ((req.body as BodyType).level1 as BodyType).level2 as BodyType;
      expect(l2.$inject).toBeUndefined();
      expect(l2.safe).toBe('good');
    });
  });
});
