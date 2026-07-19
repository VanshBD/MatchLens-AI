import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app';

/**
 * Integration tests for Incident API
 * Note: Requires running MongoDB — skipped gracefully if not available
 */

let accessToken: string;

describe('Incidents API', () => {
  describe('GET /api/v1/health', () => {
    it('returns healthy status', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('MatchLens');
    });
  });

  describe('GET /api/v1/incidents (unauthenticated)', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/v1/incidents');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/ai (unauthenticated)', () => {
    it('returns 401 for AI endpoints without token', async () => {
      const res = await request(app).post('/api/v1/ai/knowledge').send({ question: 'test' });
      expect(res.status).toBe(401);
    });
  });

  describe('Input validation', () => {
    it('rejects malformed JSON', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('validates auth register schema', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'not-an-email', password: '123' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.details).toBeDefined();
    });

    it('validates password strength on register', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'weakpass',
      });
      expect(res.status).toBe(400);
    });
  });

  describe('404 handling', () => {
    it('returns 404 for unknown routes', async () => {
      const res = await request(app).get('/api/v1/nonexistent-route-xyz');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('returns 404 for wrong HTTP method', async () => {
      const res = await request(app).delete('/api/v1/health');
      expect(res.status).toBe(404);
    });
  });

  describe('Security headers', () => {
    it('response includes security headers', async () => {
      const res = await request(app).get('/api/v1/health');
      // Helmet sets these
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBeDefined();
    });

    it('does not expose server technology', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.headers['x-powered-by']).toBeUndefined();
    });
  });
});
