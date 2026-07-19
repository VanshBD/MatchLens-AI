'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { HeartPulse, AlertTriangle, Activity, CheckCircle } from 'lucide-react';
import { incidentApi } from '@/lib/api';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { formatRelativeTime } from '@/lib/utils';
import { RoleGuard } from '@/components/layout/RoleGuard';

export default function MedicalDashboard() {
  const { data: emergencies } = useQuery({
    queryKey: ['medical-emergencies'],
    queryFn: () => incidentApi.getMedicalEmergencies().then((r) => r.data.data),
    refetchInterval: 10000,
  });

  const { data: stats } = useQuery({
    queryKey: ['incident-stats'],
    queryFn: () => incidentApi.getStats().then((r) => r.data.data),
    refetchInterval: 30000,
  });

  return (
    <RoleGuard allowedRoles={['admin', 'medical']}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
          <HeartPulse className="w-6 h-6 text-red-600" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Medical Dashboard</h1>
          <p className="text-muted-foreground text-sm">Emergency medical operations center</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
          All Stations Ready
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Active Cases" value={emergencies?.length || 0} icon={AlertTriangle} iconColor="text-red-500" />
        <StatsCard title="Medical Incidents" value={stats?.byType?.medical_emergency || 0} icon={HeartPulse} iconColor="text-red-500" />
        <StatsCard title="Total Resolved" value={stats?.byStatus?.resolved || 0} icon={CheckCircle} iconColor="text-green-500" />
        <StatsCard title="Response Status" value="Ready" icon={Activity} iconColor="text-blue-500" />
      </div>

      <section>
        <h2 className="font-semibold text-lg mb-4">Active Medical Cases</h2>
        {emergencies && emergencies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list">
            {emergencies.map((e: {
              _id: string;
              emergencyType: string;
              location: string;
              patientDescription: string;
              nearestMedicalStation?: string;
              crowdDiversionPlan?: string;
              createdAt: string;
            }) => (
              <article
                key={e._id}
                role="listitem"
                className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-foreground capitalize">
                      {e.emergencyType?.replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm text-muted-foreground">{e.location}</p>
                  </div>
                  <time className="text-xs text-muted-foreground">
                    {formatRelativeTime(e.createdAt)}
                  </time>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {e.patientDescription}
                </p>
                {e.nearestMedicalStation && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 text-xs text-blue-600 dark:text-blue-400">
                    <strong>Nearest Station:</strong> {e.nearestMedicalStation}
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-10 text-center">
            <HeartPulse className="w-10 h-10 text-green-500 mx-auto mb-3" aria-hidden="true" />
            <p className="text-green-600 dark:text-green-400 font-semibold">No active medical emergencies</p>
            <p className="text-muted-foreground text-sm mt-1">All medical teams are on standby</p>
          </div>
        )}
      </section>
    </motion.div>
    </RoleGuard>
  );
}
