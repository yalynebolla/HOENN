"use client";
import { useGameStore } from "@/store/gameStore";
import type { Skill, Relic } from "@/lib/types";

const RARITY_COLORS: Record<string, string> = {
  common: "border-slate-500 text-slate-300",
  uncommon: "border-sky-500 text-sky-300",
  rare: "border-violet-500 text-violet-300",
  legendary: "border-amber-400 text-amber-300",
};

export function RewardScreen() {
  const { run, acceptGold, pickSkill, skipSkill, pickRelic, skipReward } = useGameStore();
  const rewards = run.pendingRewards;

  if (!rewards) return null;

  const goldAccepted = rewards.gold === 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8 gap-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-black text-amber-300">
          {rewards.type === "boss" ? "🏆 Boss Defeated!" : rewards.type === "elite" ? "💀 Elite Defeated!" : "⚔️ Victory!"}
        </h1>
        <p className="text-slate-400 mt-1">Choose your rewards</p>
      </div>

      {/* Gold */}
      <div
        onClick={goldAccepted ? undefined : acceptGold}
        className={`
          flex items-center gap-4 px-8 py-4 rounded-xl border transition-all
          ${goldAccepted
            ? "border-slate-700 bg-slate-800/30 opacity-50 cursor-default"
            : "border-amber-600 bg-amber-950/40 hover:bg-amber-950/60 cursor-pointer hover:scale-[1.02]"}
        `}
      >
        <span className="text-4xl">💰</span>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">Gold</p>
          <p className="text-2xl font-bold text-amber-300">{goldAccepted ? "Collected!" : `+${rewards.gold}g`}</p>
        </div>
      </div>

      {/* Relics */}
      {rewards.relicChoices.length > 0 && (
        <div className="w-full max-w-2xl">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 text-center">Relic Found</p>
          <div className="flex gap-4 justify-center flex-wrap">
            {rewards.relicChoices.map(relic => (
              <RelicChoice key={relic.id} relic={relic} onPick={pickRelic} />
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      <div className="w-full max-w-2xl">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 text-center">Choose a Skill</p>
        <div className="grid grid-cols-3 gap-3">
          {rewards.skillChoices.map(skill => (
            <SkillChoice key={skill.id} skill={skill} onPick={pickSkill} />
          ))}
        </div>
      </div>

      {/* Skip */}
      <button
        onClick={skipReward}
        className="text-slate-500 hover:text-slate-300 text-sm transition-colors border border-slate-800 hover:border-slate-600 px-4 py-2 rounded-lg"
      >
        Skip — Continue to Map
      </button>
    </div>
  );
}

function RelicChoice({ relic, onPick }: { relic: Relic; onPick: (r: Relic) => void }) {
  const colors = RARITY_COLORS[relic.rarity] ?? RARITY_COLORS.common;
  return (
    <button
      onClick={() => onPick(relic)}
      className={`
        flex flex-col items-center gap-2 p-4 rounded-xl border-2 bg-slate-900/60
        hover:bg-slate-800 hover:scale-105 transition-all cursor-pointer
        ${colors}
      `}
    >
      <span className="text-4xl">{relic.icon}</span>
      <div className="text-center">
        <p className="font-bold text-white text-sm">{relic.name}</p>
        <p className="text-xs capitalize opacity-70 mb-1">{relic.rarity}</p>
        <p className="text-xs text-slate-300 leading-relaxed max-w-32">{relic.description}</p>
      </div>
    </button>
  );
}

function SkillChoice({ skill, onPick }: { skill: Skill; onPick: (s: Skill) => void }) {
  const CATEGORY_ICONS: Record<string, string> = {
    attack: "⚔️", defense: "🛡️", status: "✨", heal: "💚",
  };

  return (
    <button
      onClick={() => onPick(skill)}
      className="flex flex-col gap-2 p-4 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-500 hover:scale-[1.02] transition-all cursor-pointer text-left"
    >
      <div className="flex items-center justify-between">
        <span className="font-bold text-white text-sm">{skill.name}</span>
        <span className="text-xs bg-slate-700 text-amber-300 px-1.5 py-0.5 rounded">⚡{skill.energyCost}</span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed">{skill.description}</p>
      <div className="flex gap-2 text-xs text-slate-400">
        <span>{CATEGORY_ICONS[skill.category]} {skill.category}</span>
        <span className="capitalize">• {skill.pokemonType}</span>
      </div>
      {skill.baseDamage && <span className="text-xs text-red-300">💥 {skill.baseDamage} base dmg</span>}
    </button>
  );
}
