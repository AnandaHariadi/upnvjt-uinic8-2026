"use client";

/**
 * Leaflet base map for the Surabaya pilot. Client-only: import the files that
 * use it with next/dynamic({ ssr: false }).
 */

import "leaflet/dist/leaflet.css";
import { MapContainer, Polygon, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { SURABAYA_APPROX_OUTLINE, SURABAYA_BOUNDS, SURABAYA_CENTER } from "@/config/surabaya";
import { siteConfig } from "@/config/site";

function MapAutoResize() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    if (!container) return;

    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });

    observer.observe(container);
    map.invalidateSize();

    return () => {
      observer.disconnect();
    };
  }, [map]);

  return null;
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onClick(e.latlng.lat, e.latlng.lng) });
  return null;
}

export default function SurabayaMap({
  children,
  className = "h-[420px]",
  zoom = 12,
  onMapClick,
  showOutline = true,
}: {
  children?: ReactNode;
  className?: string;
  zoom?: number;
  onMapClick?: (lat: number, lng: number) => void;
  showOutline?: boolean;
}) {
  const pad = 0.08;
  return (
    <div className={`relative z-0 isolate overflow-hidden rounded-[12px] border border-[#E5E7EB] ${className}`}>
      <MapContainer
        center={SURABAYA_CENTER}
        zoom={zoom}
        minZoom={11}
        maxBounds={[
          [SURABAYA_BOUNDS.south - pad, SURABAYA_BOUNDS.west - pad],
          [SURABAYA_BOUNDS.north + pad, SURABAYA_BOUNDS.east + pad],
        ]}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
        attributionControl
      >
        <MapAutoResize />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={siteConfig.mapTileUrl}
        />
        {showOutline && (
          <Polygon
            positions={SURABAYA_APPROX_OUTLINE}
            pathOptions={{ color: "#2D5F3F", weight: 2.5, dashArray: "6 6", fillColor: "#7AC74F", fillOpacity: 0.05 }}
          >
            <Tooltip sticky>Surabaya, approximate city outline for orientation only</Tooltip>
          </Polygon>
        )}
        {onMapClick && <ClickHandler onClick={onMapClick} />}
        {children}
      </MapContainer>
    </div>
  );
}

export { MapLoading } from "./MapLoading";
