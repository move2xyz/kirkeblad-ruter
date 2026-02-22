"use client";

import { useEffect, useState } from "react";
import { getStreetColor } from "@/lib/colors";

interface RouteMapProps {
  routeId: string;
  streetNames: string[];
}

export default function RouteMap({ routeId, streetNames }: RouteMapProps) {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Dynamically import Leaflet to avoid SSR issues
    const loadMap = async () => {
      const L = (await import("leaflet")).default;
      // @ts-expect-error CSS import for leaflet styles
      await import("leaflet/dist/leaflet.css");

      // Check if map already initialized
      const container = document.getElementById("route-map");
      if (!container || (container as any)._leaflet_id) return;

      const map = L.map("route-map").setView([57.06, 9.92], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      try {
        const response = await fetch(`/geojson/route-${routeId}.geojson`);
        if (!response.ok) {
          console.warn("No GeoJSON found for route", routeId);
          setMapReady(true);
          return;
        }
        const geojson = await response.json();

        const bounds = L.latLngBounds([]);
        let hasFeatures = false;

        const geoLayer = L.geoJSON(geojson, {
          style: (feature) => {
            const idx = feature?.properties?.streetIndex ?? 0;
            return {
              color: getStreetColor(idx),
              weight: 5,
              opacity: 0.8,
            };
          },
          pointToLayer: (feature, latlng) => {
            const idx = feature?.properties?.streetIndex ?? 0;
            return L.circleMarker(latlng, {
              radius: 8,
              fillColor: getStreetColor(idx),
              color: "#fff",
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8,
            });
          },
          onEachFeature: (feature, layer) => {
            if (feature.properties?.name) {
              layer.bindPopup(
                `<strong>${feature.properties.name}</strong>`
              );
            }
            hasFeatures = true;
            if ("getBounds" in layer) {
              bounds.extend((layer as L.Polyline).getBounds());
            } else if ("getLatLng" in layer) {
              bounds.extend((layer as L.CircleMarker).getLatLng());
            }
          },
        }).addTo(map);

        if (hasFeatures && bounds.isValid()) {
          map.fitBounds(bounds, { padding: [30, 30] });
        }
      } catch (err) {
        console.warn("Error loading GeoJSON:", err);
      }

      setMapReady(true);
    };

    loadMap();
  }, [routeId]);

  return (
    <div className="rounded-lg overflow-hidden border border-slate-200 shadow-sm">
      <div
        id="route-map"
        style={{ height: "350px", width: "100%" }}
        className="bg-slate-100"
      />
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
          <span className="text-slate-400">Indlæser kort...</span>
        </div>
      )}
    </div>
  );
}
