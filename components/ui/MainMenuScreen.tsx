"use client";
import { useGameStore } from "@/store/gameStore";

export function MainMenuScreen() {
  const { setScreen } = useGameStore();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.08)_0%,_transparent_70%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-slate-950 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10 text-center px-4">
        {/* Logo */}
        <div className="space-y-2">
          <p className="text-slate-500 text-xs uppercase tracking-[0.4em]">Hoenn Region</p>
          <h1 className="text-6xl md:text-7xl font-black tracking-tight">
            <span className="text-white">Pokémon</span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
              Roguelike
            </span>
          </h1>
          <p className="text-slate-400 text-lg mt-4">
            Build. Synergize. Survive.
          </p>
        </div>

        {/* Starters preview */}
        <div className="flex items-end gap-2 opacity-60">
          {[252, 255, 258].map((id, i) => (
            <img
              key={id}
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`}
              alt=""
              className="object-contain"
              style={{ width: 80 + i * 8, height: 80 + i * 8 }}
            />
          ))}
        </div>

        {/* Menu buttons */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => setScreen("character_select")}
            className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-bold text-lg rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-violet-900/50"
          >
            New Run
          </button>
          <div className="text-xs text-slate-600 text-center pt-2">
            Gen III · 12 Floors · Infinite Builds
          </div>
        </div>

        {/* Feature tags */}
        <div className="flex flex-wrap gap-2 justify-center text-xs">
          {["Procedural Maps", "35+ Relics", "20+ Skills", "Weighted RNG", "Build Synergies"].map(tag => (
            <span key={tag} className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-400">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
