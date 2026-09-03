// ─── All-India pincode directory loader ───
// Source: All India Pincode Directory (India Post), distributed with the
// `india-pincode` npm package (MIT). The compressed JSON lives in `public/`
// (copied from the package's data folder) and is fetched + gunzipped lazily in
// the browser, then normalized into a compact, deduplicated record set.
//
// Field map of the raw records (short keys to keep the file small):
//   c circle | r region | v division | o office name | p pincode | t office type
//   d delivery(0/1) | i district | s state | a lat | n lng

/** Served from /public so the package's `exports` map cannot block it. */
export const PINCODE_DATA_URL = "/pincodes.json.gz";

export type OfficeType = "GPO" | "HO" | "SO" | "BO" | "PO" | string;

/** Canonicalize the directory's office-type label (handles "S.O", "S O", …). */
export function officeKind(raw: string | undefined): OfficeType {
  const t = (raw ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (t === "GPO" || t === "HO" || t === "SO" || t === "BO" || t === "PO") return t;
  return (raw ?? "").trim() || "BO";
}

export interface GeoPlace {
  /** 6-digit pincode. */
  pincode: string;
  /** Clean display name (office suffix stripped). */
  name: string;
  /** Original India Post office name. */
  rawName: string;
  officeType: OfficeType;
  delivery: boolean;
  district: string;
  state: string;
  /** Postal region (useful context). Null when not reported. */
  region: string | null;
  /** Postal division (loose proxy for sub-district context). */
  division: string | null;
  lat: number;
  lng: number;
  /** true when lat/lng came from the directory; false when unavailable. */
  hasCoords: boolean;
}

/** Strips the India Post suffix (".B.O", " S.O", " (S.O)") etc. from a name. */
export function cleanOfficeName(raw: string): string {
  return raw
    .replace(/\s*\(?\s*\b(B\.O|S\.O|H\.O|G\.P\.O|GPO|SO|BO|HO)\b\s*\)?$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Normalize a raw directory record into our compact GeoPlace. */
export function normalizeRecord(r: Record<string, unknown>): GeoPlace | null {
  const pincode = String(r.p ?? "").trim();
  const rawName = String(r.o ?? "").trim();
  const district = String(r.i ?? "").trim();
  const state = String(r.s ?? "").trim();
  if (!/^[1-9]\d{5}$/.test(pincode) || !rawName || !district || !state) return null;
  // Records with unknown state ("NA") or non-geographic entries are skipped.
  if (state === "NA") return null;

  const lat = Number(r.a);
  const lng = Number(r.n);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng) && (Math.abs(lat) + Math.abs(lng)) > 0.05;

  return {
    pincode,
    name: cleanOfficeName(rawName),
    rawName,
    officeType: officeKind(String(r.t ?? "BO")),
    delivery: Number(r.d) === 1,
    district,
    state,
    region: r.r ? String(r.r) : null,
    division: r.v ? String(r.v) : null,
    lat: hasCoords ? lat : 0,
    lng: hasCoords ? lng : 0,
    hasCoords,
  };
}

let cachePromise: Promise<GeoPlace[]> | null = null;
let cacheError: Error | null = null;

/** Browser-side gzip decompression of the fetched asset. */
async function gunzipResponse(
  url: string,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) throw new Error(`Location data download failed (HTTP ${res.status})`);
  if (typeof DecompressionStream === "undefined") {
    throw new Error("This browser cannot decompress the location dataset.");
  }
  if (!res.body) {
    const buf = await res.arrayBuffer();
    const blob = new Blob([buf]);
    return new Response(blob.stream().pipeThrough(new DecompressionStream("gzip"))).text();
  }

  // Stream the compressed bytes so the UI can show real progress,
  // then gunzip the fully-received blob.
  const total = Number(res.headers.get("content-length") ?? 0);
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      received += value.length;
      if (total > 0) onProgress?.(Math.round((received / total) * 100));
    }
  }
  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  const text = await new Response(stream).text();
  onProgress?.(100);
  return text;
}

/**
 * Loads and normalizes the full India pincode directory once.
 * Result is cached for the session. Pure module — call sites can rely on a
 * single fetch of the ~3.3 MB compressed asset.
 */
export function loadPincodeData(
  sourceUrl: string = PINCODE_DATA_URL,
  onProgress?: (pct: number) => void,
): Promise<GeoPlace[]> {
  if (cachePromise) return cachePromise;
  if (cacheError) throw cacheError;

  cachePromise = (async () => {
    const text = await gunzipResponse(sourceUrl, onProgress);
    const raw = JSON.parse(text) as Record<string, unknown>[];
    const seen = new Set<string>();
    const out: GeoPlace[] = [];
    for (const rec of raw) {
      const place = normalizeRecord(rec);
      if (!place) continue;
      const key = `${place.pincode}|${place.rawName.toUpperCase()}|${place.officeType}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(place);
    }
    return out;
  })().catch((err: unknown) => {
    cacheError = err instanceof Error ? err : new Error(String(err));
    cachePromise = null;
    throw cacheError;
  });

  return cachePromise;
}

/** Reset cached dataset (dev / test helper). */
export function resetPincodeCache(): void {
  cachePromise = null;
  cacheError = null;
}
