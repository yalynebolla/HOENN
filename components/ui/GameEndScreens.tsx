"use client";
import { useGameStore } from "@/store/gameStore";

export function GameOverScreen() {
  const { run, setScreen, abandonRun } = useGameStore();
  const s = run.stats;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8 gap-8">
      <div className="text-center space-y-2">
        <div className="text-6xl mb-4">💀</div>
        <h1 className="text-4xl font-black text-red-400">Defeated</h1>
        <p className="text-slate-400">Your run ends here on floor {run.floor}.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-xs w-full">
        {[
          { label: "Floor Reached", value: run.floor },
          { label: "Battles Won", value: s.battlesWon },
          { label: "Damage Dealt", value: s.damageDealt },
          { label: "Enemies Killed", value: s.kills },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-900 rounded-xl p-4 text-center border border-slate-800">
            <p className="text-2xl font-black text-white">{stat.value}</p>
            <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {run.relics.length > 0 && (
        <div className="text-center">
          <p className="text-xs text-slate-500 mb-2">Relics Collected</p>
          <div className="flex gap-2 justify-center">
            {run.relics.map(r => (
              <span key={r.id} title={r.name} className="text-2xl">{r.icon}</span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={() => { abandonRun(); setScreen("character_select"); }}
          className="px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-bold transition-all"
        >
          Try Again
        </button>
        <button
          onClick={abandonRun}
          className="px-6 py-3 border border-slate-700 hover:border-slate-500 rounded-xl text-slate-400 hover:text-white transition-all"
        >
          Main Menu
        </button>
      </div>
    </div>
  );
}

export function VictoryScreen() {
  const { run, abandonRun, setScreen } = useGameStore();
  const s = run.stats;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8 gap-8">
      <div className="text-center space-y-2">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-4xl font-black text-amber-300">Victory!</h1>
        <p className="text-slate-300">You conquered Hoenn! The legendary Pokémon bows to your build.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-xs w-full">
        {[
          { label: "Battles Won", value: s.battlesWon },
          { label: "Enemies Killed", value: s.kills },
          { label: "Damage Dealt", value: s.damageDealt },
          { label: "Gold Collected", value: run.gold },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-900 rounded-xl p-4 text-center border border-amber-900/40">
            <p className="text-2xl font-black text-amber-300">{stat.value}</p>
            <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => { abandonRun(); setScreen("character_select"); }}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold transition-all"
        >
          Play Again
        </button>
        <button
          onClick={abandonRun}
          className="px-6 py-3 border border-slate-700 hover:border-slate-500 rounded-xl text-slate-400 hover:text-white transition-all"
        >
          Main Menu
        </button>
      </div>
    </div>
  );
}
