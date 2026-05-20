"use client";
import type { Enemy } from "@/lib/types";
import { HPBar } from "@/components/ui/HPBar";
import { StatusBadges } from "@/components/ui/StatusBadges";

const INTENT_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  attack: { label: "Attacking", icon: "⚔️", color: "text-red-400" },
  defend: { label: "Defending", icon: "🛡️", color: "text-sky-400" },
  buff:   { label: "Buffing",   icon: "⬆️", color: "text-amber-400" },
  debuff: { label: "Debuffing", icon: "💀", color: "text-fuchsia-400" },
  special:{ label: "???",       icon: "✨", color: "text-purple-400" },
};

interface Props {
  enemy: Enemy;
  selected?: boolean;
  onClick?: () => void;
  canTarget?: boolean;
}

export function EnemyCard({ enemy, selected, onClick, canTarget }: Props) {
  const isDead = enemy.stats.hp <= 0;
  const intent = INTENT_LABELS[enemy.nextAction.intent];

  return (
    <div
      onClick={isDead ? undefined : onClick}
      className={`
        relative flex flex-col items-center p-4 rounded-xl border transition-all duration-200
        ${isDead ? "opacity-30 grayscale" : ""}
        ${selected ? "border-amber-400 bg-slate-800/80 scale-105 ring-2 ring-amber-400/50" : "border-slate-700 bg-slate-800/50"}
        ${canTarget && !isDead ? "cursor-pointer hover:border-amber-500 hover:bg-slate-800/70" : ""}
      `}
    >
      {/* Enemy sprite */}
      <div className="relative w-24 h-24 mb-2">
        <img
          src={enemy.spriteUrl}
          alt={enemy.name}
          className="w-full h-full object-contain drop-shadow-lg"
        />
        {isDead && (
          <div className="absolute inset-0 flex items-center justify-center text-3xl">💨</div>
        )}
      </div>

      {/* Name + Level */}
      <div className="text-center mb-2">
        <p className="font-bold text-slate-100 text-sm">{enemy.name}</p>
        <p className="text-xs text-slate-500">Lv. {enemy.level}</p>
      </div>

      {/* HP Bar */}
      {!isDead && (
        <div className="w-full mb-2">
          <HPBar combatant={enemy} size="sm" showName={false} />
          <p className="text-xs text-slate-400 text-right mt-0.5">{enemy.stats.hp}/{enemy.stats.maxHp}</p>
        </div>
      )}

      {/* Status effects */}
      {!isDead && <StatusBadges effects={enemy.statusEffects} />}

      {/* AI Intent */}
      {!isDead && (
        <div className={`mt-2 flex items-center gap-1 text-xs ${intent.color}`}>
          <span>{intent.icon}</span>
          <span>{intent.label}</span>
          {enemy.nextAction.displayValue && (
            <span className="font-bold">{enemy.nextAction.displayValue}</span>
          )}
        </div>
      )}

      {/* Shield indicator */}
      {!isDead && enemy.shield > 0 && (
        <div className="mt-1 text-xs text-sky-400">🛡️ {enemy.shield}</div>
      )}

      {/* Target indicator */}
      {selected && !isDead && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
          TARGET
        </div>
      )}
    </div>
  );
}
