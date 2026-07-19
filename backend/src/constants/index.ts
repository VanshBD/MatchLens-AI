// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  ORGANIZER: 'organizer',
  SECURITY: 'security',
  MEDICAL: 'medical',
  VOLUNTEER: 'volunteer',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Incident Types
export const INCIDENT_TYPES = {
  LOST_CHILD: 'lost_child',
  MEDICAL_EMERGENCY: 'medical_emergency',
  CROWD_ISSUE: 'crowd_issue',
  SECURITY_THREAT: 'security_threat',
  ACCESSIBILITY: 'accessibility',
  GENERAL: 'general',
} as const;

export type IncidentType = (typeof INCIDENT_TYPES)[keyof typeof INCIDENT_TYPES];

// Incident Severity
export const INCIDENT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type IncidentSeverity = (typeof INCIDENT_SEVERITY)[keyof typeof INCIDENT_SEVERITY];

// Incident Status
export const INCIDENT_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  ESCALATED: 'escalated',
} as const;

export type IncidentStatus = (typeof INCIDENT_STATUS)[keyof typeof INCIDENT_STATUS];

// Supported Languages
export const SUPPORTED_LANGUAGES = {
  EN: 'en',
  ES: 'es',
  FR: 'fr',
  PT: 'pt',
  AR: 'ar',
  HI: 'hi',
  JA: 'ja',
  DE: 'de',
} as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[keyof typeof SUPPORTED_LANGUAGES];

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  pt: 'Portuguese',
  ar: 'Arabic',
  hi: 'Hindi',
  ja: 'Japanese',
  de: 'German',
};

// AI Module Types
export const AI_MODULE_TYPES = {
  LOST_CHILD: 'lost_child_assistant',
  MEDICAL: 'medical_emergency_assistant',
  CROWD: 'crowd_assistance',
  ACCESSIBILITY: 'accessibility_assistant',
  TRANSLATION: 'translation_assistant',
  INCIDENT_SUMMARIZER: 'incident_summarizer',
  KNOWLEDGE: 'knowledge_assistant',
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// JWT
export const JWT = {
  ACCESS_TOKEN_TYPE: 'access',
  REFRESH_TOKEN_TYPE: 'refresh',
} as const;

// Socket events
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',

  // Incidents
  INCIDENT_CREATED: 'incident:created',
  INCIDENT_UPDATED: 'incident:updated',
  INCIDENT_RESOLVED: 'incident:resolved',

  // Alerts
  SECURITY_ALERT: 'alert:security',
  MEDICAL_ALERT: 'alert:medical',
  CROWD_ALERT: 'alert:crowd',

  // Notifications
  NOTIFICATION: 'notification',

  // AI
  AI_RESPONSE: 'ai:response',
  AI_TYPING: 'ai:typing',

  // Error
  ERROR: 'error',
} as const;

// Cache keys
export const CACHE_KEYS = {
  USER_SESSION: 'user:session:',
  KNOWLEDGE_BASE: 'kb:',
  INCIDENT_LIST: 'incidents:list',
  VOLUNTEER_LIST: 'volunteers:list',
} as const;

// Rate limits
export const RATE_LIMITS = {
  GLOBAL: { windowMs: 15 * 60 * 1000, max: 200 },
  AUTH: { windowMs: 15 * 60 * 1000, max: 10 },
  AI: { windowMs: 60 * 1000, max: 20 },
} as const;
