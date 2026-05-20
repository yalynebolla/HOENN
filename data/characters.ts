import type { Character } from "@/lib/types";
import { ALL_SKILLS, cloneSkill } from "./skills";

export const CHARACTERS: Character[] = [
  {
    id: "treecko",
    name: "Treecko",
    title: "The Swift Tactician",
    description: "Fast and precise. Drains life, poisons enemies, and wins through attrition. High skill floor, massive ceiling.",
    spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/252.png`,
    types: ["grass"],
    color: "green",
    baseStats: { maxHp: 70, attack: 14, defense: 8, speed: 18 },
    starterSkills: [
      cloneSkill(ALL_SKILLS.leaf_blade),
      cloneSkill(ALL_SKILLS.absorb),
      cloneSkill(ALL_SKILLS.harden),
    ],
  },
  {
    id: "torchic",
    name: "Torchic",
    title: "The Glass Cannon",
    description: "Explosive damage through burn stacks. Dies fast, kills faster. All-in offensive playstyle.",
    spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/255.png`,
    types: ["fire"],
    color: "orange",
    baseStats: { maxHp: 60, attack: 18, defense: 6, speed: 14 },
    starterSkills: [
      cloneSkill(ALL_SKILLS.ember),
      cloneSkill(ALL_SKILLS.blaze_kick),
      cloneSkill(ALL_SKILLS.harden),
    ],
  },
  {
    id: "mudkip",
    name: "Mudkip",
    title: "The Brawler",
    description: "Tanky and reliable. Shrugs off hits, builds shield, wins through sheer durability and AoE.",
    spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/258.png`,
    types: ["water"],
    color: "blue",
    baseStats: { maxHp: 90, attack: 12, defense: 14, speed: 10 },
    starterSkills: [
      cloneSkill(ALL_SKILLS.water_gun),
      cloneSkill(ALL_SKILLS.muddy_water),
      cloneSkill(ALL_SKILLS.endure),
    ],
  },
];

export const CHARACTER_BY_ID = Object.fromEntries(CHARACTERS.map(c => [c.id, c]));
