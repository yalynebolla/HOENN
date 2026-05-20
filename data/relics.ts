import type { Relic } from "@/lib/types";

export const ALL_RELICS: Relic[] = [
  // ─── Common ───────────────────────────────────────────────────────
  {
    id: "oran_berry", name: "Oran Berry", icon: "🫐",
    description: "At the start of each battle, heal 10 HP.",
    rarity: "common", trigger: "on_battle_start",
  },
  {
    id: "pecha_berry", name: "Pecha Berry", icon: "🍑",
    description: "Immune to Poison.",
    rarity: "common", trigger: "passive",
  },
  {
    id: "chesto_berry", name: "Chesto Berry", icon: "🍇",
    description: "Immune to Sleep.",
    rarity: "common", trigger: "passive",
  },
  {
    id: "persim_berry", name: "Persim Berry", icon: "🫐",
    description: "Immune to Confusion.",
    rarity: "common", trigger: "passive",
  },
  {
    id: "hard_stone", name: "Hard Stone", icon: "🪨",
    description: "Rock-type attacks deal +30% damage.",
    rarity: "common", trigger: "passive",
  },
  {
    id: "silk_scarf", name: "Silk Scarf", icon: "🎀",
    description: "Normal-type attacks deal +20% damage.",
    rarity: "common", trigger: "passive",
  },

  // ─── Uncommon ─────────────────────────────────────────────────────
  {
    id: "kings_rock", name: "King's Rock", icon: "👑",
    description: "All attacks have a 15% chance to flinch the enemy, skipping their next action.",
    rarity: "uncommon", trigger: "on_damage_dealt",
  },
  {
    id: "shell_bell", name: "Shell Bell", icon: "🐚",
    description: "Heal 25% of all damage you deal.",
    rarity: "uncommon", trigger: "on_damage_dealt",
  },
  {
    id: "scope_lens", name: "Scope Lens", icon: "🔭",
    description: "Critical hit rate doubled.",
    rarity: "uncommon", trigger: "passive",
  },
  {
    id: "black_sludge", name: "Black Sludge", icon: "🫧",
    description: "At the end of each turn, deal 5 poison damage to all enemies.",
    rarity: "uncommon", trigger: "on_turn_start",
  },
  {
    id: "mystic_water", name: "Mystic Water", icon: "💧",
    description: "Water-type attacks deal +35% damage.",
    rarity: "uncommon", trigger: "passive",
  },
  {
    id: "charcoal", name: "Charcoal", icon: "🔥",
    description: "Fire-type attacks deal +35% damage.",
    rarity: "uncommon", trigger: "passive",
  },
  {
    id: "miracle_seed", name: "Miracle Seed", icon: "🌱",
    description: "Grass-type attacks deal +35% damage.",
    rarity: "uncommon", trigger: "passive",
  },
  {
    id: "wide_lens", name: "Wide Lens", icon: "🔍",
    description: "Gain +1 energy at the start of each turn.",
    rarity: "uncommon", trigger: "on_turn_start",
  },

  // ─── Rare ─────────────────────────────────────────────────────────
  {
    id: "focus_sash", name: "Focus Sash", icon: "🏮",
    description: "Once per battle, survive a killing blow with 1 HP.",
    rarity: "rare", trigger: "on_damage_taken",
  },
  {
    id: "life_orb", name: "Life Orb", icon: "🔮",
    description: "All attacks deal +50% damage but cost 5 HP per use.",
    rarity: "rare", trigger: "on_damage_dealt",
  },
  {
    id: "choice_band", name: "Choice Band", icon: "🩹",
    description: "Attack is locked to one skill, but that skill deals double damage.",
    rarity: "rare", trigger: "passive",
  },
  {
    id: "leftovers", name: "Leftovers", icon: "🍖",
    description: "Heal 8 HP at the start of every turn.",
    rarity: "rare", trigger: "on_turn_start",
  },
  {
    id: "black_belt", name: "Black Belt", icon: "🥋",
    description: "Fighting-type attacks deal +40% damage. Gain +5 Attack permanently.",
    rarity: "rare", trigger: "passive",
  },

  // ─── Legendary ────────────────────────────────────────────────────
  {
    id: "soul_dew", name: "Soul Dew", icon: "✨",
    description: "All stat-boosting effects are doubled. Psychic moves deal +60% damage.",
    rarity: "legendary", trigger: "passive",
  },
  {
    id: "lum_berry_ancient", name: "Lum Berry (Ancient)", icon: "🍒",
    description: "Remove all status effects at the start of each turn. Immune to all debuffs.",
    rarity: "legendary", trigger: "on_turn_start",
  },
  {
    id: "red_orb", name: "Red Orb", icon: "🔴",
    description: "Blazing power: Fire attacks hit all enemies and have +70% damage.",
    rarity: "legendary", trigger: "passive",
  },
  {
    id: "blue_orb", name: "Blue Orb", icon: "🔵",
    description: "Ancient sea power: Water attacks restore energy equal to damage dealt / 10.",
    rarity: "legendary", trigger: "on_damage_dealt",
  },
];

export const RELIC_BY_ID = Object.fromEntries(ALL_RELICS.map(r => [r.id, r]));

export function getRelicsByRarity(rarity: string): Relic[] {
  return ALL_RELICS.filter(r => r.rarity === rarity);
}
