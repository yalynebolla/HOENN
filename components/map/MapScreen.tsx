"use client";
import { useGameStore } from "@/store/gameStore";
import { NODE_ICONS, NODE_COLORS } from "@/game/map";
import type { MapNode } from "@/lib/types";

const COLS = 6;

export function MapScreen() {
  const { run, selectNode, abandonRun } = useGameStore();

  if (!run.map) return null;

  const { nodes, floors } = run.map;
  const currentFloor = run.floor;

  // Group nodes by floor
  const byFloor: Record<number, MapNode[]> = {};
  for (const node of nodes) {
    if (!byFloor[node.floor]) byFloor[node.floor] = [];
    byFloor[node.floor].push(node);
  }

  // Build connection lines data for SVG
  const nodePositions: Record<string, { x: number; y: number }> = {};
  const floorCount = floors;
  const svgW = 600;
  const svgH = floorCount * 72;

  for (const node of nodes) {
    const floorNodes = byFloor[node.floor];
    const colStep = svgW / (COLS + 1);
    nodePositions[node.id] = {
      x: (node.col + 1) * (svgW / COLS),
      y: svgH - (node.floor / floorCount) * svgH + 24,
    };
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900/80 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white">Hoenn Route</h1>
          <p className="text-sm text-slate-400">Floor {currentFloor} / {floors} — Choose your path</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Player status */}
          <div className="flex items-center gap-3 bg-slate-800 rounded-lg px-3 py-2 border border-slate-700">
            <img src={run.player?.spriteUrl} alt="" className="w-8 h-8 object-contain" />
            <div>
              <p className="text-xs text-slate-400">{run.character?.name}</p>
              <p className="text-sm font-semibold text-emerald-400">
                ❤️ {run.player?.stats.hp}/{run.player?.stats.maxHp}
              </p>
            </div>
          </div>
          <div className="text-sm text-amber-300 font-semibold">💰 {run.gold}g</div>
          <div className="flex gap-1">
            {run.relics.map(r => (
              <span key={r.id} title={r.name} className="text-lg">{r.icon}</span>
            ))}
          </div>
          <button
            onClick={abandonRun}
            className="text-xs text-slate-500 hover:text-red-400 transition-colors border border-slate-700 hover:border-red-800 px-2 py-1 rounded"
          >
            Abandon Run
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <div className="max-w-2xl mx-auto relative">
          {/* SVG connections */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width="100%"
            viewBox={`0 0 ${svgW} ${svgH}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {nodes.map(node =>
              node.connections.map(targetId => {
                const from = nodePositions[node.id];
                const to = nodePositions[targetId];
                if (!from || !to) return null;
                const isActive = node.completed || node.available;
                return (
                  <line
                    key={`${node.id}-${targetId}`}
                    x1={from.x} y1={from.y}
                    x2={to.x} y2={to.y}
                    stroke={isActive ? "#475569" : "#1e293b"}
                    strokeWidth="2"
                    strokeDasharray={isActive ? "none" : "4,4"}
                  />
                );
              })
            )}
          </svg>

          {/* Nodes rendered floor by floor, bottom to top */}
          <div className="flex flex-col-reverse gap-3">
            {Array.from({ length: floors }, (_, i) => i + 1).map(floor => {
              const floorNodes = byFloor[floor] ?? [];
              return (
                <div key={floor} className="relative flex justify-center gap-4 py-1">
                  {/* Floor label */}
                  <span className="absolute -left-2 top-1/2 -translate-y-1/2 text-xs text-slate-700 w-6 text-right">
                    {floor}
                  </span>
                  {floorNodes.map(node => (
                    <NodeButton key={node.id} node={node} onSelect={selectNode} />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Skills panel */}
      <div className="border-t border-slate-800 bg-slate-900/60 px-6 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-slate-500 uppercase tracking-wider">Skills:</span>
          {run.skills.map(skill => (
            <span
              key={skill.id}
              title={skill.description}
              className="text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300"
            >
              {skill.name} (⚡{skill.energyCost})
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function NodeButton({ node, onSelect }: { node: MapNode; onSelect: (n: MapNode) => void }) {
  const isCompleted = node.completed;
  const isAvailable = node.available && !isCompleted;
  const isCurrent = !isCompleted && !isAvailable;

  const colorClass = NODE_COLORS[node.type];
  const icon = NODE_ICONS[node.type];

  return (
    <button
      onClick={() => isAvailable && onSelect(node)}
      disabled={!isAvailable}
      title={node.type.charAt(0).toUpperCase() + node.type.slice(1)}
      className={`
        w-12 h-12 rounded-lg border-2 text-xl flex items-center justify-center
        transition-all duration-200 relative
        ${colorClass}
        ${isCompleted ? "opacity-30 grayscale cursor-default" : ""}
        ${isAvailable ? "cursor-pointer hover:scale-110 hover:brightness-125 shadow-lg" : ""}
        ${!isAvailable && !isCompleted ? "opacity-20 cursor-default" : ""}
      `}
    >
      {icon}
      {isAvailable && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
      )}
      {isCompleted && (
        <span className="absolute -top-1 -right-1 text-xs">✓</span>
      )}
    </button>
  );
}
