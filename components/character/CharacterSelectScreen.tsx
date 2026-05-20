"use client";
import { useGameStore } from "@/store/gameStore";
import { CHARACTERS } from "@/data/characters";

const TYPE_BG: Record<string, string> = {
  grass: "from-emerald-950 to-slate-950 border-emerald-700",
  fire: "from-orange-950 to-slate-950 border-orange-700",
  water: "from-sky-950 to-slate-950 border-sky-700",
};

export function CharacterSelectScreen() {
  const { startRun, setScreen } = useGameStore();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8 gap-8">
      <div className="text-center">
        <p className="text-slate-500 text-sm uppercase tracking-widest mb-2">Hoenn Roguelike</p>
        <h1 className="text-4xl font-black text-white">Choose Your Starter</h1>
        <p className="text-slate-400 mt-2">Each run is unique. Build your way to victory.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full">
        {CHARACTERS.map(char => {
          const typeClass = TYPE_BG[char.types[0]] ?? "from-slate-900 to-slate-950 border-slate-700";
          return (
            <button
              key={char.id}
              onClick={() => startRun(char.id)}
              className={`
                group relative flex flex-col items-center gap-4 p-6 rounded-2xl
                border-2 bg-gradient-to-b ${typeClass}
                hover:scale-[1.03] hover:brightness-110 transition-all duration-200
                cursor-pointer
              `}
            >
              <img
                src={char.spriteUrl}
                alt={char.name}
                className="w-28 h-28 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-200"
              />
              <div className="text-center">
                <h2 className="text-xl font-black text-white">{char.name}</h2>
                <p className="text-xs text-slate-400 italic mb-2">{char.title}</p>
                <p className="text-xs text-slate-300 leading-relaxed">{char.description}</p>
              </div>

              {/* Base stats */}
              <div className="w-full space-y-1.5">
                {[
                  { label: "HP", value: char.baseStats.maxHp, max: 90 },
                  { label: "ATK", value: char.baseStats.attack, max: 18 },
                  { label: "DEF", value: char.baseStats.defense, max: 14 },
                  { label: "SPD", value: char.baseStats.speed, max: 18 },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center gap-2 text-xs">
                    <span className="w-7 text-slate-400 text-right">{stat.label}</span>
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-400 rounded-full"
                        style={{ width: `${(stat.value / stat.max) * 100}%` }}
                      />
                    </div>
                    <span className="w-5 text-slate-300">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Starter moves */}
              <div className="w-full">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">Starter Skills</p>
                <div className="flex flex-wrap gap-1">
                  {char.starterSkills.map(s => (
                    <span key={s.id} className="text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => setScreen("main_menu")}
        className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
      >
        ← Back
      </button>
    </div>
  );
}
