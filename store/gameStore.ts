import { create } from "zustand";
import type {
  RunState, GameScreen, Character, Combatant,
  BattleState, MapNode, Skill, Relic,
} from "@/lib/types";
import { CHARACTER_BY_ID } from "@/data/characters";
import { generateMap, completeNode } from "@/game/map";
import { generateRewards, generateEnemiesForNode } from "@/game/loot";
import { scaleEnemy } from "@/data/enemies";
import { SeededRNG } from "@/game/rng";
import {
  createBattleState, applyPlayerSkill, applyEnemyTurn,
  processTurnEnd, computeEnemyAction, tickCooldowns, makeLogEntry,
} from "@/game/combat";
import type { NodeType } from "@/lib/types";

// ─── Store Shape ──────────────────────────────────────────────────────────────

interface GameStore {
  screen: GameScreen;
  run: RunState;
  rng: SeededRNG;

  setScreen: (screen: GameScreen) => void;
  startRun: (characterId: string) => void;
  abandonRun: () => void;
  selectNode: (node: MapNode) => void;
  selectSkill: (skillId: string) => void;
  useSkill: (skillId: string, targetIdx?: number) => void;
  endPlayerTurn: () => void;
  acceptGold: () => void;
  pickSkill: (skill: Skill) => void;
  skipSkill: () => void;
  pickRelic: (relic: Relic) => void;
  skipReward: () => void;
  rest: () => void;
  _resolveBattleVictory: (battle: BattleState) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const emptyRun = (): RunState => ({
  active: false,
  character: null,
  player: null,
  skills: [],
  relics: [],
  gold: 0,
  floor: 0,
  map: null,
  currentBattle: null,
  pendingRewards: null,
  stats: { battlesWon: 0, damageDealt: 0, damageTaken: 0, healed: 0, kills: 0, floorsCleared: 0 },
});

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useGameStore = create<GameStore>((set, get) => ({
  screen: "main_menu",
  run: emptyRun(),
  rng: new SeededRNG(),

  setScreen: (screen: GameScreen) => set({ screen }),

  // ── Start Run ──────────────────────────────────────────────────────────────
  startRun: (characterId) => {
    const character = CHARACTER_BY_ID[characterId] as Character;
    if (!character) return;

    const rng = new SeededRNG();
    const map = generateMap(rng.int(1, 999999));

    const player: Combatant = {
      id: "player",
      name: character.name,
      spriteUrl: character.spriteUrl,
      types: character.types,
      statusEffects: [],
      shield: 0,
      stats: {
        hp: character.baseStats.maxHp,
        maxHp: character.baseStats.maxHp,
        attack: character.baseStats.attack,
        defense: character.baseStats.defense,
        speed: character.baseStats.speed,
      },
    };

    set({
      rng,
      run: {
        active: true,
        character,
        player,
        skills: character.starterSkills.map(s => ({ ...s })),
        relics: [],
        gold: 30,
        floor: 0,
        map,
        currentBattle: null,
        pendingRewards: null,
        stats: { battlesWon: 0, damageDealt: 0, damageTaken: 0, healed: 0, kills: 0, floorsCleared: 0 },
      },
      screen: "map",
    });
  },

  abandonRun: () => set({ run: emptyRun(), screen: "main_menu" }),

  // ── Map ────────────────────────────────────────────────────────────────────
  selectNode: (node) => {
    const { run, rng } = get();
    if (!run.map || !node.available || node.completed) return;

    const updatedMap = completeNode(run.map, node.id);
    const floor = node.floor;

    // Update map and floor first
    set(state => ({
      run: { ...state.run, map: updatedMap, floor },
    }));

    if (node.type === "rest") {
      set({ screen: "rest" });
      return;
    }

    if (node.type === "event" || node.type === "shop") {
      // Placeholder — skip for MVP
      set({ screen: "map" });
      return;
    }

    // Combat / Elite / Boss
    if (["combat", "elite", "boss"].includes(node.type)) {
      const { run: r, rng: r2 } = get();
      const enemyTemplates = generateEnemiesForNode(node.type, floor, r2);
      const enemies = enemyTemplates.map(t => scaleEnemy(t, floor, r2));

      // Init enemy AI decisions
      enemies.forEach(e => computeEnemyAction(e, r.player!, r2));

      const bonusEnergy = r.relics.some(rel => rel.id === "wide_lens") ? 1 : 0;
      const battle = createBattleState(r.player!, enemies, r.skills, bonusEnergy);

      // Apply battle-start relics
      let bPlayer = { ...battle.player };
      const startLogs = [...battle.log];
      for (const relic of r.relics) {
        if (relic.id === "oran_berry") {
          bPlayer = {
            ...bPlayer,
            stats: { ...bPlayer.stats, hp: Math.min(bPlayer.stats.maxHp, bPlayer.stats.hp + 10) },
          };
          startLogs.push(makeLogEntry(1, "Oran Berry restored 10 HP!", "heal"));
        }
      }

      set(state => ({
        run: {
          ...state.run,
          currentBattle: { ...battle, player: bPlayer, log: startLogs },
        },
        screen: "battle",
      }));
    }
  },

  // ── Battle: select skill ───────────────────────────────────────────────────
  selectSkill: (skillId) => {
    const { run } = get();
    if (!run.currentBattle) return;
    set(state => ({
      run: {
        ...state.run,
        currentBattle: state.run.currentBattle
          ? { ...state.run.currentBattle, selectedSkillId: skillId }
          : null,
      },
    }));
  },

  // ── Battle: use skill ──────────────────────────────────────────────────────
  useSkill: (skillId, targetIdx = 0) => {
    const { run, rng } = get();
    const battle = run.currentBattle;
    if (!battle || battle.phase !== "player_turn") return;

    const skill = battle.playerSkills.find(s => s.id === skillId);
    if (!skill || skill.currentCooldown > 0 || battle.playerEnergy < skill.energyCost) return;

    const result = applyPlayerSkill(skill, battle, targetIdx, run.relics, rng);

    const newSkills = battle.playerSkills.map(s =>
      s.id === skillId ? { ...s, currentCooldown: s.cooldown } : s
    );

    const kills = result.newEnemies.filter(
      (e, i) => e.stats.hp <= 0 && battle.enemies[i].stats.hp > 0
    ).length;

    const dmgDealt = result.logs
      .filter(l => l.type === "damage" && l.text.includes("→"))
      .reduce((sum, l) => {
        const m = l.text.match(/→ (\d+) dmg/);
        return sum + (m ? parseInt(m[1]) : 0);
      }, 0);

    const newBattle: BattleState = {
      ...battle,
      player: result.newPlayer,
      enemies: result.newEnemies,
      playerEnergy: battle.playerEnergy - result.energyCost,
      playerSkills: newSkills,
      selectedSkillId: null,
      log: [...battle.log, ...result.logs].slice(-50),
    };

    set(state => ({
      run: {
        ...state.run,
        currentBattle: newBattle,
        stats: {
          ...state.run.stats,
          kills: state.run.stats.kills + kills,
          damageDealt: state.run.stats.damageDealt + dmgDealt,
        },
      },
    }));

    // Check all enemies dead
    if (result.newEnemies.every(e => e.stats.hp <= 0)) {
      get()._resolveBattleVictory(newBattle);
    }
  },

  // ── Battle: end player turn ────────────────────────────────────────────────
  endPlayerTurn: () => {
    const { run, rng } = get();
    const battle = run.currentBattle;
    if (!battle || battle.phase !== "player_turn") return;

    // Process DoTs end of player turn
    const eot = processTurnEnd(battle.player, battle.enemies, run.relics, battle.turn);

    // Check player died from DoT
    if (eot.newPlayer.stats.hp <= 0) {
      set(state => ({
        run: {
          ...state.run,
          currentBattle: {
            ...battle,
            player: eot.newPlayer,
            enemies: eot.newEnemies,
            log: [...battle.log, ...eot.logs].slice(-50),
            phase: "defeat",
          },
        },
        screen: "game_over",
      }));
      return;
    }

    // Execute all enemy turns
    let currentPlayer = eot.newPlayer;
    let currentEnemies = [...eot.newEnemies];
    const enemyLogs: typeof battle.log = [];

    for (let i = 0; i < currentEnemies.length; i++) {
      if (currentEnemies[i].stats.hp <= 0) continue;
      const result = applyEnemyTurn(currentEnemies[i], currentPlayer, run.relics, rng, battle.turn);
      currentPlayer = result.newPlayer;
      currentEnemies[i] = result.newEnemy;
      enemyLogs.push(...result.logs);
      if (currentPlayer.stats.hp <= 0) break;
    }

    const bonusEnergy = run.relics.some(r => r.id === "wide_lens") ? 1 : 0;
    const newSkills = tickCooldowns(battle.playerSkills);

    const newBattle: BattleState = {
      ...battle,
      player: currentPlayer,
      enemies: currentEnemies,
      playerSkills: newSkills,
      playerEnergy: battle.maxEnergy + bonusEnergy,
      turn: battle.turn + 1,
      phase: "player_turn",
      log: [...battle.log, ...eot.logs, ...enemyLogs].slice(-50),
    };

    set(state => ({
      run: {
        ...state.run,
        currentBattle: newBattle,
        player: currentPlayer,
      },
    }));

    if (currentPlayer.stats.hp <= 0) {
      set({ screen: "game_over" });
    }
  },

  // ── Internal: resolve victory ──────────────────────────────────────────────
  _resolveBattleVictory: (battle: BattleState) => {
    const { run, rng } = get();
    const currentNode = run.map?.nodes.find(n => n.id === run.map?.currentNodeId);
    const nodeType = (currentNode?.type ?? "combat") as "combat" | "elite" | "boss";

    const rewards = generateRewards(nodeType, run.floor, run.relics.map(r => r.id), rng);

    set(state => ({
      run: {
        ...state.run,
        player: battle.player,
        currentBattle: null,
        pendingRewards: rewards,
        stats: {
          ...state.run.stats,
          battlesWon: state.run.stats.battlesWon + 1,
          floorsCleared: Math.max(state.run.stats.floorsCleared, run.floor),
        },
      },
      screen: nodeType === "boss" ? "victory" : "reward",
    }));
  },

  // ── Rewards ────────────────────────────────────────────────────────────────
  acceptGold: () => {
    const { run } = get();
    if (!run.pendingRewards) return;
    set(state => ({
      run: {
        ...state.run,
        gold: state.run.gold + (state.run.pendingRewards?.gold ?? 0),
        pendingRewards: state.run.pendingRewards
          ? { ...state.run.pendingRewards, gold: 0 }
          : null,
      },
    }));
  },

  pickSkill: (skill) => {
    set(state => ({
      run: {
        ...state.run,
        skills: [...state.run.skills, { ...skill }],
        pendingRewards: null,
      },
      screen: "map",
    }));
  },

  skipSkill: () => {
    set(state => ({
      run: { ...state.run, pendingRewards: null },
      screen: "map",
    }));
  },

  pickRelic: (relic) => {
    set(state => ({
      run: {
        ...state.run,
        relics: [...state.run.relics, { ...relic }],
      },
    }));
  },

  skipReward: () => {
    const { run } = get();
    set(state => ({
      run: {
        ...state.run,
        gold: state.run.gold + (run.pendingRewards?.gold ?? 0),
        pendingRewards: null,
      },
      screen: "map",
    }));
  },

  // ── Rest ───────────────────────────────────────────────────────────────────
  rest: () => {
    set(state => {
      if (!state.run.player) return state;
      const healAmt = Math.floor(state.run.player.stats.maxHp * 0.3);
      const newHp = clamp(
        state.run.player.stats.hp + healAmt,
        0,
        state.run.player.stats.maxHp
      );
      return {
        run: {
          ...state.run,
          player: {
            ...state.run.player,
            stats: { ...state.run.player.stats, hp: newHp },
          },
        },
        screen: "map",
      };
    });
  },
}));
