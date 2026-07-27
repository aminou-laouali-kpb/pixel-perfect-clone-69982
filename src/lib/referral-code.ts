/**
 * Generates a referral code: KPB-{COUNTRY}-{6 chars}.
 * Uses crypto.getRandomValues when available (browser + Node 19+).
 */
export function generateReferralCode(pays: string): string {
  const cleanCountry = pays
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase();
  const prefix = cleanCountry.substring(0, 3).padEnd(3, "X");
  return `KPB-${prefix}-${randomAlnum(6)}`;
}

/** Short invite-friendly code when country is unknown at invite time. */
export function generateInviteReferralCode(pays?: string): string {
  if (pays && pays.trim().length >= 2) {
    return generateReferralCode(pays);
  }
  return `KPB-XXX-${randomAlnum(6)}`;
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomAlnum(length: number): string {
  const bytes = new Uint8Array(length);
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return out;
}
