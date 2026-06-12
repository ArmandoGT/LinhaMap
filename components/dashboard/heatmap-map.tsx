"use client";

import "leaflet/dist/leaflet.css";
import "leaflet.heat";

import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";

const ARIQUEMES_CENTER: [number, number] = [-9.93, -63.05];

function HeatLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap();
  useEffect(() => {
    const layer = L.heatLayer(points, {
      radius: 28,
      blur: 20,
      maxZoom: 13,
      gradient: { 0.2: "#16a34a", 0.4: "#eab308", 0.7: "#f97316", 1.0: "#dc2626" },
    });
    layer.addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [map, points]);
  return null;
}

/** Mapa de calor das denúncias — carregado client-only (ssr:false). */
export default function HeatmapMap({ points }: { points: [number, number, number][] }) {
  return (
    <MapContainer
      center={ARIQUEMES_CENTER}
      zoom={11}
      scrollWheelZoom={false}
      className="h-full w-full"
      style={{ background: "#e8eef0" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <HeatLayer points={points} />
    </MapContainer>
  );
}
