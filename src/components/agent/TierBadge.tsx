import React from "react";
import { AgentTier } from "@/types";
import { TIERS } from "@/lib/utils";

interface TierBadgeProps {
  tier: AgentTier;
}

export const TierBadge: React.FC<TierBadgeProps> = ({ tier }) => {
  const tierInfo = TIERS[tier] || TIERS.bronze;

  let badgeColor = "bg-amber-700/20 text-amber-300 border-amber-700/50"; // Bronze
  if (tier === "argent") {
    badgeColor = "bg-slate-300/10 text-slate-300 border-slate-300/30"; // Argent
  } else if (tier === "elite") {
    badgeColor = "bg-gold-500/10 text-gold-400 border-gold-500/30"; // Elite
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${badgeColor}`}
    >
      {tierInfo.label}
    </span>
  );
};

export default TierBadge;
