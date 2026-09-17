"use client";

import { CircleMarker, Tooltip } from "react-leaflet";
import SurabayaMap from "@/components/maps/SurabayaMap";
import { METRIC_META, type DistrictMetric, type DistrictStats } from "@/lib/impact-aggregation";

/** Graduated circles at approximate kecamatan centroids (district-level only). */
export default function ImpactMapCanvas({
  stats,
  metric,
  selectedId,
  onSelect,
  className,
}: {
  stats: DistrictStats[];
  metric: DistrictMetric;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
}) {
  const meta = METRIC_META[metric];
  const max = Math.max(1, ...stats.map((d) => d[metric]));

  return (
    <SurabayaMap className={className}>
      {stats.map((d) => {
        const v = d[metric];
        const ratio = v / max;
        const selected = d.kecamatan.id === selectedId;
        return (
          <CircleMarker
            key={d.kecamatan.id}
            center={d.kecamatan.center}
            radius={v === 0 ? 4 : 6 + Math.sqrt(ratio) * 20}
            pathOptions={{
              color: selected ? "#111827" : "#ffffff",
              weight: selected ? 3 : 1.5,
              fillColor: meta.color,
              fillOpacity: v === 0 ? 0.15 : 0.25 + ratio * 0.55,
            }}
            eventHandlers={onSelect ? { click: () => onSelect(d.kecamatan.id) } : undefined}
          >
            <Tooltip>
              <strong>{d.kecamatan.name}</strong>: {v.toLocaleString("en-US")} {meta.unit}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </SurabayaMap>
  );
}
