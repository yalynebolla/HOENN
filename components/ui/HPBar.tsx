"use client";
import type { Combatant } from "@/lib/types";

interface Props {
  combatant: Combatant;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
}

export function HPBar({ combatant, size = "md", showName = true }: Props) {
  const { stats, shield, name } = combatant;
  const hpPct = Math.max(0, (stats.hp / stats.maxHp) * 100);

  const hpColor = hpPct > 50 ? "bg-emerald-500" : hpPct > 25 ? "bg-amber-500" : "bg-red-500";
  const barH = size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className="w-full">
      {showName && (
        <div className="flex items-center justify-between mb-1">
          <span className={`${textSize} font-medium text-slate-200`}>{name}</span>
          <span className={`${textSize} text-slate-400`}>
            {stats.hp}/{stats.maxHp}
          </span>
        </div>
      )}
      <div className={`w-full ${barH} bg-slate-700 rounded-full overflow-hidden`}>
        <div
          className={`${barH} ${hpColor} rounded-full transition-all duration-300`}
          style={{ width: `${hpPct}%` }}
        />
      </div>
      {shield > 0 && (
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-sky-400">🛡️ {shield} shield</span>
        </div>
      )}
    </div>
  );
}
