/**
 * Generate QR code PNG files for each route.
 *
 * Usage: npx tsx scripts/generate-qr-codes.ts [base-url]
 * Example: npx tsx scripts/generate-qr-codes.ts https://kirkeblad.vercel.app
 */

import * as fs from "fs";
import * as path from "path";
import QRCode from "qrcode";

interface Route {
  id: string;
  sortering: number;
  antalBlade: number;
}

async function main() {
  const baseUrl = process.argv[2] || "https://kirkeblad.vercel.app";
  const routesPath = path.join(__dirname, "..", "data", "routes.json");
  const outDir = path.join(__dirname, "..", "qr-codes");
  fs.mkdirSync(outDir, { recursive: true });

  const routes: Route[] = JSON.parse(fs.readFileSync(routesPath, "utf-8"));

  for (const route of routes) {
    const url = `${baseUrl}/rute/${route.id}`;
    const filename = `rute-${route.id}.png`;
    const outPath = path.join(outDir, filename);

    await QRCode.toFile(outPath, url, {
      width: 400,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });

    console.log(`${filename}: ${url}`);
  }

  console.log(`\nGenerated ${routes.length} QR codes in ${outDir}`);
}

main().catch(console.error);
