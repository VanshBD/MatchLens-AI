import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { validate } from '../../middlewares/validate.middleware';

function makeReqRes(body: unknown, query: unknown = {}, params: unknown = {}) {
  const req = { body, query, params };
  let statusCode = 0;
  let jsonBody: unknown;
  const res = {
    status: vi.fn().mockImplementation((code: number) => { statusCode = code; return res; }),
    json: vi.fn().mockImplementation((body: unknown) => { jsonBody = body; return res; }),
    _getStatus: () => statusCode,
    _getJson: () => jsonBody,
  };
  const next = vi.fn();
  return { req, res, next };
}

describe('Validate Middleware', () => {
  const schema = z.object({
    body: z.object({
      name: z.string().min(2),
      email: z.string().email(),
    }),
  });

  it('calls next() with valid input', async () => {
    const { req, res, next } = makeReqRes({ name: 'John', email: 'john@test.com' });
    await validate(schema)(req as never, res as never, next);
    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith();
  });

  it('returns 400 with validation details for invalid input', async () => {
    const { req, res, next } = makeReqRes({ name: 'J', email: 'not-an-email' });
    await validate(schema)(req as never, res as never, next);
    expect(res.status).toHaveBeenCalledWith(400);
    const json = res._getJson() as { success: boolean; details: { field: string; message: string }[] };
    expect(json.success).toBe(false);
    expect(json.details).toBeDefined();
    expect(json.details.length).toBeGreaterThan(0);
  });

  it('returns field names in validation errors', async () => {
    const { req, res, next } = makeReqRes({ name: 'Jo', email: 'bad' });
    await validate(schema)(req as never, res as never, next);
    const json = res._getJson() as { details: { field: string }[] };
    const fields = json.details.map((d) => d.field);
    expect(fields.some((f) => f.includes('email'))).toBe(true);
  });

  it('does not call next() when validation fails', async () => {
    const { req, res, next } = makeReqRes({});
    await validate(schema)(req as never, res as never, next);
    expect(next).not.toHaveBeenCalledWith(expect.any(Object));
  });

  it('includes timestamp in error response', async () => {
    const { req, res } = makeReqRes({ name: 'x' });
    const dummyNext = vi.fn() as never;
    await validate(schema)(req as never, res as never, dummyNext);
    const json = res._getJson() as { timestamp: string };
    expect(new Date(json.timestamp).getTime()).toBeGreaterThan(0);
  });
});
