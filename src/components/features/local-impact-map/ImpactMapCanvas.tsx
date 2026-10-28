"use client";

import { useEffect, useRef } from "react";
import { CircleMarker, Tooltip, useMap } from "react-leaflet";
import SurabayaMap from "@/components/maps/SurabayaMap";
import { METRIC_META, type DistrictMetric, type DistrictStats } from "@/lib/impact-aggregation";
import { SURABAYA_CENTER } from "@/config/surabaya";

/** Graduated circles at approximate kecamatan centroids (district-level only). */
function SelectedDistrictFocus({ selectedId, stats }: { selectedId?: string | null; stats: DistrictStats[] }) {
  const map = useMap();
  const prevSelectedRef = useRef<string | null>(null);

  useEffect(() => {
    if (selectedId) {
      const target = stats.find((d) => d.kecamatan.id === selectedId);
      if (target) {
        map.panTo(target.kecamatan.center, { animate: true, duration: 0.6 });
      }
    } else if (prevSelectedRef.current && !selectedId) {
      map.setView(SURABAYA_CENTER, 12, { animate: true });
    }
    prevSelectedRef.current = selectedId ?? null;
  }, [selectedId, stats, map]);

  return null;
}

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
      <SelectedDistrictFocus selectedId={selectedId} stats={stats} />
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
