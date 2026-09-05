"use client";

import { CircleMarker, Tooltip } from "react-leaflet";
import SurabayaMap from "@/components/maps/SurabayaMap";
import { SEVERITY_CONFIG, STATUS_CONFIG, type WasteReport } from "@/store/wasteReport.store";

/**
 * Report markers on the Surabaya map. `precision` rounds coordinates for
 * public views (3 decimals ≈ 100 m); responders can use full precision.
 */
export default function WasteMapCanvas({
  reports,
  onSelect,
  precision = 3,
  className,
  picked,
  onPick,
}: {
  reports: WasteReport[];
  onSelect?: (r: WasteReport) => void;
  precision?: number;
  className?: string;
  picked?: { lat: number; lng: number } | null;
  onPick?: (lat: number, lng: number) => void;
}) {
  const round = (n: number) => Number(n.toFixed(precision));
  return (
    <SurabayaMap className={className} onMapClick={onPick}>
      {reports.map((r) => {
        const sev = SEVERITY_CONFIG[r.severity];
        const done = r.status === "resolved" || r.status === "rejected";
        return (
          <CircleMarker
            key={r.id}
            center={[round(r.lat), round(r.lng)]}
            radius={r.severity === "critical" ? 11 : r.severity === "high" ? 9 : 7}
            pathOptions={{ color: "#ffffff", weight: 2, fillColor: sev.color, fillOpacity: done ? 0.35 : 0.85 }}
            eventHandlers={onSelect ? { click: () => onSelect(r) } : undefined}
          >
            <Tooltip>
              {r.title} · {sev.label} · {STATUS_CONFIG[r.status].label}
            </Tooltip>
          </CircleMarker>
        );
      })}
      {picked && (
        <CircleMarker center={[picked.lat, picked.lng]} radius={10} pathOptions={{ color: "#ffffff", weight: 3, fillColor: "#2D5F3F", fillOpacity: 1 }}>
          <Tooltip permanent direction="top">Selected location</Tooltip>
        </CircleMarker>
      )}
    </SurabayaMap>
  );
}
