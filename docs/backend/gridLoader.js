// backend/gridLoader.js

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix for ES module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Go up one folder (from backend → docs)
const filePath = path.join(__dirname, "..", "kamareddy_grids.geojson");

let grids = [];

try {
  const rawData = fs.readFileSync(filePath, "utf-8");
  const geoData = JSON.parse(rawData);

  grids = geoData.features;

  console.log("✅ kamareddy_grids.geojson loaded");
  console.log("📊 Total grids:", grids.length);

} catch (error) {
  console.error("❌ Failed to load kamareddy_grids.geojson");
  console.error("Tried path:", filePath);
  console.error(error.message);
  process.exit(1);
}
export default grids;
