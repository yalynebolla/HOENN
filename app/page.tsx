"use client";
import { useGameStore } from "@/store/gameStore";
import { MainMenuScreen } from "@/components/ui/MainMenuScreen";
import { CharacterSelectScreen } from "@/components/character/CharacterSelectScreen";
import { MapScreen } from "@/components/map/MapScreen";
import { BattleScreen } from "@/components/battle/BattleScreen";
import { RewardScreen } from "@/components/rewards/RewardScreen";
import { RestScreen } from "@/components/ui/RestScreen";
import { GameOverScreen, VictoryScreen } from "@/components/ui/GameEndScreens";

export default function Home() {
  const { screen } = useGameStore();

  return (
    <main>
      {screen === "main_menu"       && <MainMenuScreen />}
      {screen === "character_select" && <CharacterSelectScreen />}
      {screen === "map"             && <MapScreen />}
      {screen === "battle"          && <BattleScreen />}
      {screen === "reward"          && <RewardScreen />}
      {screen === "rest"            && <RestScreen />}
      {screen === "game_over"       && <GameOverScreen />}
      {screen === "victory"         && <VictoryScreen />}
    </main>
  );
}
