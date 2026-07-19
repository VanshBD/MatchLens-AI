import { UserRole } from './auth';

/**
 * Route → allowed roles mapping
 * Admin can access ALL routes
 */
export const ROUTE_ROLES: Record<string, UserRole[]> = {
  '/volunteer':          ['volunteer'],
  '/organizer':          ['organizer'],
  '/security':           ['security'],
  '/medical':            ['medical'],
  '/admin':              ['admin'],
  '/admin/users':        ['admin'],
  '/admin/roles':        ['admin'],
  '/admin/knowledge':    ['admin', 'organizer'],
  '/admin/analytics':    ['admin', 'organizer'],
  '/admin/audit':        ['admin'],
  '/admin/prompts':      ['admin'],
  '/incidents':          ['admin', 'organizer', 'security', 'medical', 'volunteer'],
  '/incidents/lost-child': ['admin', 'organizer', 'security', 'volunteer'],
  '/incidents/medical':  ['admin', 'organizer', 'medical', 'volunteer'],
  '/ai-assistant':       ['admin', 'organizer', 'security', 'medical', 'volunteer'],
  '/notifications':      ['admin', 'organizer', 'security', 'medical', 'volunteer'],
};

/**
 * Default redirect per role after login
 */
export const ROLE_HOME: Record<UserRole, string> = {
  admin:     '/admin',
  organizer: '/organizer',
  security:  '/security',
  medical:   '/medical',
  volunteer: '/volunteer',
};

/**
 * Check if a role is allowed to access a route
 * Admin always has access
 */
export function canAccess(role: UserRole, path: string): boolean {
  if (role === 'admin') return true;

  // Exact match first
  if (ROUTE_ROLES[path]) {
    return ROUTE_ROLES[path].includes(role);
  }

  // Prefix match for nested routes (e.g. /admin/users matches /admin)
  const matchedRoute = Object.keys(ROUTE_ROLES)
    .filter((r) => path.startsWith(r))
    .sort((a, b) => b.length - a.length)[0]; // most specific match

  if (matchedRoute) {
    return ROUTE_ROLES[matchedRoute].includes(role);
  }

  // Unknown routes — allow authenticated users
  return true;
}
