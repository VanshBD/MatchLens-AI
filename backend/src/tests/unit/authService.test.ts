import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Unit tests for AuthService
 * Uses mocks — no real DB needed
 */

// Mock mongoose models
vi.mock('../../models/User.model', () => ({
  User: {
    findOne: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('../../models/AuditLog.model', () => ({
  AuditLog: { create: vi.fn() },
}));

vi.mock('../../config/env', () => ({
  env: {
    JWT_SECRET: 'test-secret-key-minimum-32-characters-long',
    JWT_REFRESH_SECRET: 'test-refresh-secret-key-minimum-32-chars',
    JWT_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
    NODE_ENV: 'test',
    LOG_LEVEL: 'error',
  },
}));

vi.mock('../../config/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

import { authService } from '../../services/auth.service';
import jwt from 'jsonwebtoken';

describe('AuthService', () => {
  describe('generateTokenPair', () => {
    it('generates valid access and refresh tokens', () => {
      const { accessToken, refreshToken } = authService.generateTokenPair('user123', 'volunteer');

      expect(accessToken).toBeTruthy();
      expect(refreshToken).toBeTruthy();

      const accessPayload = jwt.verify(
        accessToken,
        'test-secret-key-minimum-32-characters-long'
      ) as { userId: string; role: string; type: string };

      expect(accessPayload.userId).toBe('user123');
      expect(accessPayload.role).toBe('volunteer');
      expect(accessPayload.type).toBe('access');
    });

    it('generates different tokens for different users', () => {
      const first = authService.generateTokenPair('user123', 'volunteer');
      const second = authService.generateTokenPair('user456', 'admin');
      // Different userId means different payload → different token
      expect(first.accessToken).not.toBe(second.accessToken);
    });
  });

  describe('verifyAccessToken', () => {
    it('verifies a valid access token', () => {
      const { accessToken } = authService.generateTokenPair('abc', 'admin');
      const payload = authService.verifyAccessToken(accessToken);
      expect(payload.userId).toBe('abc');
      expect(payload.role).toBe('admin');
      expect(payload.type).toBe('access');
    });

    it('throws on tampered token', () => {
      expect(() => authService.verifyAccessToken('invalid.token.here')).toThrow();
    });

    it('throws on refresh token used as access token', () => {
      const { refreshToken } = authService.generateTokenPair('abc', 'admin');
      // refreshToken is signed with a different secret — should throw
      expect(() => authService.verifyAccessToken(refreshToken)).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('verifies a valid refresh token', () => {
      const { refreshToken } = authService.generateTokenPair('xyz', 'security');
      const payload = authService.verifyRefreshToken(refreshToken);
      expect(payload.userId).toBe('xyz');
      expect(payload.type).toBe('refresh');
    });

    it('throws on invalid refresh token', () => {
      expect(() => authService.verifyRefreshToken('bad-token')).toThrow();
    });
  });
});
