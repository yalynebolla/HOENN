import type {
  BattleState, Combatant, Enemy, Skill, Relic,
  StatusEffect, BattleLogEntry, BattlePhase,
} from "@/lib/types";
import { SeededRNG } from "@/game/rng";

// ─── Status Effect IDs ────────────────────────────────────────────────────────
export const STATUS_DEFS: Record<string, { name: string; icon: string; description: string }> = {
  burn:     { name: "Burn",     icon: "🔥", description: "Deals 5 damage/turn. Reduces Attack." },
  poison:   { name: "Poison",   icon: "☠️", description: "Deals 4 damage/turn per stack." },
  toxic:    { name: "Toxic",    icon: "💀", description: "Scales damage each turn." },
  sleep:    { name: "Sleep",    icon: "😴", description: "Cannot act for N turns." },
  paralyze: { name: "Paralyze", icon: "⚡", description: "50% chance to skip turn." },
  leech:    { name: "Leech",    icon: "🌿", description: "Lose 6 HP/turn." },
  blind:    { name: "Blind",    icon: "👁️", description: "Attacks have 40% miss chance." },
  focus:    { name: "Focus",    icon: "🎯", description: "Next attack is guaranteed crit." },
  atk_down: { name: "Atk Down", icon: "⬇️", description: "Attack reduced temporarily." },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function makeLogEntry(
  turn: number,
  text: string,
  type: BattleLogEntry["type"]
): BattleLogEntry {
  return { id: `${turn}_${Math.random().toString(36).slice(2, 7)}`, turn, text, type };
}

function hasStatus(combatant: Combatant, id: string): boolean {
  return combatant.statusEffects.some(s => s.id === id && s.stacks > 0);
}

function getStatus(combatant: Combatant, id: string): StatusEffect | undefined {
  return combatant.statusEffects.find(s => s.id === id);
}

function applyStatusToTarget(
  target: Combatant,
  effectId: string,
  stacks: number
): Combatant {
  const def = STATUS_DEFS[effectId];
  if (!def) return target;
  const existing = target.statusEffects.find(s => s.id === effectId);
  if (existing) {
    return {
      ...target,
      statusEffects: target.statusEffects.map(s =>
        s.id === effectId ? { ...s, stacks: s.stacks + stacks, turnsLeft: stacks + 2 } : s
      ),
    };
  }
  const newEffect: StatusEffect = {
    id: effectId, name: def.name, icon: def.icon,
    stacks, turnsLeft: stacks + 2,
  };
  return { ...target, statusEffects: [...target.statusEffects, newEffect] };
}

function removeStatus(combatant: Combatant, effectId: string): Combatant {
  return {
    ...combatant,
    statusEffects: combatant.statusEffects.filter(s => s.id !== effectId),
  };
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

// ─── Relic Effect Calculations ────────────────────────────────────────────────

function getRelicDamageMultiplier(relics: Relic[], skillType: string): number {
  let mult = 1.0;
  for (const relic of relics) {
    if (relic.id === "life_orb") mult += 0.5;
    if (relic.id === "mystic_water" && skillType === "water") mult += 0.35;
    if (relic.id === "charcoal" && skillType === "fire") mult += 0.35;
    if (relic.id === "miracle_seed" && skillType === "grass") mult += 0.35;
    if (relic.id === "hard_stone" && skillType === "rock") mult += 0.30;
    if (relic.id === "silk_scarf" && skillType === "normal") mult += 0.20;
    if (relic.id === "soul_dew" && skillType === "psychic") mult += 0.60;
    if (relic.id === "red_orb" && skillType === "fire") mult += 0.70;
    if (relic.id === "choice_band") mult += 1.0; // double
  }
  return mult;
}

// ─── Damage Calculation ───────────────────────────────────────────────────────

interface DamageCalcInput {
  skill: Skill;
  attacker: Combatant;
  defender: Combatant;
  relics: Relic[];
  rng: SeededRNG;
  isCrit?: boolean;
}

export function calculateDamage(input: DamageCalcInput): number {
  const { skill, attacker, defender, relics, rng } = input;
  if (!skill.baseDamage) return 0;

  // Check scope lens / focus for crit
  const hasScopeLens = relics.some(r => r.id === "scope_lens");
  const critChance = hasScopeLens ? 0.25 : 0.125;
  const hasFocus = hasStatus(attacker, "focus");
  const isCrit = input.isCrit ?? (hasFocus || rng.chance(critChance));

  // Base formula: ATK vs DEF with variance
  const variance = rng.float(0.85, 1.15);
  const atkStat = attacker.stats.attack;
  const defStat = Math.max(1, defender.stats.defense);
  const atkDownStacks = getStatus(attacker, "atk_down")?.stacks ?? 0;
  const effectiveAtk = atkStat * (1 - atkDownStacks * 0.1);

  const rawDmg = (skill.baseDamage * (effectiveAtk / defStat) * variance);
  const critMult = isCrit ? 1.5 : 1.0;
  const relicMult = getRelicDamageMultiplier(relics, skill.pokemonType);

  return Math.max(1, Math.floor(rawDmg * critMult * relicMult));
}

// ─── Apply Skill ──────────────────────────────────────────────────────────────

export interface SkillResult {
  newPlayer: Combatant;
  newEnemies: Enemy[];
  logs: BattleLogEntry[];
  energyCost: number;
  isCrit: boolean;
}

export function applyPlayerSkill(
  skill: Skill,
  state: BattleState,
  targetIdx: number,
  relics: Relic[],
  rng: SeededRNG
): SkillResult {
  let player = { ...state.player };
  let enemies = state.enemies.map(e => ({ ...e }));
  const logs: BattleLogEntry[] = [];
  const turn = state.turn;
  let isCrit = false;

  // Consume focus
  const hasFocus = hasStatus(player, "focus");
  if (hasFocus) {
    player = removeStatus(player, "focus");
    isCrit = true;
  }

  // Check blind on player — attacking
  if (hasStatus(player, "blind") && rng.chance(0.4)) {
    logs.push(makeLogEntry(turn, `${player.name}'s attack missed!`, "info"));
    return { newPlayer: player, newEnemies: enemies, logs, energyCost: skill.energyCost, isCrit };
  }

  const targets = skill.target === "all_enemies"
    ? enemies.map((_, i) => i)
    : [targetIdx];

  for (const tIdx of targets) {
    const target = enemies[tIdx];
    if (!target || target.stats.hp <= 0) continue;

    // Damage
    if (skill.baseDamage) {
      const dmg = calculateDamage({ skill, attacker: player, defender: target, relics, rng, isCrit });
      const absorbed = Math.min(target.shield, dmg);
      const hpDmg = dmg - absorbed;
      enemies[tIdx] = {
        ...target,
        shield: target.shield - absorbed,
        stats: { ...target.stats, hp: clamp(target.stats.hp - hpDmg, 0, target.stats.maxHp) },
      };
      const critTxt = isCrit ? " [CRIT!]" : "";
      logs.push(makeLogEntry(turn, `${player.name} used ${skill.name} → ${dmg} dmg${critTxt}`, "damage"));

      // Shell Bell
      if (relics.some(r => r.id === "shell_bell")) {
        const healed = Math.floor(dmg * 0.25);
        player = { ...player, stats: { ...player.stats, hp: clamp(player.stats.hp + healed, 0, player.stats.maxHp) } };
        if (healed > 0) logs.push(makeLogEntry(turn, `Shell Bell restored ${healed} HP!`, "heal"));
      }

      // Life Orb cost
      if (relics.some(r => r.id === "life_orb")) {
        player = { ...player, stats: { ...player.stats, hp: Math.max(1, player.stats.hp - 5) } };
      }

      // King's Rock flinch
      if (relics.some(r => r.id === "kings_rock") && rng.chance(0.15)) {
        enemies[tIdx] = applyStatusToTarget(enemies[tIdx], "sleep", 1) as Enemy;
        logs.push(makeLogEntry(turn, `${target.name} flinched!`, "status"));
      }
    }

    // Heal player from draining moves
    if (skill.baseHeal && skill.category === "attack") {
      const healed = skill.baseHeal;
      player = { ...player, stats: { ...player.stats, hp: clamp(player.stats.hp + healed, 0, player.stats.maxHp) } };
      logs.push(makeLogEntry(turn, `${player.name} drained ${healed} HP!`, "heal"));
    }

    // Apply status to enemy
    if (skill.statusApply && skill.target !== "self") {
      const immune = checkRelicImmunity(skill.statusApply.effectId, relics, true);
      if (!immune) {
        enemies[tIdx] = applyStatusToTarget(enemies[tIdx], skill.statusApply.effectId, skill.statusApply.stacks) as Enemy;
        logs.push(makeLogEntry(turn, `${target.name} is now ${STATUS_DEFS[skill.statusApply.effectId]?.name ?? skill.statusApply.effectId}!`, "status"));
      }
    }
  }

  // Self effects
  if (skill.target === "self") {
    if (skill.shieldAmount) {
      player = { ...player, shield: player.shield + skill.shieldAmount };
      logs.push(makeLogEntry(turn, `${player.name} gained ${skill.shieldAmount} shield!`, "shield"));
    }
    if (skill.baseHeal) {
      const healed = skill.baseHeal;
      player = { ...player, stats: { ...player.stats, hp: clamp(player.stats.hp + healed, 0, player.stats.maxHp) } };
      logs.push(makeLogEntry(turn, `${player.name} recovered ${healed} HP!`, "heal"));
    }
    if (skill.statusApply) {
      player = applyStatusToTarget(player, skill.statusApply.effectId, skill.statusApply.stacks) as Combatant;
      logs.push(makeLogEntry(turn, `${player.name} gained ${STATUS_DEFS[skill.statusApply.effectId]?.name}!`, "status"));
    }
  }

  return { newPlayer: player, newEnemies: enemies as Enemy[], logs, energyCost: skill.energyCost, isCrit };
}

// ─── Enemy AI ─────────────────────────────────────────────────────────────────

export function computeEnemyAction(enemy: Enemy, player: Combatant, rng: SeededRNG): void {
  const pool = enemy.skillPool;
  if (pool.length === 0) return;

  let chosenSkill: Skill;
  switch (enemy.aiPattern) {
    case "aggressive":
      // Always pick highest damage move
      chosenSkill = pool.reduce((best, s) => (s.baseDamage ?? 0) > (best.baseDamage ?? 0) ? s : best, pool[0]);
      break;
    case "defensive":
      // Prefer defense/heal if low HP
      const lowHp = enemy.stats.hp < enemy.stats.maxHp * 0.4;
      const healSkill = pool.find(s => s.category === "heal" || s.category === "defense");
      chosenSkill = (lowHp && healSkill) ? healSkill : rng.pick(pool);
      break;
    case "tactical":
      // Prefer status if not applied, otherwise attack
      const hasPoison = player.statusEffects.some(s => ["poison", "toxic", "burn"].includes(s.id));
      const statusSkill = pool.find(s => s.statusApply);
      chosenSkill = (!hasPoison && statusSkill) ? statusSkill : pool.find(s => s.baseDamage) ?? pool[0];
      break;
    default:
      chosenSkill = rng.pick(pool);
  }

  enemy.nextAction = {
    intent: chosenSkill.category === "defense" ? "defend"
          : chosenSkill.statusApply ? "debuff"
          : "attack",
    skillId: chosenSkill.id,
    displayValue: chosenSkill.baseDamage
      ? Math.floor(chosenSkill.baseDamage * (enemy.stats.attack / 10))
      : chosenSkill.shieldAmount,
  };
}

export function applyEnemyTurn(
  enemy: Enemy,
  player: Combatant,
  relics: Relic[],
  rng: SeededRNG,
  turn: number
): { newPlayer: Combatant; newEnemy: Enemy; logs: BattleLogEntry[] } {
  let p = { ...player };
  let e = { ...enemy };
  const logs: BattleLogEntry[] = [];

  // Check if enemy can act
  if (hasStatus(e, "sleep")) {
    const sl = getStatus(e, "sleep")!;
    logs.push(makeLogEntry(turn, `${e.name} is fast asleep!`, "status"));
    e = {
      ...e,
      statusEffects: e.statusEffects.map(s =>
        s.id === "sleep" ? { ...s, stacks: s.stacks - 1, turnsLeft: s.turnsLeft - 1 } : s
      ).filter(s => s.stacks > 0),
    };
    computeEnemyAction(e, p, rng);
    return { newPlayer: p, newEnemy: e, logs };
  }

  if (hasStatus(e, "paralyze") && rng.chance(0.5)) {
    logs.push(makeLogEntry(turn, `${e.name} is paralyzed and can't move!`, "status"));
    return { newPlayer: p, newEnemy: e, logs };
  }

  const skill = e.skillPool.find(s => s.id === e.nextAction.skillId) ?? e.skillPool[0];
  if (!skill) return { newPlayer: p, newEnemy: e, logs };

  if (skill.baseDamage) {
    const dmg = calculateDamage({ skill, attacker: e, defender: p, relics: [], rng });
    const absorbed = Math.min(p.shield, dmg);
    const hpDmg = dmg - absorbed;

    // Focus Sash
    const hasSash = relics.some(r => r.id === "focus_sash");
    const wouldDie = p.stats.hp - hpDmg <= 0;
    if (hasSash && wouldDie && p.stats.hp > 1) {
      p = { ...p, shield: 0, stats: { ...p.stats, hp: 1 } };
      logs.push(makeLogEntry(turn, `${e.name} used ${skill.name} → ${dmg} dmg (Focus Sash saved you with 1 HP!)`, "damage"));
    } else {
      p = { ...p, shield: p.shield - absorbed, stats: { ...p.stats, hp: clamp(p.stats.hp - hpDmg, 0, p.stats.maxHp) } };
      logs.push(makeLogEntry(turn, `${e.name} used ${skill.name} → ${dmg} dmg`, "damage"));
    }
  }

  if (skill.shieldAmount) {
    e = { ...e, shield: e.shield + skill.shieldAmount };
    logs.push(makeLogEntry(turn, `${e.name} gained ${skill.shieldAmount} shield!`, "shield"));
  }

  if (skill.statusApply && skill.target !== "self") {
    const immune = checkRelicImmunity(skill.statusApply.effectId, relics, false);
    if (!immune) {
      p = applyStatusToTarget(p, skill.statusApply.effectId, skill.statusApply.stacks) as Combatant;
      logs.push(makeLogEntry(turn, `${p.name} is now ${STATUS_DEFS[skill.statusApply.effectId]?.name}!`, "status"));
    }
  }

  computeEnemyAction(e, p, rng);
  return { newPlayer: p, newEnemy: e, logs };
}

// ─── End of Turn (DoT, regen, etc.) ──────────────────────────────────────────

export function processTurnEnd(
  player: Combatant,
  enemies: Enemy[],
  relics: Relic[],
  turn: number
): { newPlayer: Combatant; newEnemies: Enemy[]; logs: BattleLogEntry[] } {
  let p = { ...player };
  let es = enemies.map(e => ({ ...e }));
  const logs: BattleLogEntry[] = [];

  // ── Player status DoTs ──
  for (const effect of p.statusEffects) {
    if (effect.id === "burn") {
      const dmg = 5;
      p = { ...p, stats: { ...p.stats, hp: clamp(p.stats.hp - dmg, 0, p.stats.maxHp) } };
      logs.push(makeLogEntry(turn, `${p.name} is hurt by burn! (-${dmg} HP)`, "damage"));
    }
    if (effect.id === "poison") {
      const dmg = 4 * effect.stacks;
      p = { ...p, stats: { ...p.stats, hp: clamp(p.stats.hp - dmg, 0, p.stats.maxHp) } };
      logs.push(makeLogEntry(turn, `${p.name} is hurt by poison! (-${dmg} HP)`, "damage"));
    }
    if (effect.id === "leech") {
      const dmg = 6;
      p = { ...p, stats: { ...p.stats, hp: clamp(p.stats.hp - dmg, 0, p.stats.maxHp) } };
      logs.push(makeLogEntry(turn, `Leech Seed drained ${dmg} HP!`, "damage"));
    }
  }

  // Tick down player status durations
  p = {
    ...p,
    statusEffects: p.statusEffects
      .map(s => ({ ...s, turnsLeft: s.turnsLeft > 0 ? s.turnsLeft - 1 : s.turnsLeft }))
      .filter(s => s.turnsLeft !== 0),
  };

  // ── Enemy status DoTs ──
  es = es.map(enemy => {
    let e = { ...enemy };
    for (const effect of e.statusEffects) {
      if (effect.id === "burn") {
        const dmg = 5;
        e = { ...e, stats: { ...e.stats, hp: clamp(e.stats.hp - dmg, 0, e.stats.maxHp) } };
        logs.push(makeLogEntry(turn, `${e.name} is hurt by burn! (-${dmg} HP)`, "damage"));
      }
      if (effect.id === "poison") {
        const dmg = 4 * effect.stacks;
        e = { ...e, stats: { ...e.stats, hp: clamp(e.stats.hp - dmg, 0, e.stats.maxHp) } };
        logs.push(makeLogEntry(turn, `${e.name} is hurt by poison! (-${dmg} HP)`, "damage"));
      }
      if (effect.id === "toxic") {
        const dmg = 5 * effect.stacks;
        e = {
          ...e,
          stats: { ...e.stats, hp: clamp(e.stats.hp - dmg, 0, e.stats.maxHp) },
          statusEffects: e.statusEffects.map(s => s.id === "toxic" ? { ...s, stacks: s.stacks + 1 } : s),
        };
        logs.push(makeLogEntry(turn, `Toxic is getting worse! ${e.name} takes ${dmg} dmg!`, "damage"));
      }
    }
    e = {
      ...e,
      statusEffects: e.statusEffects
        .map(s => ({ ...s, turnsLeft: s.turnsLeft > 0 ? s.turnsLeft - 1 : s.turnsLeft }))
        .filter(s => s.turnsLeft !== 0),
    };
    return e;
  });

  // ── Relic effects at turn start/end ──
  for (const relic of relics) {
    if (relic.id === "leftovers" || relic.id === "lum_berry_ancient") {
      if (relic.id === "leftovers") {
        const healed = 8;
        p = { ...p, stats: { ...p.stats, hp: clamp(p.stats.hp + healed, 0, p.stats.maxHp) } };
        logs.push(makeLogEntry(turn, `Leftovers restored ${healed} HP!`, "heal"));
      }
      if (relic.id === "lum_berry_ancient") {
        p = { ...p, statusEffects: [] };
        logs.push(makeLogEntry(turn, `Lum Berry cleared all status effects!`, "status"));
      }
    }
    if (relic.id === "black_sludge") {
      es = es.map(e => ({
        ...e,
        stats: { ...e.stats, hp: clamp(e.stats.hp - 5, 0, e.stats.maxHp) },
      }));
      logs.push(makeLogEntry(turn, `Black Sludge deals 5 poison damage to all enemies!`, "status"));
    }
    if (relic.id === "wide_lens") {
      // handled in store — +1 energy
    }
  }

  return { newPlayer: p, newEnemies: es as Enemy[], logs };
}

// ─── Relic Immunity Check ─────────────────────────────────────────────────────

function checkRelicImmunity(effectId: string, relics: Relic[], isPlayer: boolean): boolean {
  if (!isPlayer) return false;
  if (effectId === "poison" && relics.some(r => r.id === "pecha_berry")) return true;
  if (effectId === "sleep" && relics.some(r => r.id === "chesto_berry")) return true;
  return false;
}

// ─── Battle Initialization ────────────────────────────────────────────────────

export function createBattleState(
  player: Combatant,
  enemies: Enemy[],
  skills: import("@/lib/types").Skill[],
  bonusEnergy: number = 0
): BattleState {
  return {
    phase: "player_turn",
    turn: 1,
    player: { ...player, statusEffects: [], shield: 0 },
    enemies: enemies.map(e => ({ ...e })),
    playerEnergy: 3 + bonusEnergy,
    maxEnergy: 3 + bonusEnergy,
    playerSkills: skills.map(s => ({ ...s, currentCooldown: 0 })),
    log: [makeLogEntry(1, "Battle started!", "info")],
    selectedSkillId: null,
  };
}

export function tickCooldowns(skills: import("@/lib/types").Skill[]): import("@/lib/types").Skill[] {
  return skills.map(s => ({
    ...s,
    currentCooldown: Math.max(0, s.currentCooldown - 1),
  }));
}
