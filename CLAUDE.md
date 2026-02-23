# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build (pre-renders all 15 route pages)
npm run lint         # ESLint

npx tsx scripts/fetch-geometries.ts    # Re-fetch street geometries from OSM
npx tsx scripts/generate-qr-codes.ts   # Regenerate QR codes for all routes
python scripts/convert-excel.py        # Convert Kirkeblad.xlsx → data/routes.json
```

## Architecture

Church newsletter ("kirkeblad") distribution route management app for Nørresundby Spejderne. Each omdeler (deliverer) scans a QR code on their box which links directly to their route page — so `app/rute/[id]/page.tsx` is the primary landing page.

### Data flow

1. **Excel → JSON**: `Kirkeblad.xlsx` → `convert-excel.py` → `data/routes.json` (15 routes with streets, notes, door codes)
2. **JSON → GeoJSON**: `routes.json` → `fetch-geometries.ts` → `public/geojson/route-{id}.geojson` (queries Overpass API for street geometry, falls back to Nominatim)
3. **JSON → Pages**: `routes.json` is imported directly by page components. All 15 routes are statically generated at build time via `generateStaticParams()`.

### Key components

- **`RoutePageContent.tsx`** — Client-side orchestrator for a route page. Composes: RouteMap, StreetList, door codes, FeedbackSection, InfoSection.
- **`RouteMap.tsx`** — Leaflet map, dynamically imported with `ssr: false`. Fetches per-route GeoJSON, colors streets by index. Features with `"poi": true` render as red star markers.
- **`FeedbackSection.tsx`** — Two Google Forms buttons ("Jeg er færdig" / "Meld et problem") that pre-fill the route ID.
- **`InfoSection.tsx`** — Collapsible practical delivery info shown on every route page.
- **`lib/colors.ts`** — 15-color palette for street polylines (cycles if route has more streets).

### Street name mapping

Many street names in the source Excel differ from OpenStreetMap names. `NAME_OVERRIDES` in `fetch-geometries.ts` maps display names → OSM names. The bounding box for all queries is `57.03,9.88,57.09,9.96` (Nørresundby area). Some locations (e.g. Kamiliegården) don't exist in OSM and fall back to Nominatim point lookups or manual GeoJSON entries.

### Path alias

`@/*` maps to `./src/*` (configured in tsconfig.json).

## Conventions

- All UI text is in Danish.
- Tailwind CSS 4 via PostCSS plugin (no tailwind.config — theme in globals.css).
- Leaflet CSS is dynamically imported inside RouteMap to avoid SSR issues.
- Door codes (`koder`) are behind a collapsible `<details>` element — treat as sensitive.
- POI markers in GeoJSON use `{ "poi": true }` in feature properties.
- Auto-deploys to Vercel on push to main.
