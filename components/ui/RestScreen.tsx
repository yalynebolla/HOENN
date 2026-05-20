"use client";
import { useGameStore } from "@/store/gameStore";

export function RestScreen() {
  const { run, rest } = useGameStore();
  const healAmt = Math.floor((run.player?.stats.maxHp ?? 0) * 0.3);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8 gap-8">
      <div className="text-center space-y-2">
        <div className="text-6xl mb-4">🔥</div>
        <h1 className="text-3xl font-black text-emerald-300">Campfire</h1>
        <p className="text-slate-400">Rest and recover before the next challenge.</p>
      </div>

      {run.player && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm text-center space-y-4">
          <img
            src={run.player.spriteUrl}
            alt={run.player.name}
            className="w-24 h-24 object-contain mx-auto"
          />
          <div>
            <p className="text-slate-400 text-sm">Current HP</p>
            <p className="text-2xl font-black text-white">
              {run.player.stats.hp} / {run.player.stats.maxHp}
            </p>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${(run.player.stats.hp / run.player.stats.maxHp) * 100}%` }}
            />
          </div>
          <p className="text-emerald-400 text-sm">
            +{healAmt} HP after resting
            <span className="text-slate-500 text-xs block">(30% of max HP)</span>
          </p>
        </div>
      )}

      <button
        onClick={rest}
        className="px-8 py-4 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-lg rounded-xl transition-all hover:scale-[1.02]"
      >
        Rest 🔥
      </button>
    </div>
  );
}
