/**
 * Fetch street geometries from Overpass API and Nominatim for all routes.
 * Outputs one GeoJSON file per route in public/geojson/route-{id}.geojson.
 *
 * Usage: npx tsx scripts/fetch-geometries.ts
 */

import * as fs from "fs";
import * as path from "path";

interface Street {
  type: "street";
  name: string;
  details: string | null;
}

interface Route {
  id: string;
  sortering: number;
  antalBlade: number;
  streets: Street[];
  notes: string[];
  koder: string | null;
  routeNote?: string;
}

// Bounding box for Nørresundby
const BBOX = "57.03,9.88,57.09,9.96";

// Map of Excel street names → OSM street names (where they differ)
const NAME_OVERRIDES: Record<string, string> = {
  "Niels Lykkesgade": "Niels Lykkes Gade",
  "Thovald Jensensvej": "Thorvald Jensens Vej",
  "Mølmdalsvej": "Mølndalsvej",
  "Jens Langes gade": "Jens Langes Gade",
  "Ane Dams gade": "Ane Dams Gade",
  "Gammel Østergade": "Gammel Østergade",
  "Kirke Allé": "Kirke Allé",
  "Torvet 6": "Torvet",
  "Kamiliegården": "Kamillegården",
  "A.C. Jacobsensvej": "A.C. Jacobsens Vej",
  "P.P. Hedegårdsvej": "Peder P. Hedegaards Vej",
  "Lars Dyrskjøts Vej": "Lars Dyrskøts Vej",
  "Sankt Pedersgade": "Sankt Peders Gade",
  "Holger Trydesvej": "Holger Trydes Vej",
  "Dronnings Tværgade": "Dronningens Tværgade",
  "Kronprinsens Allé": "Kronprinsens Allé",
  "Carl Klitgårdsvej": "Carl Klitgaards Vej",
  "Laurits Haugesvej": "Laurits Hauges Vej",
  "Præstevænget": "Præstevænge",
  "Digmansvej": "Digmannsvej",
  "Dronningsgade": "Dronningensgade",
  "Rømershave": "Rømers Have",
  "Søndre Kongegade": "Søndre Kongevej",
};

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function queryOverpassBatch(streetNames: string[]): Promise<any> {
  const nameFilters = streetNames
    .map((n) => `way["name"="${n}"](${BBOX});`)
    .join("\n");

  const query = `
[out:json][timeout:60];
(
${nameFilters}
);
out geom;
`;
  const url = "https://overpass-api.de/api/interpreter";
  const response = await fetch(url, {
    method: "POST",
    body: `data=${encodeURIComponent(query)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Overpass error ${response.status}: ${text.slice(0, 200)}`);
  }
  return response.json();
}

async function queryOverpassWithRetry(
  streetNames: string[],
  maxRetries = 3
): Promise<any> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await queryOverpassBatch(streetNames);
    } catch (err: any) {
      const isRateLimit =
        err.message?.includes("429") || err.message?.includes("rate_limited");
      const isTimeout =
        err.message?.includes("504") || err.message?.includes("timeout");
      if ((isRateLimit || isTimeout) && attempt < maxRetries - 1) {
        const wait = (attempt + 1) * 5000;
        console.log(`  [retry] Waiting ${wait / 1000}s before retry ${attempt + 2}...`);
        await sleep(wait);
        continue;
      }
      throw err;
    }
  }
}

async function queryNominatim(
  streetName: string
): Promise<[number, number] | null> {
  const query = `${streetName}, Nørresundby, Denmark`;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;

  const response = await fetch(url, {
    headers: { "User-Agent": "KirkebladApp/1.0" },
  });

  if (!response.ok) return null;
  const data = await response.json();
  if (data.length === 0) return null;

  return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
}

function groupFeaturesByName(
  data: any,
  streetNameMap: Map<string, { originalName: string; streetIndex: number }>
): Map<string, any[]> {
  const result = new Map<string, any[]>();

  if (!data.elements) return result;

  for (const element of data.elements) {
    if (element.type === "way" && element.geometry && element.tags?.name) {
      const osmName = element.tags.name;
      const info = streetNameMap.get(osmName);
      if (!info) continue;

      const key = info.originalName;
      if (!result.has(key)) result.set(key, []);

      const coords = element.geometry.map((p: any) => [p.lon, p.lat]);
      result.get(key)!.push({
        type: "Feature",
        properties: { name: info.originalName, streetIndex: info.streetIndex },
        geometry: { type: "LineString", coordinates: coords },
      });
    }
  }
  return result;
}

async function main() {
  const routesPath = path.join(__dirname, "..", "data", "routes.json");
  const outDir = path.join(__dirname, "..", "public", "geojson");
  fs.mkdirSync(outDir, { recursive: true });

  const routes: Route[] = JSON.parse(fs.readFileSync(routesPath, "utf-8"));

  for (const route of routes) {
    console.log(`\nRoute ${route.id} (${route.streets.length} streets):`);
    const allFeatures: any[] = [];

    // Build a map of OSM name → { original name, street index }
    const streetNameMap = new Map<
      string,
      { originalName: string; streetIndex: number }
    >();
    const uniqueOsmNames: string[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < route.streets.length; i++) {
      const street = route.streets[i];
      const osmName = NAME_OVERRIDES[street.name] || street.name;
      if (!seen.has(osmName)) {
        seen.add(osmName);
        uniqueOsmNames.push(osmName);
        streetNameMap.set(osmName, {
          originalName: street.name,
          streetIndex: i,
        });
      }
    }

    // Batch query Overpass for all streets in this route
    try {
      const data = await queryOverpassWithRetry(uniqueOsmNames);
      const grouped = groupFeaturesByName(data, streetNameMap);

      for (const [name, features] of grouped) {
        console.log(`  [Overpass] ${name}: ${features.length} way(s)`);
        allFeatures.push(...features);
      }

      // Find streets not found in Overpass, try Nominatim
      for (let i = 0; i < route.streets.length; i++) {
        const street = route.streets[i];
        const osmName = NAME_OVERRIDES[street.name] || street.name;
        if (grouped.has(street.name)) continue;
        // Skip duplicates
        if (
          route.streets.findIndex((s) => s.name === street.name) !== i
        )
          continue;

        console.log(`  [Nominatim] Trying ${street.name} (${osmName})...`);
        await sleep(1100);
        // Try with OSM name
        let point = await queryNominatim(osmName);
        // If not found, try with original name
        if (!point && osmName !== street.name) {
          await sleep(1100);
          point = await queryNominatim(street.name);
        }
        if (point) {
          console.log(`  [Nominatim] ${street.name}: found point`);
          allFeatures.push({
            type: "Feature",
            properties: { name: street.name, streetIndex: i },
            geometry: { type: "Point", coordinates: point },
          });
        } else {
          console.warn(`  [MISS] ${street.name}`);
        }
      }
    } catch (err) {
      console.error(`  [ERROR] Batch query failed for route ${route.id}:`, err);
      // Fall back to individual Nominatim queries
      for (let i = 0; i < route.streets.length; i++) {
        const street = route.streets[i];
        const osmName = NAME_OVERRIDES[street.name] || street.name;
        await sleep(1100);
        const point = await queryNominatim(osmName);
        if (point) {
          allFeatures.push({
            type: "Feature",
            properties: { name: street.name, streetIndex: i },
            geometry: { type: "Point", coordinates: point },
          });
        }
      }
    }

    const geojson = {
      type: "FeatureCollection",
      features: allFeatures,
    };

    const outPath = path.join(outDir, `route-${route.id}.geojson`);
    fs.writeFileSync(outPath, JSON.stringify(geojson, null, 2), "utf-8");
    console.log(
      `  => Wrote ${allFeatures.length} features to route-${route.id}.geojson`
    );

    // Pause between routes to avoid rate limits
    await sleep(2000);
  }

  console.log("\nDone!");
}

main().catch(console.error);
