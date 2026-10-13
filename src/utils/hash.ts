import type { CertificateData } from "@/types";

// Fixed field order so the same certificate always produces the same hash.
const FIELD_ORDER: (keyof CertificateData)[] = [
  "certificateId",
  "studentName",
  "studentId",
  "degree",
  "branch",
  "institution",
  "graduationYear",
];

/** Builds a consistent string, e.g. "CERT-1|Asha Rao|S123|B.Tech|CSE|ABC College|2026" */
export function canonicalize(data: CertificateData): string {
  return FIELD_ORDER.map((k) => data[k].trim().replace(/\s+/g, " ")).join("|");
}

/** SHA-256 using the browser Web Crypto API. Returns a 0x-prefixed hex string (bytes32). */
export async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return "0x" + hex;
}

export function hashCertificate(data: CertificateData): Promise<string> {
  return sha256Hex(canonicalize(data));
}
