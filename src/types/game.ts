export type ElementType =
  | 'fire'
  | 'nature'
  | 'earth'
  | 'thunder'
  | 'water'
  | 'dark'
  | 'magic'
  | 'light'
  | 'metal'
  | 'special';

export type MonsterRole = 'Attacker' | 'Tank' | 'Support' | 'Control';

export type MonsterRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Ancestor';

export type RuneType = 'life' | 'strength' | 'speed' | 'team_speed';

export interface MonsterRune {
  id: string;
  type: RuneType;
  level: number; // 1 to 10
  bonusPercent?: number; // e.g. +15%
  bonusFlat?: number; // e.g. +12 speed
  nameAr: string;
}

export interface MonsterRelic {
  id: string;
  category: 'Amulet' | 'Sword' | 'Shield' | 'Staff' | 'Armor' | 'Mask';
  nameAr: string;
  perkDescriptionAr: string;
}

export interface MonsterSkill {
  id: string;
  name: string;
  nameAr: string;
  element: ElementType;
  power: number;
  staminaCost: number;
  cooldown: number; // in turns
  currentCooldown?: number;
  target: 'single_enemy' | 'all_enemies' | 'self' | 'all_allies';
  description: string;
  descriptionAr: string;
  effectType?: 'damage' | 'heal' | 'burn' | 'stun' | 'bleed' | 'drain' | 'buff' | 'shield';
  effectValue?: number;
  animationKey:
    | 'attack_meteor_special'
    | 'attack_earth_shatter'
    | 'attack_physical_claws_fire'
    | 'attack_dark_bloodplague'
    | 'attack_water_surge'
    | 'attack_heal_bloom'
    | 'attack_physical_strike'
    | 'attack_thunder_strike'
    | 'attack_nature_vines';
}

export type EvolutionStage = 'baby' | 'juvenile' | 'adult' | 'ascended';

export interface Monster {
  id: string;
  speciesId: string;
  name: string;
  nameAr: string;
  element: ElementType;
  secondaryElement?: ElementType;
  role: MonsterRole;
  rarity: MonsterRarity;
  level: number;
  rank: number; // 0 to 5
  xp: number;
  maxXp: number;
  stage: EvolutionStage;
  stars: number; // 1 to 5 stars
  maxHp: number;
  currentHp: number;
  attack: number;
  defense: number;
  speed: number;
  stamina: number;
  maxStamina: number;
  avatar: string;
  habitatId?: string;
  skills: MonsterSkill[];
  unlockedSkillIds?: string[];
  runes: MonsterRune[];
  relics?: MonsterRelic[];
  goldPerHour: number;
  canEvolve?: boolean;
  evolutionMilestone?: 10 | 20 | 35;
  isLevelLocked?: boolean;
  lockedReasonAr?: string;
}

export type BuildingType = 'habitat' | 'breeding' | 'hatchery' | 'farm' | 'storage' | 'lab';

export interface IslandBuilding {
  id: string;
  type: BuildingType;
  name: string;
  nameAr: string;
  element?: ElementType;
  level: number;
  maxLevel: number;
  x: number; // percentage on island map
  y: number; // percentage on island map
  goldAccumulated?: number;
  maxGoldCapacity?: number;
  foodAccumulated?: number;
  monsterIds: string[];
  maxMonsters?: number;
  // For Farm
  currentCrop?: string;
  harvestReadyAt?: number; // timestamp
  plantedAt?: number;
  growthDurationSeconds?: number;
  cropYield?: number;
  // For Breeding
  parent1Id?: string;
  parent2Id?: string;
  breedingReadyAt?: number;
  breedingResultEgg?: MonsterEgg;
}

export interface MonsterEgg {
  id: string;
  speciesId: string;
  nameAr: string;
  element: ElementType;
  hatchTimeMs: number;
  startedAt: number;
  readyAt: number;
  isReady: boolean;
}

export interface PlayerState {
  playerName: string;
  level: number;
  xp: number;
  maxXp: number;
  gold: number;
  food: number;
  gems: number;
  trophies: number;
  league: 'Bronze' | 'Silver' | 'Gold' | 'Champion' | 'Legendary';
  buildings: IslandBuilding[];
  monsters: Monster[];
  eggsInHatchery: MonsterEgg[];
  completedStages: number;
  defenseMonsterIds: string[];
  runesInventory: MonsterRune[];
  colosseumScores: Record<string, number>;
}

export interface BattleMonster {
  monster: Monster;
  isAi: boolean;
  position: number; // 0, 1, 2
  currentHp: number;
  currentStamina: number;
  skillCooldowns: Record<string, number>;
  statusEffects: {
    type: 'burn' | 'poison' | 'stun' | 'shield' | 'attack_boost';
    duration: number; // turns
    value: number;
  }[];
  isDefeated: boolean;
}

export interface BattleStage {
  id: number;
  nameAr: string;
  subtitle: string;
  difficulty: 'سهل' | 'متوسط' | 'صعب' | 'خبير' | 'أسطوري' | 'زعيم';
  recommendedLevel: number;
  enemies: {
    speciesId: string;
    level: number;
  }[];
  rewards: {
    gold: number;
    food: number;
    xp: number;
    gemChance: number;
  };
}
