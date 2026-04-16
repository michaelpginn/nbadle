import { createHmac } from "crypto";

export function hashNbaId(nbaId: string): string {
  const key = process.env.HASH_KEY;
  if (!key) throw new Error("HASH_KEY env var not set");
  return createHmac("sha256", key).update(nbaId).digest("base64url").slice(0, 8);
}
