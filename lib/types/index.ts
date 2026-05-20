// ─── Core Entities ────────────────────────────────────────────────────────────

export type PokemonType =
  | "fire" | "water" | "grass" | "electric" | "psychic" | "dark"
  | "steel" | "rock" | "ground" | "dragon" | "ghost" | "fighting"
  | "poison" | "ice" | "normal" | "flying" | "bug" | "fairy";

export interface StatBlock {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface StatusEffect {
  id: string;
  name: string;
  icon: string;
  stacks: number;
  turnsLeft: number; // -1 = permanent until battle ends
}

export interface Combatant {
  id: string;
  name: string;
  spriteUrl: string;
  stats: StatBlock;
  types: PokemonType[];
  statusEffects: StatusEffect[];
  shield: number;
}

// ─── Skills / Moves ───────────────────────────────────────────────────────────

export type SkillTarget = "enemy" | "self" | "all_enemies";
export type SkillCategory = "attack" | "defense" | "status" | "heal";

export interface Skill {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  category: SkillCategory;
  target: SkillTarget;
  baseDamage?: number;
  baseHeal?: number;
  shieldAmount?: number;
  statusApply?: { effectId: string; stacks: number };
  cooldown: number; // 0 = no cooldown
  currentCooldown: number;
  pokemonType: PokemonType;
}

// ─── Relics ───────────────────────────────────────────────────────────────────

export type RelicTrigger =
  | "on_battle_start" | "on_turn_start" | "on_kill"
  | "on_damage_dealt" | "on_damage_taken" | "on_heal" | "passive";

export type RelicRarity = "common" | "uncommon" | "rare" | "legendary";

export interface Relic {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: RelicRarity;
  trigger: RelicTrigger;
  // The actual effect is handled in the engine via relic ID
}

// ─── Character ────────────────────────────────────────────────────────────────

export type CharacterId = "treecko" | "torchic" | "mudkip";

export interface Character {
  id: CharacterId;
  name: string;
  title: string;
  description: string;
  spriteUrl: string;
  starterSkills: Skill[];
  baseStats: Omit<StatBlock, "hp">; // hp derived from maxHp
  types: PokemonType[];
  color: string; // tailwind color class
}

// ─── Map ──────────────────────────────────────────────────────────────────────

export type NodeType = "combat" | "elite" | "event" | "shop" | "rest" | "boss";

export interface MapNode {
  id: string;
  type: NodeType;
  floor: number;
  col: number;
  connections: string[]; // IDs of next nodes
  completed: boolean;
  available: boolean;
}

export interface GameMap {
  nodes: MapNode[];
  currentNodeId: string | null;
  floors: number;
}

// ─── Enemies ──────────────────────────────────────────────────────────────────

export type EnemyIntent = "attack" | "defend" | "buff" | "debuff" | "special";

export interface EnemyAction {
  intent: EnemyIntent;
  skillId: string;
  displayValue?: number; // damage preview, shield preview etc.
}

export interface Enemy extends Combatant {
  level: number;
  expReward: number;
  goldReward: number;
  nextAction: EnemyAction;
  aiPattern: "aggressive" | "defensive" | "tactical" | "random";
  skillPool: Skill[];
}

// ─── Battle ───────────────────────────────────────────────────────────────────

export type BattlePhase = "player_turn" | "enemy_turn" | "resolving" | "victory" | "defeat";

export interface BattleLogEntry {
  id: string;
  turn: number;
  text: string;
  type: "damage" | "heal" | "status" | "shield" | "info";
}

export interface BattleState {
  phase: BattlePhase;
  turn: number;
  player: Combatant;
  enemies: Enemy[];
  playerEnergy: number;
  maxEnergy: number;
  playerSkills: Skill[];
  log: BattleLogEntry[];
  selectedSkillId: string | null;
}

// ─── Run State ────────────────────────────────────────────────────────────────

export type GameScreen =
  | "main_menu"
  | "character_select"
  | "map"
  | "battle"
  | "reward"
  | "event"
  | "shop"
  | "rest"
  | "game_over"
  | "victory";

export interface RunState {
  active: boolean;
  character: Character | null;
  player: Combatant | null;
  skills: Skill[];
  relics: Relic[];
  gold: number;
  floor: number;
  map: GameMap | null;
  currentBattle: BattleState | null;
  pendingRewards: RewardPool | null;
  stats: RunStats;
}

export interface RewardPool {
  gold: number;
  skillChoices: Skill[];
  relicChoices: Relic[];
  type: "combat" | "elite" | "boss";
}

export interface RunStats {
  battlesWon: number;
  damageDealt: number;
  damageTaken: number;
  healed: number;
  kills: number;
  floorsCleared: number;
}
