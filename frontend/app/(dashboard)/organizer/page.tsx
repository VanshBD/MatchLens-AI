'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart3, AlertTriangle, CheckCircle, Activity, TrendingUp, Map } from 'lucide-react';
import dynamic from 'next/dynamic';
import { incidentApi } from '@/lib/api';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { IncidentCard } from '@/components/dashboard/IncidentCard';
import { RoleGuard } from '@/components/layout/RoleGuard';

const IncidentMap = dynamic(
  () => import('@/components/map/IncidentMap').then((m) => m.IncidentMap),
  { ssr: false, loading: () => <div className="h-72 bg-muted rounded-xl animate-pulse" aria-hidden="true" /> }
);

export default function OrganizerDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['incident-stats'],
    queryFn: () => incidentApi.getStats().then((r) => r.data.data),
    refetchInterval: 30000,
  });

  const { data: incidents } = useQuery({
    queryKey: ['recent-incidents', 'organizer'],
    queryFn: () =>
      incidentApi
        .getAll({ limit: 20, sortBy: 'createdAt', sortOrder: 'desc' })
        .then((r) => r.data.data),
    refetchInterval: 15000,
  });

  return (
    <RoleGuard allowedRoles={['admin', 'organizer']}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Operations Dashboard</h1>
        <p className="text-muted-foreground mt-1">Live stadium operations overview — FIFA World Cup 2026</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Incidents" value={stats?.total ?? 0} icon={BarChart3} iconColor="text-blue-500" />
        <StatsCard title="Open" value={stats?.byStatus?.open ?? 0} icon={AlertTriangle} iconColor="text-orange-500" />
        <StatsCard title="In Progress" value={stats?.byStatus?.in_progress ?? 0} icon={Activity} iconColor="text-blue-500" />
        <StatsCard title="Resolved" value={stats?.byStatus?.resolved ?? 0} icon={CheckCircle} iconColor="text-green-500" />
      </div>

      {/* Live Map */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Map className="w-5 h-5 text-primary" aria-hidden="true" />
          Stadium Incident Map
        </h2>
        <IncidentMap incidents={incidents || []} height="350px" />
      </section>

      {/* Breakdown grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* By Type */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" aria-hidden="true" />
            By Type
          </h2>
          <div className="space-y-3">
            {stats?.byType &&
              Object.entries(stats.byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground capitalize">{type.replace(/_/g, ' ')}</span>
                  <span className="font-semibold text-foreground">{count as number}</span>
                </div>
              ))}
          </div>
        </div>

        {/* By Severity */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-semibold mb-4">By Severity</h2>
          <div className="space-y-3">
            {[
              { key: 'critical', label: 'Critical', color: 'bg-red-500' },
              { key: 'high', label: 'High', color: 'bg-orange-500' },
              { key: 'medium', label: 'Medium', color: 'bg-amber-500' },
              { key: 'low', label: 'Low', color: 'bg-green-500' },
            ].map(({ key, label, color }) => {
              const count = (stats?.bySeverity?.[key] as number) || 0;
              const total = stats?.total || 1;
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.round((count / total) * 100)}%` }}
                      role="progressbar"
                      aria-valuenow={count}
                      aria-valuemax={total}
                      aria-label={`${label}: ${count} of ${total}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Feed */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
            Live Feed
          </h2>
          <div className="space-y-2" role="list" aria-label="Live incident feed" aria-live="polite">
            {incidents?.slice(0, 5).map((inc: Parameters<typeof IncidentCard>[0]['incident']) => (
              <div key={inc._id} role="listitem">
                <IncidentCard incident={inc} compact />
              </div>
            ))}
            {(!incidents || incidents.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No incidents</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
    </RoleGuard>
  );
}
