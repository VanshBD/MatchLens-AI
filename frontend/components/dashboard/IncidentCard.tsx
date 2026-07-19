'use client';

import { cn, formatRelativeTime, getSeverityColor, getStatusColor, capitalizeFirst } from '@/lib/utils';
import { MapPin, User, Clock } from 'lucide-react';

interface Incident {
  _id: string;
  incidentId: string;
  type: string;
  severity: string;
  status: string;
  title: string;
  description: string;
  location?: { description?: string; section?: string };
  reportedBy?: { name: string };
  createdAt: string;
}

interface IncidentCardProps {
  incident: Incident;
  onClick?: (incident: Incident) => void;
  compact?: boolean;
}

const INCIDENT_ICONS: Record<string, string> = {
  lost_child: '👶',
  medical_emergency: '🏥',
  crowd_issue: '👥',
  security_threat: '🚨',
  accessibility: '♿',
  general: '📋',
};

export function IncidentCard({ incident, onClick, compact = false }: IncidentCardProps) {
  return (
    <article
      className={cn(
        'bg-card border border-border rounded-xl transition-all duration-200 focus-within:ring-2 focus-within:ring-primary',
        onClick && 'cursor-pointer hover:shadow-md hover:border-primary/30',
        compact ? 'p-3' : 'p-4'
      )}
      onClick={() => onClick?.(incident)}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick(incident);
        }
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="text-2xl flex-shrink-0 w-10 h-10 flex items-center justify-center bg-muted rounded-lg"
          aria-hidden="true"
        >
          {INCIDENT_ICONS[incident.type] || '📋'}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-mono">{incident.incidentId}</p>
              <h3 className={cn('font-semibold text-foreground truncate', compact ? 'text-sm' : 'text-base')}>
                {incident.title}
              </h3>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full border font-medium',
                  getSeverityColor(incident.severity)
                )}
                aria-label={`Severity: ${incident.severity}`}
              >
                {capitalizeFirst(incident.severity)}
              </span>
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  getStatusColor(incident.status)
                )}
                aria-label={`Status: ${incident.status}`}
              >
                {capitalizeFirst(incident.status)}
              </span>
            </div>
          </div>

          {!compact && (
            <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
              {incident.description}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" aria-hidden="true" />
              <time dateTime={incident.createdAt}>{formatRelativeTime(incident.createdAt)}</time>
            </span>
            {incident.location?.description && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" aria-hidden="true" />
                {incident.location.description}
              </span>
            )}
            {incident.reportedBy && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" aria-hidden="true" />
                {incident.reportedBy.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
