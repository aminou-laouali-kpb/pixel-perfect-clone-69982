import { describe, expect, it } from "vitest";
import { generateInviteReferralCode, generateReferralCode } from "@/lib/referral-code";
import { calculateTier, formatCurrency } from "@/lib/utils";
import { QUIZ_DATA, QUIZ_MIN_SCORE } from "@/lib/quiz-data";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants";

describe("generateReferralCode", () => {
  it("uses KPB-COUNTRY-SUFFIX format", () => {
    const code = generateReferralCode("Côte d'Ivoire");
    expect(code).toMatch(/^KPB-COT-[A-Z2-9]{6}$/);
  });

  it("pads short country names", () => {
    const code = generateReferralCode("Togo");
    expect(code).toMatch(/^KPB-TOG-[A-Z2-9]{6}$/);
  });

  it("falls back for invite without country", () => {
    const code = generateInviteReferralCode();
    expect(code).toMatch(/^KPB-XXX-[A-Z2-9]{6}$/);
  });
});

describe("calculateTier", () => {
  it("maps period placements to v3.1 tiers", () => {
    expect(calculateTier(0)).toBe("bronze");
    expect(calculateTier(5)).toBe("bronze");
    expect(calculateTier(6)).toBe("argent");
    expect(calculateTier(11)).toBe("elite");
  });
});

describe("formatCurrency", () => {
  it("formats XOF without decimals", () => {
    expect(formatCurrency(100000, "XOF")).toContain("100");
  });
});

describe("quiz public data", () => {
  it("does not expose correct answers", () => {
    for (const q of QUIZ_DATA) {
      expect(q).not.toHaveProperty("correct");
      expect(q).not.toHaveProperty("explanation");
      expect(q.options.length).toBeGreaterThanOrEqual(2);
    }
    expect(QUIZ_MIN_SCORE).toBe(4);
  });
});

describe("password policy", () => {
  it("requires at least 8 characters", () => {
    expect(PASSWORD_MIN_LENGTH).toBeGreaterThanOrEqual(8);
  });
});
