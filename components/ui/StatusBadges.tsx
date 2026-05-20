"use client";
import type { StatusEffect } from "@/lib/types";

interface Props {
  effects: StatusEffect[];
}

export function StatusBadges({ effects }: Props) {
  if (effects.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {effects.map(effect => (
        <span
          key={effect.id}
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs bg-slate-800 border border-slate-600 text-slate-300"
          title={`${effect.name}: ${effect.stacks} stacks, ${effect.turnsLeft} turns`}
        >
          {effect.icon} {effect.stacks > 1 && <span className="text-amber-400 font-bold">×{effect.stacks}</span>}
        </span>
      ))}
    </div>
  );
}
