'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, UserRole } from '@/lib/auth';

export function useRequireAuth(allowedRoles?: UserRole[]) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      // Redirect to their appropriate dashboard
      const roleRoutes: Record<UserRole, string> = {
        admin: '/admin',
        organizer: '/organizer',
        security: '/security',
        medical: '/medical',
        volunteer: '/volunteer',
      };
      router.replace(roleRoutes[user.role] || '/volunteer');
    }
  }, [isAuthenticated, user, allowedRoles, router]);

  return { isAuthenticated, user };
}

export function useCurrentUser() {
  const { user } = useAuthStore();
  return user;
}
