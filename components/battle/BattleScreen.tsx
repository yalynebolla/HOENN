"use client";
import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { HPBar } from "@/components/ui/HPBar";
import { StatusBadges } from "@/components/ui/StatusBadges";
import { SkillCard } from "@/components/battle/SkillCard";
import { EnemyCard } from "@/components/battle/EnemyCard";

export function BattleScreen() {
  const { run, useSkill, endPlayerTurn, selectSkill } = useGameStore();
  const battle = run.currentBattle;
  const [targetIdx, setTargetIdx] = useState(0);

  if (!battle) return null;

  const isPlayerTurn = battle.phase === "player_turn";
  const selectedSkill = battle.playerSkills.find(s => s.id === battle.selectedSkillId);
  const aliveEnemies = battle.enemies.filter(e => e.stats.hp > 0);

  const handleSkillClick = (skillId: string) => {
    if (!isPlayerTurn) return;
    const skill = battle.playerSkills.find(s => s.id === skillId);
    if (!skill) return;

    if (skill.target === "self" || skill.target === "all_enemies") {
      // No targeting needed
      useSkill(skillId, 0);
    } else {
      // Need to select target
      if (battle.selectedSkillId === skillId) {
        // Already selected — use on current target
        useSkill(skillId, targetIdx);
        selectSkill("");
      } else {
        selectSkill(skillId);
      }
    }
  };

  const handleEnemyClick = (idx: number) => {
    setTargetIdx(idx);
    if (battle.selectedSkillId) {
      useSkill(battle.selectedSkillId, idx);
      selectSkill("");
    }
  };

  const recentLogs = [...battle.log].reverse().slice(0, 8);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top bar — turn & energy */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-900/80 border-b border-slate-800">
        <span className="text-slate-400 text-sm">Turn {battle.turn}</span>
        <div className="flex items-center gap-1">
          {Array.from({ length: battle.maxEnergy }).map((_, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full border-2 transition-colors ${
                i < battle.playerEnergy
                  ? "bg-amber-400 border-amber-300"
                  : "bg-slate-700 border-slate-600"
              }`}
            />
          ))}
          <span className="ml-2 text-sm text-amber-300">{battle.playerEnergy}/{battle.maxEnergy} EP</span>
        </div>
        <span className={`text-sm font-semibold ${isPlayerTurn ? "text-emerald-400" : "text-red-400"}`}>
          {isPlayerTurn ? "Your Turn" : "Enemy Turn"}
        </span>
      </div>

      <div className="flex flex-1 gap-0">
        {/* LEFT — Player info + skills */}
        <div className="w-80 flex flex-col bg-slate-900/40 border-r border-slate-800 p-4 gap-4">
          {/* Player */}
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={battle.player.spriteUrl}
                alt={battle.player.name}
                className="w-14 h-14 object-contain"
              />
              <div className="flex-1">
                <HPBar combatant={battle.player} size="md" />
              </div>
            </div>
            <StatusBadges effects={battle.player.statusEffects} />
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-400">
              <div>ATK <span className="text-white font-medium">{battle.player.stats.attack}</span></div>
              <div>DEF <span className="text-white font-medium">{battle.player.stats.defense}</span></div>
              <div>SPD <span className="text-white font-medium">{battle.player.stats.speed}</span></div>
            </div>
          </div>

          {/* Relics */}
          {run.relics.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Relics</p>
              <div className="flex flex-wrap gap-1.5">
                {run.relics.map(relic => (
                  <span
                    key={relic.id}
                    title={`${relic.name}: ${relic.description}`}
                    className="text-lg cursor-help"
                  >
                    {relic.icon}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          <div className="flex-1">
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">
              Skills {selectedSkill ? "— Click enemy to use" : ""}
            </p>
            <div className="flex flex-col gap-2">
              {battle.playerSkills.map(skill => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  selected={battle.selectedSkillId === skill.id}
                  playerEnergy={battle.playerEnergy}
                  disabled={!isPlayerTurn}
                  onClick={() => handleSkillClick(skill.id)}
                />
              ))}
            </div>
          </div>

          {/* End turn */}
          <button
            onClick={isPlayerTurn ? endPlayerTurn : undefined}
            disabled={!isPlayerTurn}
            className={`
              w-full py-3 rounded-lg font-bold text-sm transition-all
              ${isPlayerTurn
                ? "bg-slate-700 hover:bg-slate-600 text-white border border-slate-500 hover:border-slate-400"
                : "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700"}
            `}
          >
            End Turn →
          </button>
        </div>

        {/* CENTER — Battle arena */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8 relative">
          {/* Background atmosphere */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 opacity-50" />

          {/* Enemies */}
          <div className={`relative z-10 flex items-end gap-6 justify-center flex-wrap`}>
            {battle.enemies.map((enemy, idx) => (
              <EnemyCard
                key={enemy.id}
                enemy={enemy}
                selected={targetIdx === idx && !!battle.selectedSkillId && enemy.stats.hp > 0}
                canTarget={!!battle.selectedSkillId && isPlayerTurn}
                onClick={() => handleEnemyClick(idx)}
              />
            ))}
          </div>

          {/* VS divider */}
          <div className="relative z-10 text-slate-700 text-4xl font-black">VS</div>

          {/* Battle log */}
          <div className="relative z-10 w-full max-w-lg">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-1 max-h-36 overflow-y-auto">
              {recentLogs.map(log => (
                <p
                  key={log.id}
                  className={`text-xs leading-relaxed ${
                    log.type === "damage" ? "text-red-300" :
                    log.type === "heal" ? "text-emerald-300" :
                    log.type === "status" ? "text-fuchsia-300" :
                    log.type === "shield" ? "text-sky-300" :
                    "text-slate-400"
                  }`}
                >
                  {log.text}
                </p>
              ))}
            </div>
          </div>

          {/* Target hint */}
          {selectedSkill && selectedSkill.target === "enemy" && (
            <div className="relative z-10 text-amber-300 text-sm animate-pulse">
              👆 Click an enemy to use {selectedSkill.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
