'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Baby,
  HeartPulse,
  Brain,
  Plus,
  Bell,
  Activity,
  Map,
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { incidentApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { IncidentCard } from '@/components/dashboard/IncidentCard';
import { RoleGuard } from '@/components/layout/RoleGuard';

// Dynamic import — Leaflet is browser-only
const IncidentMap = dynamic(
  () => import('@/components/map/IncidentMap').then((m) => m.IncidentMap),
  { ssr: false, loading: () => <div className="h-64 bg-muted rounded-xl animate-pulse" aria-hidden="true" /> }
);

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function VolunteerDashboard() {
  const { user } = useAuthStore();

  const { data: stats } = useQuery({
    queryKey: ['incident-stats'],
    queryFn: () => incidentApi.getStats().then((r) => r.data.data),
    refetchInterval: 30000,
  });

  const { data: recentIncidents } = useQuery({
    queryKey: ['recent-incidents'],
    queryFn: () =>
      incidentApi
        .getAll({ limit: 10, sortBy: 'createdAt', sortOrder: 'desc' })
        .then((r) => r.data.data),
    refetchInterval: 15000,
  });

  const quickActions = [
    {
      href: '/incidents/lost-child',
      icon: '👶',
      label: 'Report Lost Child',
      description: 'AI-powered search protocol',
      color: 'border-amber-200/60 hover:border-amber-300 dark:border-amber-800/60 dark:hover:border-amber-700',
      iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    },
    {
      href: '/incidents/medical',
      icon: '🏥',
      label: 'Medical Emergency',
      description: 'Immediate protocol guidance',
      color: 'border-red-200/60 hover:border-red-300 dark:border-red-800/60 dark:hover:border-red-700',
      iconBg: 'bg-red-100 dark:bg-red-900/40',
    },
    {
      href: '/ai-assistant',
      icon: '🤖',
      label: 'Ask AI Copilot',
      description: 'Get instant guidance',
      color: 'border-blue-200/60 hover:border-blue-300 dark:border-blue-800/60 dark:hover:border-blue-700',
      iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    },
    {
      href: '/incidents',
      icon: '👥',
      label: 'Crowd Alert',
      description: 'Report crowd buildup',
      color: 'border-purple-200/60 hover:border-purple-300 dark:border-purple-800/60 dark:hover:border-purple-700',
      iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    },
  ];

  return (
    <RoleGuard allowedRoles={['admin', 'volunteer']}>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            FIFA World Cup 2026 – Stadium Operations Dashboard
          </p>
        </div>
        <Link
          href="/incidents"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          New Incident
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Open Incidents"
          value={stats?.byStatus?.open ?? 0}
          icon={AlertTriangle}
          iconColor="text-orange-500"
          description="Requires attention"
        />
        <StatsCard
          title="In Progress"
          value={stats?.byStatus?.in_progress ?? 0}
          icon={Activity}
          iconColor="text-blue-500"
          description="Being handled"
        />
        <StatsCard
          title="Lost Children"
          value={stats?.byType?.lost_child ?? 0}
          icon={Baby}
          iconColor="text-amber-500"
          description="Active searches"
        />
        <StatsCard
          title="Medical Alerts"
          value={stats?.byType?.medical_emergency ?? 0}
          icon={HeartPulse}
          iconColor="text-red-500"
          description="Active emergencies"
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.section variants={item}>
        <h2 className="text-lg font-semibold text-foreground mb-3">Quick Actions</h2>
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
          role="list"
          aria-label="Quick action buttons"
        >
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              role="listitem"
              className={`bg-card border rounded-xl p-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:shadow-md ${action.color}`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-2xl mb-3 ${action.iconBg}`}
                aria-hidden="true"
              >
                {action.icon}
              </div>
              <p className="font-semibold text-sm text-foreground">{action.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* Live Map */}
      <motion.section variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Map className="w-5 h-5 text-primary" aria-hidden="true" />
            Live Incident Map
          </h2>
          <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
            OpenStreetMap · Free
          </span>
        </div>
        <IncidentMap
          incidents={recentIncidents || []}
          height="300px"
          className="shadow-sm"
        />
      </motion.section>

      {/* Recent Incidents */}
      <motion.section variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Recent Incidents</h2>
          <Link
            href="/incidents"
            className="text-sm text-primary hover:underline focus:outline-none focus:underline"
          >
            View all
          </Link>
        </div>

        {recentIncidents && recentIncidents.length > 0 ? (
          <div className="space-y-3" role="list" aria-label="Recent incidents">
            {recentIncidents
              .slice(0, 5)
              .map((incident: Parameters<typeof IncidentCard>[0]['incident']) => (
                <div key={incident._id} role="listitem">
                  <IncidentCard
                    incident={incident}
                    onClick={(i) => (window.location.href = `/incidents/${i._id}`)}
                    compact
                  />
                </div>
              ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
            <p className="text-muted-foreground text-sm">No recent incidents</p>
          </div>
        )}
      </motion.section>

      {/* AI Assistant CTA */}
      <motion.section variants={item}>
        <Link
          href="/ai-assistant"
          className="block bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-2xl p-6 hover:opacity-95 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain className="w-8 h-8" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Copilot Ready</h3>
              <p className="text-white/80 text-sm mt-0.5">
                Ask for guidance on any situation — crowd management to medical protocols.
                Powered by Google Gemini.
              </p>
            </div>
          </div>
        </Link>
      </motion.section>
    </motion.div>
    </RoleGuard>
  );
}
