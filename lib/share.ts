import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import type { SupplyReport } from "./schema";

/** Encode a report into a URL-hash payload. No backend involved. */
export function encodeReport(report: SupplyReport): string {
  return compressToEncodedURIComponent(JSON.stringify(report));
}

/** Decode a URL-hash payload back into a report. Returns null on anything invalid. */
export function decodeReport(payload: string): SupplyReport | null {
  try {
    const json = decompressFromEncodedURIComponent(payload);
    if (!json) return null;
    const data = JSON.parse(json) as SupplyReport;
    if (
      data?.v !== 1 ||
      typeof data.one_liner !== "string" ||
      typeof data.resume_markdown !== "string" ||
      !Array.isArray(data.matches) ||
      !data.ikigai ||
      !data.intro
    ) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function shareUrl(report: SupplyReport, origin: string): string {
  return `${origin}/s#${encodeReport(report)}`;
}
