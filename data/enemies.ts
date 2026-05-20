import type { Enemy } from "@/lib/types";
import { ALL_SKILLS, cloneSkill } from "./skills";
import { SeededRNG } from "@/game/rng";

export type EnemyTemplate = Omit<Enemy, "id" | "stats"> & {
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  baseSpd: number;
};

const sprite = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

export const ENEMY_TEMPLATES: EnemyTemplate[] = [
  // ─── Floor 1–3 commons ─────────────────────────────────────────────
  {
    name: "Poochyena", types: ["dark"], level: 1,
    spriteUrl: sprite(261), statusEffects: [], shield: 0,
    baseHp: 35, baseAtk: 10, baseDef: 6, baseSpd: 9,
    expReward: 20, goldReward: 15,
    aiPattern: "aggressive",
    skillPool: [cloneSkill(ALL_SKILLS.poison_sting)],
    nextAction: { intent: "attack", skillId: "poison_sting", displayValue: 10 },
  },
  {
    name: "Zigzagoon", types: ["normal"], level: 1,
    spriteUrl: sprite(263), statusEffects: [], shield: 0,
    baseHp: 30, baseAtk: 8, baseDef: 8, baseSpd: 13,
    expReward: 15, goldReward: 12,
    aiPattern: "random",
    skillPool: [cloneSkill(ALL_SKILLS.water_gun)],
    nextAction: { intent: "attack", skillId: "water_gun", displayValue: 8 },
  },
  {
    name: "Wurmple", types: ["bug"], level: 1,
    spriteUrl: sprite(265), statusEffects: [], shield: 0,
    baseHp: 28, baseAtk: 7, baseDef: 10, baseSpd: 5,
    expReward: 12, goldReward: 10,
    aiPattern: "defensive",
    skillPool: [cloneSkill(ALL_SKILLS.poison_sting)],
    nextAction: { intent: "attack", skillId: "poison_sting", displayValue: 7 },
  },
  {
    name: "Lotad", types: ["water", "grass"], level: 2,
    spriteUrl: sprite(270), statusEffects: [], shield: 0,
    baseHp: 40, baseAtk: 9, baseDef: 9, baseSpd: 8,
    expReward: 22, goldReward: 18,
    aiPattern: "tactical",
    skillPool: [cloneSkill(ALL_SKILLS.absorb), cloneSkill(ALL_SKILLS.water_gun)],
    nextAction: { intent: "attack", skillId: "absorb", displayValue: 9 },
  },

  // ─── Floor 3–6 mid-tier ────────────────────────────────────────────
  {
    name: "Breloom", types: ["grass", "fighting"], level: 4,
    spriteUrl: sprite(286), statusEffects: [], shield: 0,
    baseHp: 55, baseAtk: 20, baseDef: 10, baseSpd: 12,
    expReward: 55, goldReward: 40,
    aiPattern: "aggressive",
    skillPool: [cloneSkill(ALL_SKILLS.spore), cloneSkill(ALL_SKILLS.leaf_blade)],
    nextAction: { intent: "attack", skillId: "leaf_blade", displayValue: 20 },
  },
  {
    name: "Carvanha", types: ["water", "dark"], level: 4,
    spriteUrl: sprite(318), statusEffects: [], shield: 0,
    baseHp: 45, baseAtk: 22, baseDef: 5, baseSpd: 16,
    expReward: 50, goldReward: 38,
    aiPattern: "aggressive",
    skillPool: [cloneSkill(ALL_SKILLS.aqua_tail)],
    nextAction: { intent: "attack", skillId: "aqua_tail", displayValue: 22 },
  },
  {
    name: "Solrock", types: ["rock", "psychic"], level: 5,
    spriteUrl: sprite(338), statusEffects: [], shield: 0,
    baseHp: 65, baseAtk: 16, baseDef: 15, baseSpd: 10,
    expReward: 65, goldReward: 50,
    aiPattern: "tactical",
    skillPool: [cloneSkill(ALL_SKILLS.rock_slide), cloneSkill(ALL_SKILLS.harden)],
    nextAction: { intent: "attack", skillId: "rock_slide", displayValue: 14 },
  },
  {
    name: "Gardevoir", types: ["psychic", "fairy"], level: 6,
    spriteUrl: sprite(282), statusEffects: [], shield: 0,
    baseHp: 68, baseAtk: 18, baseDef: 10, baseSpd: 14,
    expReward: 80, goldReward: 60,
    aiPattern: "tactical",
    skillPool: [cloneSkill(ALL_SKILLS.recover), cloneSkill(ALL_SKILLS.thunder)],
    nextAction: { intent: "attack", skillId: "thunder", displayValue: 18 },
  },

  // ─── Elites ────────────────────────────────────────────────────────
  {
    name: "Aggron", types: ["steel", "rock"], level: 8,
    spriteUrl: sprite(306), statusEffects: [], shield: 20,
    baseHp: 100, baseAtk: 22, baseDef: 30, baseSpd: 6,
    expReward: 150, goldReward: 100,
    aiPattern: "defensive",
    skillPool: [cloneSkill(ALL_SKILLS.rock_slide), cloneSkill(ALL_SKILLS.earthquake), cloneSkill(ALL_SKILLS.harden)],
    nextAction: { intent: "attack", skillId: "rock_slide", displayValue: 22 },
  },
  {
    name: "Flygon", types: ["ground", "dragon"], level: 9,
    spriteUrl: sprite(330), statusEffects: [], shield: 10,
    baseHp: 90, baseAtk: 26, baseDef: 14, baseSpd: 22,
    expReward: 160, goldReward: 110,
    aiPattern: "aggressive",
    skillPool: [cloneSkill(ALL_SKILLS.dragon_claw), cloneSkill(ALL_SKILLS.earthquake)],
    nextAction: { intent: "attack", skillId: "dragon_claw", displayValue: 26 },
  },
  {
    name: "Milotic", types: ["water"], level: 9,
    spriteUrl: sprite(350), statusEffects: [], shield: 0,
    baseHp: 110, baseAtk: 18, baseDef: 18, baseSpd: 14,
    expReward: 170, goldReward: 115,
    aiPattern: "tactical",
    skillPool: [cloneSkill(ALL_SKILLS.surf), cloneSkill(ALL_SKILLS.recover), cloneSkill(ALL_SKILLS.muddy_water)],
    nextAction: { intent: "attack", skillId: "surf", displayValue: 18 },
  },

  // ─── Bosses ────────────────────────────────────────────────────────
  {
    name: "Groudon", types: ["ground"], level: 15,
    spriteUrl: sprite(383), statusEffects: [], shield: 30,
    baseHp: 200, baseAtk: 40, baseDef: 30, baseSpd: 15,
    expReward: 500, goldReward: 300,
    aiPattern: "tactical",
    skillPool: [cloneSkill(ALL_SKILLS.earthquake), cloneSkill(ALL_SKILLS.rock_slide), cloneSkill(ALL_SKILLS.harden)],
    nextAction: { intent: "attack", skillId: "earthquake", displayValue: 40 },
  },
  {
    name: "Kyogre", types: ["water"], level: 15,
    spriteUrl: sprite(382), statusEffects: [], shield: 0,
    baseHp: 190, baseAtk: 38, baseDef: 22, baseSpd: 18,
    expReward: 500, goldReward: 300,
    aiPattern: "aggressive",
    skillPool: [cloneSkill(ALL_SKILLS.surf), cloneSkill(ALL_SKILLS.thunder), cloneSkill(ALL_SKILLS.muddy_water)],
    nextAction: { intent: "attack", skillId: "surf", displayValue: 38 },
  },
  {
    name: "Rayquaza", types: ["dragon", "flying"], level: 18,
    spriteUrl: sprite(384), statusEffects: [], shield: 20,
    baseHp: 220, baseAtk: 45, baseDef: 20, baseSpd: 25,
    expReward: 800, goldReward: 500,
    aiPattern: "aggressive",
    skillPool: [cloneSkill(ALL_SKILLS.dragon_claw), cloneSkill(ALL_SKILLS.overheat), cloneSkill(ALL_SKILLS.thunder)],
    nextAction: { intent: "attack", skillId: "dragon_claw", displayValue: 45 },
  },
];

/** Scale enemy stats by floor level */
export function scaleEnemy(template: EnemyTemplate, floor: number, rng: SeededRNG): Enemy {
  const scale = 1 + floor * 0.12;
  return {
    ...template,
    id: `${template.name.toLowerCase()}_${rng.int(1000, 9999)}`,
    skillPool: template.skillPool.map(s => ({ ...s })),
    stats: {
      hp: Math.floor(template.baseHp * scale),
      maxHp: Math.floor(template.baseHp * scale),
      attack: Math.floor(template.baseAtk * scale),
      defense: Math.floor(template.baseDef * scale),
      speed: Math.floor(template.baseSpd * scale),
    },
    nextAction: { ...template.nextAction, displayValue: Math.floor((template.nextAction.displayValue ?? 10) * scale) },
  };
}

export const COMMON_ENEMIES = ENEMY_TEMPLATES.slice(0, 4);
export const MID_ENEMIES = ENEMY_TEMPLATES.slice(4, 8);
export const ELITE_ENEMIES = ENEMY_TEMPLATES.slice(8, 11);
export const BOSS_ENEMIES = ENEMY_TEMPLATES.slice(11);
