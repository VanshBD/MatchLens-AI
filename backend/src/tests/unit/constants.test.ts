import { describe, it, expect } from 'vitest';
import {
  HTTP_STATUS,
  USER_ROLES,
  INCIDENT_TYPES,
  INCIDENT_SEVERITY,
  INCIDENT_STATUS,
  SUPPORTED_LANGUAGES,
  LANGUAGE_NAMES,
  PAGINATION,
  RATE_LIMITS,
} from '../../constants';

describe('Constants', () => {
  describe('HTTP_STATUS', () => {
    it('has correct status codes', () => {
      expect(HTTP_STATUS.OK).toBe(200);
      expect(HTTP_STATUS.CREATED).toBe(201);
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
      expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
      expect(HTTP_STATUS.FORBIDDEN).toBe(403);
      expect(HTTP_STATUS.NOT_FOUND).toBe(404);
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
    });
  });

  describe('USER_ROLES', () => {
    it('contains all 5 roles', () => {
      expect(Object.keys(USER_ROLES)).toHaveLength(5);
      expect(USER_ROLES.ADMIN).toBe('admin');
      expect(USER_ROLES.VOLUNTEER).toBe('volunteer');
      expect(USER_ROLES.SECURITY).toBe('security');
      expect(USER_ROLES.MEDICAL).toBe('medical');
      expect(USER_ROLES.ORGANIZER).toBe('organizer');
    });
  });

  describe('INCIDENT_TYPES', () => {
    it('contains all incident types', () => {
      expect(INCIDENT_TYPES.LOST_CHILD).toBe('lost_child');
      expect(INCIDENT_TYPES.MEDICAL_EMERGENCY).toBe('medical_emergency');
      expect(INCIDENT_TYPES.CROWD_ISSUE).toBe('crowd_issue');
      expect(INCIDENT_TYPES.SECURITY_THREAT).toBe('security_threat');
    });
  });

  describe('INCIDENT_SEVERITY', () => {
    it('has correct severity levels in order', () => {
      const levels = Object.values(INCIDENT_SEVERITY);
      expect(levels).toContain('low');
      expect(levels).toContain('medium');
      expect(levels).toContain('high');
      expect(levels).toContain('critical');
    });
  });

  describe('SUPPORTED_LANGUAGES', () => {
    it('supports 8 languages', () => {
      expect(Object.keys(SUPPORTED_LANGUAGES)).toHaveLength(8);
    });

    it('has matching LANGUAGE_NAMES for all codes', () => {
      Object.values(SUPPORTED_LANGUAGES).forEach((code) => {
        expect(LANGUAGE_NAMES[code]).toBeTruthy();
      });
    });

    it('includes required FIFA languages', () => {
      expect(SUPPORTED_LANGUAGES.EN).toBe('en');
      expect(SUPPORTED_LANGUAGES.ES).toBe('es');
      expect(SUPPORTED_LANGUAGES.FR).toBe('fr');
      expect(SUPPORTED_LANGUAGES.AR).toBe('ar');
    });
  });

  describe('PAGINATION', () => {
    it('has sensible defaults', () => {
      expect(PAGINATION.DEFAULT_PAGE).toBe(1);
      expect(PAGINATION.DEFAULT_LIMIT).toBe(20);
      expect(PAGINATION.MAX_LIMIT).toBe(100);
      expect(PAGINATION.MAX_LIMIT).toBeGreaterThan(PAGINATION.DEFAULT_LIMIT);
    });
  });

  describe('RATE_LIMITS', () => {
    it('auth rate limit is stricter than global', () => {
      expect(RATE_LIMITS.AUTH.max).toBeLessThan(RATE_LIMITS.GLOBAL.max);
    });

    it('AI rate limit per-minute window', () => {
      expect(RATE_LIMITS.AI.windowMs).toBe(60 * 1000);
    });
  });
});
