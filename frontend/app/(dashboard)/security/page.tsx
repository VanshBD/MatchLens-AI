'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Shield, Baby, AlertTriangle, Eye } from 'lucide-react';
import { incidentApi } from '@/lib/api';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { IncidentCard } from '@/components/dashboard/IncidentCard';
import { RoleGuard } from '@/components/layout/RoleGuard';

export default function SecurityDashboard() {
  const { data: lostChildCases } = useQuery({
    queryKey: ['lost-child-active'],
    queryFn: () => incidentApi.getLostChildCases().then((r) => r.data.data),
    refetchInterval: 10000,
  });

  const { data: incidents } = useQuery({
    queryKey: ['security-incidents'],
    queryFn: () =>
      incidentApi.getAll({
        type: 'security_threat',
        limit: 10,
        sortOrder: 'desc',
      }).then((r) => r.data.data),
    refetchInterval: 10000,
  });

  const { data: allIncidents } = useQuery({
    queryKey: ['all-incidents-security'],
    queryFn: () =>
      incidentApi.getAll({ status: 'open', limit: 20, sortOrder: 'desc' }).then((r) => r.data.data),
    refetchInterval: 10000,
  });

  return (
    <RoleGuard allowedRoles={['admin', 'security']}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-red-600" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground text-sm">Real-time security monitoring</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
          Live
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Lost Children"
          value={lostChildCases?.length || 0}
          icon={Baby}
          iconColor="text-amber-600"
          description="Active searches"
        />
        <StatsCard
          title="Security Alerts"
          value={incidents?.length || 0}
          icon={AlertTriangle}
          iconColor="text-red-600"
          description="Requires response"
        />
        <StatsCard
          title="Open Incidents"
          value={allIncidents?.length || 0}
          icon={Eye}
          iconColor="text-blue-600"
          description="Monitoring"
        />
        <StatsCard
          title="Perimeter Status"
          value="Secure"
          icon={Shield}
          iconColor="text-green-600"
          description="All gates normal"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lost Children Section */}
        <section>
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Baby className="w-4 h-4 text-amber-600" aria-hidden="true" />
            Active Child Searches
          </h2>
          {lostChildCases && lostChildCases.length > 0 ? (
            <div className="space-y-3" role="list">
              {lostChildCases.map((c: { _id: string; childName?: string; childDescription: string; lastSeenLocation: string; status: string; aiSearchProtocol?: string[] }) => (
                <div key={c._id} role="listitem" className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-amber-600 dark:text-amber-400">
                        {c.childName || 'Unknown Child'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{c.childDescription}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last seen: {c.lastSeenLocation}
                      </p>
                    </div>
                    <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-full font-medium capitalize">
                      {c.status}
                    </span>
                  </div>
                  {c.aiSearchProtocol && (
                    <div className="mt-3 border-t border-border pt-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">AI Protocol:</p>
                      <p className="text-xs text-muted-foreground">{c.aiSearchProtocol[0]}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
              <p className="text-green-600 dark:text-green-400 font-medium">No active child searches</p>
            </div>
          )}
        </section>

        {/* Open Incidents */}
        <section>
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" aria-hidden="true" />
            Open Incidents
          </h2>
          <div className="space-y-2" role="list">
            {allIncidents?.slice(0, 8).map((inc: Parameters<typeof IncidentCard>[0]['incident']) => (
              <div key={inc._id} role="listitem">
                <IncidentCard incident={inc} compact />
              </div>
            ))}
            {(!allIncidents || allIncidents.length === 0) && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
                <p className="text-green-600 dark:text-green-400 font-medium">All clear – no open incidents</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </motion.div>
    </RoleGuard>
  );
}
