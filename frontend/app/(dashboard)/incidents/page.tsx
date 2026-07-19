'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AlertTriangle, Search, Filter, RefreshCw } from 'lucide-react';
import { incidentApi } from '@/lib/api';
import { IncidentCard } from '@/components/dashboard/IncidentCard';
import { cn } from '@/lib/utils';

const INCIDENT_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'lost_child', label: 'Lost Child' },
  { value: 'medical_emergency', label: 'Medical' },
  { value: 'crowd_issue', label: 'Crowd Issue' },
  { value: 'security_threat', label: 'Security' },
  { value: 'accessibility', label: 'Accessibility' },
  { value: 'general', label: 'General' },
];

const SEVERITY_OPTIONS = [
  { value: '', label: 'All Severity' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

export default function IncidentsPage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['incidents', { search, type, severity, status, page }],
    queryFn: () =>
      incidentApi
        .getAll({
          search: search || undefined,
          type: type || undefined,
          severity: severity || undefined,
          status: status || undefined,
          page,
          limit: 20,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
    refetchInterval: 30000,
  });

  type IncidentsData = { data: Parameters<typeof IncidentCard>[0]['incident'][]; pagination: { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrev: boolean } };
  const incidents = (data as IncidentsData)?.data || [];
  const pagination = (data as IncidentsData)?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-orange-600" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">All Incidents</h1>
            <p className="text-muted-foreground text-sm">
              {pagination?.total ?? 0} total incidents
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-card border border-border rounded-xl hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          aria-label="Refresh incidents"
        >
          <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} aria-hidden="true" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" role="search" aria-label="Filter incidents">
          {/* Search */}
          <div className="relative">
            <label htmlFor="incident-search" className="sr-only">Search incidents</label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <input
              id="incident-search"
              type="search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search incidents..."
              className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-background"
            />
          </div>

          {/* Type filter */}
          <div>
            <label htmlFor="type-filter" className="sr-only">Filter by type</label>
            <select
              id="type-filter"
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); }}
              className="w-full px-3 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-background"
            >
              {INCIDENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Severity filter */}
          <div>
            <label htmlFor="severity-filter" className="sr-only">Filter by severity</label>
            <select
              id="severity-filter"
              value={severity}
              onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
              className="w-full px-3 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-background"
            >
              {SEVERITY_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label htmlFor="status-filter" className="sr-only">Filter by status</label>
            <select
              id="status-filter"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full px-3 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-background"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Incidents List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-card border border-border rounded-xl skeleton" aria-hidden="true" />
          ))}
        </div>
      ) : incidents.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
          role="list"
          aria-label="Incidents list"
          aria-live="polite"
        >
          {incidents.map((incident: Parameters<typeof IncidentCard>[0]['incident']) => (
            <div key={incident._id} role="listitem">
              <IncidentCard
                incident={incident}
                onClick={(i) => (window.location.href = `/incidents/${i._id}`)}
              />
            </div>
          ))}
        </motion.div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <AlertTriangle className="w-10 h-10 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
          <p className="text-foreground font-medium">No incidents found</p>
          <p className="text-muted-foreground text-sm mt-1">
            {search || type || severity || status
              ? 'Try adjusting your filters'
              : 'All clear — no incidents reported'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!pagination.hasPrev}
            className="px-4 py-2 text-sm border border-border rounded-xl hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Previous page"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground" aria-current="page">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!pagination.hasNext}
            className="px-4 py-2 text-sm border border-border rounded-xl hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Next page"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
