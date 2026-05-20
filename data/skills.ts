import type { Skill } from "@/lib/types";

export const ALL_SKILLS: Record<string, Skill> = {
  // ─── Grass ────────────────────────────────────────────────────────
  leaf_blade: {
    id: "leaf_blade", name: "Leaf Blade", description: "Sharp leaves deal damage. High critical rate.",
    energyCost: 2, category: "attack", target: "enemy", baseDamage: 18,
    cooldown: 0, currentCooldown: 0, pokemonType: "grass",
  },
  giga_drain: {
    id: "giga_drain", name: "Giga Drain", description: "Drain HP from the enemy.",
    energyCost: 3, category: "attack", target: "enemy", baseDamage: 12, baseHeal: 8,
    cooldown: 2, currentCooldown: 0, pokemonType: "grass",
  },
  absorb: {
    id: "absorb", name: "Absorb", description: "A basic draining attack.",
    energyCost: 1, category: "attack", target: "enemy", baseDamage: 7, baseHeal: 3,
    cooldown: 0, currentCooldown: 0, pokemonType: "grass",
  },
  spore: {
    id: "spore", name: "Spore", description: "Apply 2 stacks of Sleep to the enemy.",
    energyCost: 2, category: "status", target: "enemy",
    statusApply: { effectId: "sleep", stacks: 2 },
    cooldown: 3, currentCooldown: 0, pokemonType: "grass",
  },
  leech_seed: {
    id: "leech_seed", name: "Leech Seed", description: "Drains HP each turn for 3 turns.",
    energyCost: 2, category: "status", target: "enemy",
    statusApply: { effectId: "leech", stacks: 3 },
    cooldown: 4, currentCooldown: 0, pokemonType: "grass",
  },

  // ─── Fire ─────────────────────────────────────────────────────────
  ember: {
    id: "ember", name: "Ember", description: "A small burst of fire.",
    energyCost: 1, category: "attack", target: "enemy", baseDamage: 8,
    statusApply: { effectId: "burn", stacks: 1 },
    cooldown: 0, currentCooldown: 0, pokemonType: "fire",
  },
  flamethrower: {
    id: "flamethrower", name: "Flamethrower", description: "A powerful fire stream. Applies burn.",
    energyCost: 3, category: "attack", target: "enemy", baseDamage: 22,
    statusApply: { effectId: "burn", stacks: 2 },
    cooldown: 1, currentCooldown: 0, pokemonType: "fire",
  },
  blaze_kick: {
    id: "blaze_kick", name: "Blaze Kick", description: "A fiery kick with high crit chance.",
    energyCost: 2, category: "attack", target: "enemy", baseDamage: 15,
    cooldown: 0, currentCooldown: 0, pokemonType: "fire",
  },
  overheat: {
    id: "overheat", name: "Overheat", description: "Massive damage but reduces your Attack temporarily.",
    energyCost: 4, category: "attack", target: "enemy", baseDamage: 40,
    statusApply: { effectId: "atk_down", stacks: 2 },
    cooldown: 3, currentCooldown: 0, pokemonType: "fire",
  },

  // ─── Water ────────────────────────────────────────────────────────
  water_gun: {
    id: "water_gun", name: "Water Gun", description: "A quick burst of water.",
    energyCost: 1, category: "attack", target: "enemy", baseDamage: 9,
    cooldown: 0, currentCooldown: 0, pokemonType: "water",
  },
  surf: {
    id: "surf", name: "Surf", description: "A powerful wave hits all enemies.",
    energyCost: 3, category: "attack", target: "all_enemies", baseDamage: 16,
    cooldown: 1, currentCooldown: 0, pokemonType: "water",
  },
  muddy_water: {
    id: "muddy_water", name: "Muddy Water", description: "Reduces enemy accuracy with muddied water.",
    energyCost: 2, category: "status", target: "enemy", baseDamage: 10,
    statusApply: { effectId: "blind", stacks: 2 },
    cooldown: 2, currentCooldown: 0, pokemonType: "water",
  },
  aqua_tail: {
    id: "aqua_tail", name: "Aqua Tail", description: "Strike with a powerful water tail.",
    energyCost: 2, category: "attack", target: "enemy", baseDamage: 14,
    cooldown: 0, currentCooldown: 0, pokemonType: "water",
  },

  // ─── Universal ────────────────────────────────────────────────────
  harden: {
    id: "harden", name: "Harden", description: "Raise your defense. Gain shield.",
    energyCost: 1, category: "defense", target: "self", shieldAmount: 8,
    cooldown: 1, currentCooldown: 0, pokemonType: "normal",
  },
  endure: {
    id: "endure", name: "Endure", description: "Brace for impact — block a large hit.",
    energyCost: 2, category: "defense", target: "self", shieldAmount: 20,
    cooldown: 3, currentCooldown: 0, pokemonType: "normal",
  },
  recover: {
    id: "recover", name: "Recover", description: "Heal for a moderate amount.",
    energyCost: 2, category: "heal", target: "self", baseHeal: 20,
    cooldown: 2, currentCooldown: 0, pokemonType: "normal",
  },
  focus_energy: {
    id: "focus_energy", name: "Focus Energy", description: "Sharpen your focus. Next attack crits.",
    energyCost: 1, category: "status", target: "self",
    statusApply: { effectId: "focus", stacks: 1 },
    cooldown: 2, currentCooldown: 0, pokemonType: "normal",
  },
  poison_sting: {
    id: "poison_sting", name: "Poison Sting", description: "Poison the enemy.",
    energyCost: 1, category: "status", target: "enemy", baseDamage: 4,
    statusApply: { effectId: "poison", stacks: 2 },
    cooldown: 1, currentCooldown: 0, pokemonType: "poison",
  },
  toxic: {
    id: "toxic", name: "Toxic", description: "Badly poison the enemy — stacks scale damage.",
    energyCost: 2, category: "status", target: "enemy",
    statusApply: { effectId: "toxic", stacks: 1 },
    cooldown: 3, currentCooldown: 0, pokemonType: "poison",
  },
  rock_slide: {
    id: "rock_slide", name: "Rock Slide", description: "Boulders crash down on the enemy.",
    energyCost: 2, category: "attack", target: "all_enemies", baseDamage: 10,
    cooldown: 1, currentCooldown: 0, pokemonType: "rock",
  },
  earthquake: {
    id: "earthquake", name: "Earthquake", description: "Massive ground attack that hits all enemies.",
    energyCost: 4, category: "attack", target: "all_enemies", baseDamage: 20,
    cooldown: 2, currentCooldown: 0, pokemonType: "ground",
  },
  thunder: {
    id: "thunder", name: "Thunder", description: "Lightning strikes. May paralyze.",
    energyCost: 3, category: "attack", target: "enemy", baseDamage: 24,
    statusApply: { effectId: "paralyze", stacks: 2 },
    cooldown: 2, currentCooldown: 0, pokemonType: "electric",
  },
  dragon_claw: {
    id: "dragon_claw", name: "Dragon Claw", description: "Slash with draconic power.",
    energyCost: 2, category: "attack", target: "enemy", baseDamage: 20,
    cooldown: 0, currentCooldown: 0, pokemonType: "dragon",
  },
};

export function cloneSkill(skill: Skill): Skill {
  return { ...skill };
}

export function getSkillsByType(type: string): Skill[] {
  return Object.values(ALL_SKILLS).filter(s => s.pokemonType === type);
}
