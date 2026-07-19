'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import type { MapMarker } from './StadiumMap';
import { STADIUM_LOCATIONS } from './StadiumMap';

// Dynamic import — Leaflet is browser-only, cannot SSR
const StadiumMap = dynamic(() => import('./StadiumMap'), {
  ssr: false,
  loading: () => (
    <div
      className="bg-muted rounded-xl flex items-center justify-center animate-pulse"
      style={{ height: '100%', minHeight: '200px' }}
      role="status"
      aria-live="polite"
      aria-label="Loading incident map"
    >
      <p className="text-sm text-muted-foreground">Loading map…</p>
    </div>
  ),
});

export interface Incident {
  _id: string;
  type: string;
  severity: string;
  title: string;
  location?: {
    latitude?: number;
    longitude?: number;
    section?: string;
    description?: string;
  };
}

interface IncidentMapProps {
  incidents: Incident[];
  height?: string;
  className?: string;
  onIncidentClick?: (incidentId: string) => void;
  stadiumId?: keyof typeof STADIUM_LOCATIONS;
}

// Small offsets to spread demo markers around stadium center
const DEMO_OFFSETS: [number, number][] = [
  [0.001, 0.002],   [-0.002, 0.001],  [0.0015, -0.001],
  [-0.001, -0.002], [0.003, 0.001],   [-0.0015, 0.003],
  [0.002, -0.003],  [-0.003, -0.001], [0.001, 0.004],
  [-0.004, 0.002],
];

const TYPE_MAP: Record<string, MapMarker['type']> = {
  lost_child: 'lost_child',
  medical_emergency: 'medical',
  security_threat: 'security',
  crowd_issue: 'incident',
  accessibility: 'info',
  general: 'volunteer',
};

export function IncidentMap({
  incidents,
  height = '350px',
  className,
  onIncidentClick,
  stadiumId = 'metlife',
}: IncidentMapProps) {
  const stadium = STADIUM_LOCATIONS[stadiumId] ?? STADIUM_LOCATIONS.metlife;

  const markers: MapMarker[] = useMemo(
    () =>
      incidents.slice(0, 20).map((inc, idx): MapMarker => {
        const offset = DEMO_OFFSETS[idx % DEMO_OFFSETS.length];
        return {
          id: inc._id,
          lat: inc.location?.latitude ?? stadium.lat + offset[0],
          lng: inc.location?.longitude ?? stadium.lng + offset[1],
          title: inc.title,
          type: TYPE_MAP[inc.type] ?? 'incident',
          severity: inc.severity as MapMarker['severity'],
          description: inc.location?.section ?? inc.location?.description,
        };
      }),
    [incidents, stadium]
  );

  return (
    <StadiumMap
      markers={markers}
      height={height}
      className={className}
      stadiumId={stadiumId}
      onMarkerClick={
        onIncidentClick ? (marker) => onIncidentClick(marker.id) : undefined
      }
    />
  );
}
