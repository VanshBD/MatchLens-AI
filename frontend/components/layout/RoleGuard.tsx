'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, UserRole } from '@/lib/auth';
import { canAccess, ROLE_HOME } from '@/lib/rbac';
import { Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface RoleGuardProps {
  children: React.ReactNode;
  /** Explicitly allowed roles for this page (optional — uses ROUTE_ROLES if not set) */
  allowedRoles?: UserRole[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const hasAccess = (() => {
    if (!isAuthenticated || !user) return false;
    if (allowedRoles) return allowedRoles.includes(user.role);
    return canAccess(user.role, pathname);
  })();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (!hasAccess) {
      // Redirect to their own dashboard after a short delay
      const timer = setTimeout(() => {
        router.replace(ROLE_HOME[user!.role]);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, hasAccess, router, user]);

  // Not authenticated — layout handles redirect
  if (!isAuthenticated || !user) return null;

  // Access denied — show clear error and redirect
  if (!hasAccess) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center"
        role="alert"
        aria-live="assertive"
      >
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-red-600" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-1 max-w-sm">
          Your role ({' '}
          <span className="font-semibold capitalize text-foreground">{user.role}</span>
          {' '}) does not have permission to access this page.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Redirecting you to your dashboard…
        </p>
        <Link
          href={ROLE_HOME[user.role]}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Go to my dashboard
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
