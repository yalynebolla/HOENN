"use client";
import type { Skill } from "@/lib/types";

const TYPE_COLORS: Record<string, string> = {
  fire: "border-orange-500 bg-orange-950/60",
  water: "border-sky-500 bg-sky-950/60",
  grass: "border-emerald-500 bg-emerald-950/60",
  electric: "border-yellow-400 bg-yellow-950/60",
  psychic: "border-pink-500 bg-pink-950/60",
  dark: "border-slate-500 bg-slate-900/60",
  rock: "border-stone-400 bg-stone-950/60",
  ground: "border-amber-600 bg-amber-950/60",
  dragon: "border-violet-500 bg-violet-950/60",
  ghost: "border-purple-600 bg-purple-950/60",
  fighting: "border-red-600 bg-red-950/60",
  poison: "border-fuchsia-500 bg-fuchsia-950/60",
  normal: "border-slate-400 bg-slate-800/60",
  steel: "border-cyan-400 bg-cyan-950/60",
  ice: "border-cyan-300 bg-cyan-950/60",
  bug: "border-lime-500 bg-lime-950/60",
  flying: "border-sky-300 bg-sky-950/40",
  fairy: "border-pink-300 bg-pink-950/60",
};

const CATEGORY_ICONS: Record<string, string> = {
  attack: "⚔️",
  defense: "🛡️",
  status: "✨",
  heal: "💚",
};

interface Props {
  skill: Skill;
  selected?: boolean;
  disabled?: boolean;
  playerEnergy: number;
  onClick?: () => void;
}

export function SkillCard({ skill, selected, disabled, playerEnergy, onClick }: Props) {
  const notEnoughEnergy = playerEnergy < skill.energyCost;
  const onCooldown = skill.currentCooldown > 0;
  const isDisabled = disabled || notEnoughEnergy || onCooldown;

  const typeStyle = TYPE_COLORS[skill.pokemonType] ?? TYPE_COLORS.normal;

  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      className={`
        relative w-full text-left rounded-lg border p-3 transition-all duration-150
        ${typeStyle}
        ${selected ? "ring-2 ring-white scale-[1.02]" : ""}
        ${isDisabled ? "opacity-40 cursor-not-allowed" : "hover:scale-[1.02] hover:brightness-110 cursor-pointer"}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{CATEGORY_ICONS[skill.category]}</span>
            <span className="font-semibold text-white text-sm truncate">{skill.name}</span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5 leading-tight">{skill.description}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${notEnoughEnergy ? "bg-red-900 text-red-300" : "bg-slate-700 text-amber-300"}`}>
            ⚡{skill.energyCost}
          </span>
          {onCooldown && (
            <span className="text-xs bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
              CD {skill.currentCooldown}
            </span>
          )}
        </div>
      </div>
      {skill.baseDamage && (
        <div className="mt-1.5 flex gap-2 text-xs text-slate-300">
          <span>💥 {skill.baseDamage} base</span>
          {skill.baseHeal && <span>💚 +{skill.baseHeal}</span>}
          {skill.shieldAmount && <span>🛡️ +{skill.shieldAmount}</span>}
        </div>
      )}
    </button>
  );
}
