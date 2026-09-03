// ─── Location intelligence service ───
// Single front door for the location screen. Combines:
//   • the All India Pincode Directory (real records, indexed in-browser)
//   • the calibrated curated towns that power the detailed demo analysis
// Returns ready-to-select hits; selecting one registers the Location so the
// feasibility engine and the rest of the app resolve it by id.

import { loadPincodeData, PINCODE_DATA_URL, type GeoPlace } from "./pincodeData";
import { loadPinIndex, PIN_INDEX_URL } from "./pinIndex";
import { locations, upsertLocation, type Location } from "@/data/locations";
import { searchPlaces, popularSuggestions, findNearestPlaces } from "./placeSearch";
import { estimateDemographics } from "./demographics";
import { normName } from "./geoUtils";

export interface LocationHit {
  key: string;
  title: string;
  subtitle: string;
  district: string;
  state: string;
  pincode: string;
  typeLabel: string;
  isCurated: boolean;
  lat: number;
  lng: number;
  /** Location record to register + select. */
  location: Location;
}

export type GeoLoadState =
  | { status: "idle" }
  | { status: "loading"; progress?: number }
  | { status: "ready"; total: number }
  | { status: "error"; message: string };

let placesCache: GeoPlace[] | null = null; // tier 3: full directory (background)
let pinCache: GeoPlace[] | null = null; // tier 2: compact pin-heads index (fast)
let curatedGeo: GeoPlace[] | null = null; // tier 1: curated demo towns (sync)
let loadState: GeoLoadState = { status: "idle" };

export interface DetailLoadState {
  status: "idle" | "loading" | "ready" | "error";
  progress?: number;
}

let detailState: DetailLoadState = { status: "idle" };

export function getLoadState(): GeoLoadState {
  return loadState;
}

/** State of the optional full-directory background enrichment. */
export function getDetailState(): DetailLoadState {
  return detailState;
}

/** The most complete directory layer currently available (never blocks). */
function activeDirectory(): GeoPlace[] {
  return placesCache ?? pinCache ?? [];
}

/** GeoPlace adapter for calibrated curated towns. */
function curatedToGeoPlace(loc: Location): GeoPlace {
  return {
    pincode: loc.pincode,
    name: loc.name,
    rawName: loc.name,
    officeType: "CUR",
    delivery: true,
    district: loc.district,
    state: loc.state,
    region: null,
    division: null,
    lat: loc.lat,
    lng: loc.lng,
    hasCoords: Number.isFinite(loc.lat) && Number.isFinite(loc.lng) && loc.lat !== 0,
  };
}

function ensureCurated(): GeoPlace[] {
  if (!curatedGeo) curatedGeo = locations.map(curatedToGeoPlace);
  return curatedGeo;
}

/** Look up the calibrated Location behind a curated GeoPlace. */
function curatedLocationFor(p: GeoPlace): Location | null {
  if (p.officeType !== "CUR") return null;
  return (
    locations.find((l) => l.name === p.name && l.district === p.district) ??
    locations.find((l) => l.name === p.name) ??
    null
  );
}

const slug = (s: string) =>
  normName(s).replace(/ /g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 40) || "place";

const KEEP_UPPER = new Set(["SO", "HO", "BO", "GPO", "NCT", "S.O", "B.O", "H.O", "G.P.O"]);

/** Display title-case for directory names/districts ("SHAHJAHANPUR" → "Shahjahanpur"). */
function titleCase(s: string): string {
  return s
    .split(/\s+/)
    .map((w) => {
      if (!w) return w;
      if (w.includes(".")) return w; // keep "S.O", "P.W.D." style intact
      if (KEEP_UPPER.has(w)) return w;
      if (/^[A-Z]+$/.test(w)) {
        // all-caps word: title-case unless short acronym ("SO" handled above)
        return w[0] + w.slice(1).toLowerCase();
      }
      return w;
    })
    .join(" ");
}

function officeTypeLabel(o: string | undefined): string {
  const t = (o || "").toUpperCase();
  if (t === "GPO" || t === "HO") return "City";
  if (t === "SO") return "Town";
  if (t === "BO" || t === "PO") return "Village";
  if (t === "CUR") return "Town";
  return "Post office";
}

/** Build a Location (analysis-ready) from a directory record. */
export function placeToLocation(p: GeoPlace): Location {
  const est = estimateDemographics(p);
  const t = (p.officeType || "").toUpperCase();
  const type: Location["type"] = t === "BO" || t === "PO" ? "village" : t === "SO" ? "town" : "city";
  return {
    id: `pin-${p.pincode}-${slug(p.name)}`,
    name: titleCase(p.name),
    district: titleCase(p.district),
    state: titleCase(p.state),
    pincode: p.pincode,
    lat: p.lat,
    lng: p.lng,
    type,
    placeLabel: officeTypeLabel(p.officeType),
    officeType: p.officeType,
    region: p.region ?? undefined,
    division: p.division ?? undefined,
    population: est.population,
    households: est.households,
    source: "india-post-directory",
  };
}

function hitFromLocation(loc: Location): LocationHit {
  const curated = loc.source === "curated" || loc.id.startsWith("loc-");
  return {
    key: loc.id,
    title: loc.name,
    subtitle: `${loc.district}, ${loc.state}`,
    district: loc.district,
    state: loc.state,
    pincode: loc.pincode,
    typeLabel: curated
      ? loc.type === "village" ? "Village" : "Town"
      : (loc.placeLabel ?? "Post office"),
    isCurated: curated,
    lat: loc.lat,
    lng: loc.lng,
    location: loc,
  };
}

function hitFromPlace(p: GeoPlace): LocationHit {
  const location = placeToLocation(p);
  const t = (p.officeType || "").toUpperCase();
  const officeChip = t && t !== "CUR" ? t.replace(/[().]/g, "") : "";
  const district = titleCase(p.district);
  const state = titleCase(p.state);
  return {
    key: location.id,
    title: location.name,
    subtitle: officeChip ? `${officeChip} · ${district}, ${state}` : `${district}, ${state}`,
    district,
    state,
    pincode: p.pincode,
    typeLabel: officeTypeLabel(p.officeType),
    isCurated: false,
    lat: p.lat,
    lng: p.lng,
    location,
  };
}

function combine(): GeoPlace[] {
  return [...ensureCurated(), ...activeDirectory()];
}

/**
 * Bootstraps the search dataset in tiers so nothing ever blocks:
 *
 *   Tier 1 (sync)      curated demo towns — instantly searchable
 *   Tier 2 (fast)      pin-heads index (~380 KB gz, ~19.5k pincodes) — awaited;
 *                      once loaded the whole country is searchable
 *   Tier 3 (background) full office directory (~3.3 MB gz) — kicked off but
 *                      never awaited; aborts after 30s and simply leaves the
 *                      pin-heads layer active.
 */
export async function initLocationService(
  onProgress?: (pct: number) => void,
  pinIndexUrl?: string,
  onDetail?: (d: DetailLoadState) => void,
): Promise<void> {
  if (loadState.status === "ready") {
    // Re-attach the enrichment subscriber (remounts); no-op if already running.
    void enrichWithFullDirectory(onDetail);
    return;
  }
  if (loadState.status === "loading") return;
  loadState = { status: "loading", progress: 0 };
  ensureCurated();
  try {
    pinCache = await loadPinIndex(pinIndexUrl ?? PIN_INDEX_URL, onProgress);
    loadState = { status: "ready", total: pinCache.length };
    onProgress?.(100);
    void enrichWithFullDirectory(onDetail);
  } catch (err) {
    loadState = {
      status: "error",
      message: err instanceof Error ? err.message : "Location data could not be loaded.",
    };
    throw err;
  }
}

/** Background tier 3 — never awaited by search/UI. */
async function enrichWithFullDirectory(onDetail?: (d: DetailLoadState) => void): Promise<void> {
  if (detailState.status === "loading") return;
  if (detailState.status === "ready" || detailState.status === "error") {
    // Already finished — sync late subscribers with the final state.
    onDetail?.({ ...detailState });
    return;
  }
  detailState = { status: "loading", progress: 0 };
  onDetail?.({ ...detailState });
  try {
    const { FULL_LOAD_TIMEOUT_MS } = await import("./gzLoader");
    const places = await loadPincodeData(
      PINCODE_DATA_URL,
      (pct) => {
        detailState = { status: "loading", progress: pct };
        onDetail?.({ status: "loading", progress: pct });
      },
      AbortSignal.timeout(FULL_LOAD_TIMEOUT_MS),
    );
    placesCache = places;
    detailState = { status: "ready" };
    onDetail?.({ status: "ready" });
  } catch {
    // Full detail is best-effort; the pin-heads layer keeps search working.
    detailState = { status: "error" };
    onDetail?.({ status: "error" });
  }
}

/** Ranked search across all of India (directory + curated). Coordinate-less offices excluded. */
export function searchLocations(query: string, limit = 18): LocationHit[] {
  const all = combine();
  const results = searchPlaces(all, query, limit * 2);
  const hits: LocationHit[] = [];
  const seen = new Set<string>();
  // Curated towns already represent their directory district-headquarter rows;
  // skip identical directory twins (same place name + district).
  const curatedCovered = new Set(
    locations.map((l) => `${normName(l.name)}|${normName(l.district)}`),
  );
  for (const p of results) {
    if (!p.hasCoords) continue;
    const curated = curatedLocationFor(p);
    if (!curated && p.officeType !== "CUR") {
      const key = `${normName(p.name)}|${normName(p.district)}`;
      if (curatedCovered.has(key)) continue;
    }
    const hit = curated ? hitFromLocation(curated) : hitFromPlace(p);
    if (seen.has(hit.key)) continue;
    seen.add(hit.key);
    hits.push(hit);
    if (hits.length >= limit) break;
  }
  return hits;
}

/** Curated demo towns only — available even before the directory downloads. */
export function curatedSuggestions(limit = 6): LocationHit[] {
  return locations.slice(0, limit).map((l) => hitFromLocation(l));
}

/** Default suggestions (before the user types): demo towns + big cities. */
export function suggestLocations(limit = 9): LocationHit[] {
  const curatedHits = curatedSuggestions(5);
  const all = combine();
  const popular = popularSuggestions(all, limit);
  const hits: LocationHit[] = [...curatedHits];
  const seen = new Set(hits.map((h) => h.key));
  for (const p of popular) {
    if (!p.hasCoords || p.officeType === "CUR") continue;
    const hit = hitFromPlace(p);
    if (seen.has(hit.key)) continue;
    seen.add(hit.key);
    hits.push(hit);
    if (hits.length >= limit) break;
  }
  return hits.slice(0, limit);
}

/** Nearest directory places to a clicked map coordinate. */
export function nearestLocations(lat: number, lng: number, radiusKm = 30): LocationHit[] {
  const dir = activeDirectory();
  const results = findNearestPlaces(dir, lat, lng, radiusKm, 4);
  const hits: LocationHit[] = [];
  const seen = new Set<string>();
  for (const p of results) {
    const hit = hitFromPlace(p);
    if (seen.has(hit.key)) continue;
    seen.add(hit.key);
    hits.push(hit);
  }
  return hits;
}

/** Register a hit's location so the analysis engine can resolve it by id. */
export function registerHit(hit: LocationHit): Location {
  upsertLocation(hit.location);
  return hit.location;
}
