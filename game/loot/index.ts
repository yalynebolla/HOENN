import type { RewardPool, Relic } from "@/lib/types";
import { ALL_RELICS } from "@/data/relics";
import { ALL_SKILLS, cloneSkill } from "@/data/skills";
import { SeededRNG } from "@/game/rng";
import type { NodeType } from "@/lib/types";

const RARITY_WEIGHTS = {
  combat: [{ rarity: "common", weight: 60 }, { rarity: "uncommon", weight: 30 }, { rarity: "rare", weight: 9 }, { rarity: "legendary", weight: 1 }],
  elite:  [{ rarity: "common", weight: 30 }, { rarity: "uncommon", weight: 40 }, { rarity: "rare", weight: 25 }, { rarity: "legendary", weight: 5 }],
  boss:   [{ rarity: "common", weight: 5  }, { rarity: "uncommon", weight: 25 }, { rarity: "rare", weight: 45 }, { rarity: "legendary", weight: 25 }],
};

export function generateRewards(
  nodeType: Extract<NodeType, "combat" | "elite" | "boss">,
  floor: number,
  ownedRelicIds: string[],
  rng: SeededRNG
): RewardPool {
  // Gold scales with floor
  const baseGold = nodeType === "boss" ? 80 : nodeType === "elite" ? 40 : 20;
  const gold = rng.int(baseGold, Math.floor(baseGold * 1.5)) + floor * 3;

  // Skills — offer 3 choices
  const skillPool = Object.values(ALL_SKILLS);
  const skillChoices = rng.pickN(skillPool, 3).map(cloneSkill);

  // Relic — 0-1 for combat, 1 for elite/boss
  const relicChoices: Relic[] = [];
  const offerRelicChance = nodeType === "combat" ? 0.4 : 1.0;

  if (rng.chance(offerRelicChance)) {
    const weights = RARITY_WEIGHTS[nodeType];
    const pickedRarity = rng.weightedPick(weights).rarity;
    const pool = ALL_RELICS.filter(r => r.rarity === pickedRarity && !ownedRelicIds.includes(r.id));
    if (pool.length > 0) {
      const count = nodeType === "boss" ? Math.min(2, pool.length) : 1;
      relicChoices.push(...rng.pickN(pool, count));
    }
  }

  return { gold, skillChoices, relicChoices, type: nodeType };
}

export function generateEnemiesForNode(
  nodeType: NodeType,
  floor: number,
  rng: SeededRNG
): import("@/data/enemies").EnemyTemplate[] {
  const { COMMON_ENEMIES, MID_ENEMIES, ELITE_ENEMIES, BOSS_ENEMIES } = require("@/data/enemies");

  if (nodeType === "boss") {
    // Final boss selection based on floor
    const bossIdx = floor >= 12 ? 2 : floor >= 8 ? 1 : 0;
    return [BOSS_ENEMIES[bossIdx]];
  }

  if (nodeType === "elite") {
    return [rng.pick(ELITE_ENEMIES)];
  }

  // Regular combat — 1–3 enemies based on floor
  const pool = floor <= 4 ? COMMON_ENEMIES : [...COMMON_ENEMIES, ...MID_ENEMIES];
  const count = floor <= 2 ? 1 : floor <= 5 ? rng.int(1, 2) : rng.int(1, 3);
  return rng.pickN(pool, count);
}
