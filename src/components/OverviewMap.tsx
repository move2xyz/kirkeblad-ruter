"use client";

import { useEffect, useState, useRef } from "react";
import { getRouteColor } from "@/lib/route-colors";
import type { Route } from "@/types";

interface OverviewMapProps {
  routes: Route[];
}

export default function OverviewMap({ routes }: OverviewMapProps) {
  const [loading, setLoading] = useState(true);
  const [activeRoute, setActiveRoute] = useState<string | null>(null);
  const layersRef = useRef<Record<string, any>>({});
  const mapRef = useRef<any>(null);

  useEffect(() => {
    const loadMap = async () => {
      const L = (await import("leaflet")).default;
      // @ts-expect-error CSS import for leaflet styles
      await import("leaflet/dist/leaflet.css");

      const container = document.getElementById("overview-map");
      if (!container || (container as any)._leaflet_id) return;

      const map = L.map("overview-map").setView([57.06, 9.92], 13);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      const allBounds = L.latLngBounds([]);

      // Load all route GeoJSONs in parallel
      const sorted = [...routes].sort((a, b) => a.sortering - b.sortering);

      await Promise.all(
        sorted.map(async (route) => {
          try {
            const res = await fetch(`/geojson/route-${route.id}.geojson`);
            if (!res.ok) return;
            const geojson = await res.json();
            const color = getRouteColor(route.id);

            const layer = L.geoJSON(geojson, {
              style: () => ({
                color,
                weight: 4,
                opacity: 0.8,
              }),
              pointToLayer: (feature: any, latlng: any) => {
                if (feature?.properties?.poi) {
                  return L.marker(latlng, {
                    icon: L.divIcon({
                      className: "",
                      html: `<div style="background:#dc2626;color:#fff;border:2px solid #fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 4px rgba(0,0,0,0.3);">&#9733;</div>`,
                      iconSize: [24, 24],
                      iconAnchor: [12, 12],
                    }),
                  });
                }
                return L.circleMarker(latlng, {
                  radius: 6,
                  fillColor: color,
                  color: "#fff",
                  weight: 2,
                  opacity: 1,
                  fillOpacity: 0.8,
                });
              },
              onEachFeature: (feature: any, layer: any) => {
                if (feature.properties?.name) {
                  layer.bindPopup(
                    `<strong>Rute ${route.id}</strong><br/>${feature.properties.name}`
                  );
                }
                if ("getBounds" in layer) {
                  allBounds.extend((layer as any).getBounds());
                } else if ("getLatLng" in layer) {
                  allBounds.extend((layer as any).getLatLng());
                }
              },
            }).addTo(map);

            layersRef.current[route.id] = layer;
          } catch (err) {
            console.warn(`Error loading GeoJSON for route ${route.id}:`, err);
          }
        })
      );

      if (allBounds.isValid()) {
        map.fitBounds(allBounds, { padding: [20, 20] });
      }

      setLoading(false);
    };

    loadMap();
  }, [routes]);

  // Handle highlighting when activeRoute changes
  useEffect(() => {
    const layers = layersRef.current;
    Object.entries(layers).forEach(([id, layer]) => {
      if (!activeRoute) {
        // Reset all to normal
        layer.setStyle({ opacity: 0.8, weight: 4 });
      } else if (id === activeRoute) {
        layer.setStyle({ opacity: 1, weight: 6 });
        layer.bringToFront();
      } else {
        layer.setStyle({ opacity: 0.2, weight: 3 });
      }
    });
  }, [activeRoute]);

  const sorted = [...routes].sort((a, b) => a.sortering - b.sortering);

  const handleLegendClick = (routeId: string) => {
    setActiveRoute((prev) => (prev === routeId ? null : routeId));
  };

  const handleZoomToRoute = (routeId: string) => {
    const layer = layersRef.current[routeId];
    const map = mapRef.current;
    if (layer && map) {
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-3 h-full">
      <div className="flex-1 min-h-0 rounded-lg overflow-hidden border border-slate-200 shadow-sm relative">
        <div
          id="overview-map"
          style={{ height: "100%", minHeight: "500px", width: "100%" }}
          className="bg-slate-100"
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <span className="text-slate-400">Indlæser kort...</span>
          </div>
        )}
      </div>

      <div className="lg:w-56 shrink-0">
        <div className="rounded-lg border border-slate-200 shadow-sm bg-white p-3">
          <h2 className="text-sm font-semibold text-slate-700 mb-2">Ruter</h2>
          <div className="space-y-1">
            {sorted.map((route) => (
              <button
                key={route.id}
                onClick={() => handleLegendClick(route.id)}
                onDoubleClick={() => handleZoomToRoute(route.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-sm transition-colors ${
                  activeRoute === route.id
                    ? "bg-slate-100 font-medium"
                    : activeRoute
                      ? "opacity-40"
                      : "hover:bg-slate-50"
                }`}
                title={`Klik for at fremhæve · Dobbeltklik for at zoome`}
              >
                <span
                  className="inline-block w-4 h-4 rounded-sm shrink-0"
                  style={{ backgroundColor: getRouteColor(route.id) }}
                />
                <span className="text-slate-700">Rute {route.id}</span>
                <span className="text-slate-400 text-xs ml-auto">
                  {route.antalBlade}
                </span>
              </button>
            ))}
          </div>
          {activeRoute && (
            <button
              onClick={() => setActiveRoute(null)}
              className="mt-2 w-full text-xs text-slate-500 hover:text-slate-700 py-1"
            >
              Vis alle ruter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
