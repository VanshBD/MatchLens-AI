'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { MapPin, Loader2 } from 'lucide-react';

// Stadium locations for FIFA World Cup 2026 host cities
export const STADIUM_LOCATIONS: Record<string, { lat: number; lng: number; name: string; city: string }> = {
  metlife: { lat: 40.8135, lng: -74.0745, name: 'MetLife Stadium', city: 'New York/New Jersey' },
  sofi: { lat: 33.9534, lng: -118.3392, name: 'SoFi Stadium', city: 'Los Angeles' },
  att: { lat: 32.7473, lng: -97.0945, name: 'AT&T Stadium', city: 'Dallas' },
  levis: { lat: 37.4033, lng: -121.9694, name: "Levi's Stadium", city: 'San Francisco' },
  arrowhead: { lat: 39.0490, lng: -94.4839, name: 'Arrowhead Stadium', city: 'Kansas City' },
  mercedes: { lat: 33.7554, lng: -84.4007, name: 'Mercedes-Benz Stadium', city: 'Atlanta' },
  nrg: { lat: 29.6847, lng: -95.4107, name: 'NRG Stadium', city: 'Houston' },
  azul: { lat: 19.3029, lng: -99.1505, name: 'Estadio Azteca', city: 'Mexico City' },
  bbandt: { lat: 35.2258, lng: -80.8528, name: 'Bank of America Stadium', city: 'Charlotte' },
  lincoln: { lat: 39.9009, lng: -75.1675, name: 'Lincoln Financial Field', city: 'Philadelphia' },
};

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: 'incident' | 'medical' | 'security' | 'lost_child' | 'volunteer' | 'info';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
}

interface StadiumMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  height?: string;
  className?: string;
  onMarkerClick?: (marker: MapMarker) => void;
  showControls?: boolean;
  stadiumId?: keyof typeof STADIUM_LOCATIONS;
}

const MARKER_COLORS: Record<MapMarker['type'], string> = {
  incident: '#f97316',
  medical: '#ef4444',
  security: '#3b82f6',
  lost_child: '#f59e0b',
  volunteer: '#22c55e',
  info: '#6366f1',
};

const SEVERITY_PULSE: Record<string, boolean> = {
  critical: true,
  high: false,
  medium: false,
  low: false,
};

// Dynamic import wrapper — Leaflet must be client-only
let leafletLoaded = false;

export default function StadiumMap({
  center,
  zoom = 15,
  markers = [],
  height = '400px',
  className,
  onMarkerClick,
  showControls = true,
  stadiumId = 'metlife',
}: StadiumMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stadium = STADIUM_LOCATIONS[stadiumId];
  const mapCenter: [number, number] = center || [stadium.lat, stadium.lng];

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    let map: unknown;

    const initMap = async () => {
      try {
        // Dynamic import — avoids SSR issues
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');

        // Fix default marker icons (webpack issue)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        if (mapInstanceRef.current) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (mapInstanceRef.current as any).remove();
          mapInstanceRef.current = null;
        }

        // Create map
        map = L.map(mapRef.current!, {
          center: mapCenter,
          zoom,
          zoomControl: showControls,
          attributionControl: true,
        });

        mapInstanceRef.current = map;

        // OpenStreetMap tile layer — completely free, no API key
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
          maxZoom: 19,
          crossOrigin: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }).addTo(map as any);

        // Add stadium boundary circle
        L.circle(mapCenter, {
          color: '#003366',
          fillColor: '#003366',
          fillOpacity: 0.05,
          weight: 2,
          radius: 300,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }).addTo(map as any);

        // Add stadium label
        L.marker(mapCenter, {
          icon: L.divIcon({
            className: '',
            html: `<div style="
              background: #003366;
              color: white;
              padding: 4px 8px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 600;
              white-space: nowrap;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              border: 1px solid rgba(255,255,255,0.2);
            ">${stadium.name}</div>`,
            iconAnchor: [0, 0],
          }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }).addTo(map as any);

        // Add incident markers
        markersRef.current = markers.map((marker) => {
          const color = MARKER_COLORS[marker.type];
          const pulse = marker.severity && SEVERITY_PULSE[marker.severity];

          const icon = L.divIcon({
            className: '',
            html: `<div style="position:relative;">
              ${pulse ? `<div style="
                position: absolute;
                top: -4px; left: -4px;
                width: 24px; height: 24px;
                background: ${color};
                border-radius: 50%;
                opacity: 0.4;
                animation: pulse 1.5s infinite;
              "></div>` : ''}
              <div style="
                width: 16px; height: 16px;
                background: ${color};
                border: 2px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                cursor: pointer;
              "></div>
            </div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });

          const m = L.marker([marker.lat, marker.lng], { icon });

          // Accessible popup
          const popupContent = `
            <div style="min-width: 160px; font-family: system-ui, sans-serif;">
              <div style="font-weight: 600; font-size: 13px; color: #1e293b; margin-bottom: 4px;">
                ${marker.title}
              </div>
              ${marker.description ? `<div style="font-size: 12px; color: #64748b;">${marker.description}</div>` : ''}
              ${marker.severity ? `<div style="
                display: inline-block;
                margin-top: 6px;
                font-size: 11px;
                font-weight: 600;
                padding: 2px 8px;
                border-radius: 12px;
                background: ${color}20;
                color: ${color};
                text-transform: capitalize;
              ">${marker.severity}</div>` : ''}
            </div>
          `;

          m.bindPopup(popupContent, { maxWidth: 220 });

          if (onMarkerClick) {
            m.on('click', () => onMarkerClick(marker));
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          m.addTo(map as any);
          return m;
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Map init error:', err);
        setError('Map could not be loaded');
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstanceRef.current as any).remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stadiumId]);

  // Update markers when they change
  useEffect(() => {
    if (!mapInstanceRef.current || isLoading) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;

      // Remove old markers
      markersRef.current.forEach((m) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (m as any).remove();
      });

      // Add new markers
      markersRef.current = markers.map((marker) => {
        const color = MARKER_COLORS[marker.type];
        const icon = L.divIcon({
          className: '',
          html: `<div style="
            width: 16px; height: 16px;
            background: ${color};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          "></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        const m = L.marker([marker.lat, marker.lng], { icon });
        m.bindPopup(`<strong>${marker.title}</strong>${marker.description ? `<br/>${marker.description}` : ''}`);
        if (onMarkerClick) m.on('click', () => onMarkerClick(marker));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        m.addTo(mapInstanceRef.current as any);
        return m;
      });
    };

    updateMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers]);

  if (error) {
    return (
      <div
        className={cn('flex items-center justify-center bg-muted rounded-xl border border-border', className)}
        style={{ height }}
        role="img"
        aria-label="Map unavailable"
      >
        <div className="text-center">
          <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative rounded-xl overflow-hidden border border-border', className)} style={{ height }}>
      {/* Loading overlay */}
      {isLoading && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-muted"
          role="status"
          aria-live="polite"
          aria-label="Loading map"
        >
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Loading map…</p>
          </div>
        </div>
      )}

      {/* Map legend */}
      {!isLoading && markers.length > 0 && (
        <div
          className="absolute bottom-3 left-3 z-[400] bg-white/90 backdrop-blur rounded-lg p-2 shadow text-xs space-y-1"
          role="complementary"
          aria-label="Map legend"
        >
          {Object.entries(MARKER_COLORS).map(([type, color]) => {
            const hasType = markers.some((m) => m.type === type);
            if (!hasType) return null;
            return (
              <div key={type} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: color }}
                  aria-hidden="true"
                />
                <span className="capitalize text-gray-700">{type.replace('_', ' ')}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Actual map container */}
      <div
        ref={mapRef}
        style={{ height: '100%', width: '100%' }}
        role="application"
        aria-label={`Interactive map of ${stadium.name}, ${stadium.city}`}
        aria-roledescription="Interactive map"
      />
    </div>
  );
}
