import type { GameMap, MapNode, NodeType } from "@/lib/types";
import { SeededRNG } from "@/game/rng";

const FLOORS = 12;
const COLS = 6;
const BOSS_FLOOR = FLOORS;

// Node type weights per floor tier
function getNodeWeights(floor: number): { type: NodeType; weight: number }[] {
  if (floor === BOSS_FLOOR) return [{ type: "boss", weight: 1 }];

  const isEarly = floor <= 3;
  const isMid = floor > 3 && floor <= 8;

  if (isEarly) return [
    { type: "combat", weight: 60 },
    { type: "event", weight: 20 },
    { type: "rest", weight: 10 },
    { type: "shop", weight: 10 },
  ];

  if (isMid) return [
    { type: "combat", weight: 45 },
    { type: "elite", weight: 15 },
    { type: "event", weight: 15 },
    { type: "rest", weight: 15 },
    { type: "shop", weight: 10 },
  ];

  // Late game
  return [
    { type: "combat", weight: 35 },
    { type: "elite", weight: 25 },
    { type: "event", weight: 15 },
    { type: "rest", weight: 15 },
    { type: "shop", weight: 10 },
  ];
}

/** Generate a procedural map */
export function generateMap(seed?: number): GameMap {
  const rng = new SeededRNG(seed);
  const nodes: MapNode[] = [];

  // How many nodes per floor (varies for branching)
  const nodesPerFloor: number[] = [];
  for (let f = 1; f <= FLOORS; f++) {
    if (f === 1 || f === BOSS_FLOOR) {
      nodesPerFloor.push(1); // Single entry/boss node
    } else if (f === Math.floor(FLOORS / 2)) {
      nodesPerFloor.push(1); // Mid-point convergence
    } else {
      nodesPerFloor.push(rng.int(2, Math.min(4, COLS)));
    }
  }

  // Generate nodes floor by floor
  for (let floor = 1; floor <= FLOORS; floor++) {
    const count = nodesPerFloor[floor - 1];
    const weights = getNodeWeights(floor);

    // Ensure at least one rest near the boss
    const guaranteeRest = floor === BOSS_FLOOR - 1;

    for (let c = 0; c < count; c++) {
      const type: NodeType = guaranteeRest && c === 0
        ? "rest"
        : rng.weightedPick(weights).type;

      // Spread columns evenly
      const col = count === 1
        ? Math.floor(COLS / 2)
        : Math.floor((c / (count - 1)) * (COLS - 1));

      nodes.push({
        id: `node_${floor}_${c}`,
        type,
        floor,
        col,
        connections: [],
        completed: false,
        available: floor === 1,
      });
    }
  }

  // Connect nodes floor to floor
  for (let floor = 1; floor < FLOORS; floor++) {
    const currentFloorNodes = nodes.filter(n => n.floor === floor);
    const nextFloorNodes = nodes.filter(n => n.floor === floor + 1);

    for (const node of currentFloorNodes) {
      if (nextFloorNodes.length === 1) {
        // All converge
        node.connections.push(nextFloorNodes[0].id);
        continue;
      }

      // Connect to 1-2 nearby nodes on the next floor
      const sorted = [...nextFloorNodes].sort(
        (a, b) => Math.abs(a.col - node.col) - Math.abs(b.col - node.col)
      );
      const numConnections = rng.int(1, Math.min(2, sorted.length));
      const picks = sorted.slice(0, numConnections);
      node.connections.push(...picks.map(n => n.id));
    }

    // Ensure every next-floor node has at least one incoming connection
    for (const next of nextFloorNodes) {
      const hasIncoming = currentFloorNodes.some(n => n.connections.includes(next.id));
      if (!hasIncoming) {
        const closest = currentFloorNodes.reduce((a, b) =>
          Math.abs(a.col - next.col) < Math.abs(b.col - next.col) ? a : b
        );
        if (!closest.connections.includes(next.id)) {
          closest.connections.push(next.id);
        }
      }
    }
  }

  return {
    nodes,
    currentNodeId: null,
    floors: FLOORS,
  };
}

export function getAvailableNodes(map: GameMap): MapNode[] {
  return map.nodes.filter(n => n.available && !n.completed);
}

export function completeNode(map: GameMap, nodeId: string): GameMap {
  const updatedNodes = map.nodes.map(n => {
    if (n.id === nodeId) return { ...n, completed: true, available: false };

    // Unlock connected nodes
    const completedNode = map.nodes.find(mn => mn.id === nodeId);
    if (completedNode?.connections.includes(n.id)) {
      return { ...n, available: true };
    }
    return n;
  });

  return { ...map, nodes: updatedNodes, currentNodeId: nodeId };
}

export function getCurrentFloor(map: GameMap): number {
  if (!map.currentNodeId) return 0;
  const node = map.nodes.find(n => n.id === map.currentNodeId);
  return node?.floor ?? 0;
}

export const NODE_ICONS: Record<NodeType, string> = {
  combat: "⚔️",
  elite: "💀",
  event: "❓",
  shop: "🛒",
  rest: "🔥",
  boss: "👁️",
};

export const NODE_COLORS: Record<NodeType, string> = {
  combat: "bg-slate-700 border-slate-500",
  elite: "bg-red-950 border-red-700",
  event: "bg-indigo-950 border-indigo-600",
  shop: "bg-amber-950 border-amber-600",
  rest: "bg-emerald-950 border-emerald-600",
  boss: "bg-purple-950 border-purple-500",
};
