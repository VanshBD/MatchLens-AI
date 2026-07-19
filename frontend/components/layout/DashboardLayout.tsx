'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  AlertTriangle,
  Baby,
  HeartPulse,
  Brain,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronRight,
  Map,
} from 'lucide-react';
import { useAuthStore, ROLE_COLORS, ROLE_LABELS } from '@/lib/auth';
import { authApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { canAccess, ROLE_HOME } from '@/lib/rbac';
import toast from 'react-hot-toast';
import { SkipLink } from './SkipLink';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    href: '/volunteer',
    label: 'My Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    href: '/organizer',
    label: 'Operations',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    href: '/security',
    label: 'Security',
    icon: <Shield className="w-5 h-5" />,
  },
  {
    href: '/medical',
    label: 'Medical',
    icon: <HeartPulse className="w-5 h-5" />,
  },
  {
    href: '/admin',
    label: 'Admin',
    icon: <Settings className="w-5 h-5" />,
  },
  {
    href: '/incidents',
    label: 'All Incidents',
    icon: <AlertTriangle className="w-5 h-5" />,
  },
  {
    href: '/incidents/lost-child',
    label: 'Lost Child',
    icon: <Baby className="w-5 h-5" />,
  },
  {
    href: '/incidents/medical',
    label: 'Medical Emergencies',
    icon: <HeartPulse className="w-5 h-5" />,
  },
  {
    href: '/ai-assistant',
    label: 'AI Assistant',
    icon: <Brain className="w-5 h-5" />,
  },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      toast.success('Logged out successfully');
      router.push('/login');
    }
  };

  // Only show nav items the current user can access
  const visibleNavItems = navItems.filter(
    (item) => user && canAccess(user.role, item.href)
  );

  const Sidebar = () => (
    <nav
      className="flex flex-col h-full"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">
          <div className="w-9 h-9 fifa-gradient rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="font-bold text-foreground text-sm leading-none">MatchLens AI</p>
            <p className="text-xs text-muted-foreground mt-0.5">Volunteer Copilot</p>
          </div>
        </Link>
      </div>

      {/* User info */}
      {user && (
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 text-primary font-semibold text-sm"
              aria-hidden="true"
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  ROLE_COLORS[user.role]
                )}
              >
                {ROLE_LABELS[user.role]}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1" role="list">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center" aria-label={`${item.badge} notifications`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="ml-auto w-4 h-4" aria-hidden="true" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Bottom actions */}
      <div className="p-3 border-t border-border space-y-1">
        <div className="flex items-center justify-between px-3 py-1.5">
          <span className="text-xs text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
        <Link
          href="/notifications"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <Bell className="w-5 h-5" aria-hidden="true" />
          Notifications
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <LogOut className="w-5 h-5" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Skip link — WCAG 2.4.1 */}
      <SkipLink />
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex w-64 flex-shrink-0 border-r border-border bg-card"
        aria-label="Sidebar"
      >
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border z-50 lg:hidden overflow-y-auto"
              aria-label="Mobile sidebar"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
              <Sidebar />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-muted-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Open navigation"
            aria-expanded={sidebarOpen}
            aria-controls="mobile-sidebar"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
          <span className="font-semibold text-sm">MatchLens AI</span>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link href="/notifications" aria-label="Notifications">
              <Bell className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main
          className="flex-1 overflow-y-auto"
          id="main-content"
          tabIndex={-1}
        >
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
