import { IslandBuilding, Monster, PlayerState } from '../types/game';
import { createMonsterInstance } from './monstersData';

const STORAGE_KEY = 'monsterr_game_state_v1';

export function getInitialGameState(): PlayerState {
  const m1 = createMonsterInstance('pyrodrake', 14);
  const m2 = createMonsterInstance('terrarok', 13);
  const m3 = createMonsterInstance('shadowfang', 12);
  const m4 = createMonsterInstance('aquashark', 10);

  const defaultBuildings: IslandBuilding[] = [
    {
      id: 'b_habitat_fire',
      type: 'habitat',
      name: 'Fire Habitat',
      nameAr: 'موطن اللهب البركاني',
      element: 'fire',
      level: 3,
      maxLevel: 5,
      x: 34,
      y: 42,
      goldAccumulated: 340,
      maxGoldCapacity: 800,
      monsterIds: [m1.id],
      maxMonsters: 3,
    },
    {
      id: 'b_habitat_earth',
      type: 'habitat',
      name: 'Earth Habitat',
      nameAr: 'موطن الصخور والزمرد',
      element: 'earth',
      level: 2,
      maxLevel: 5,
      x: 62,
      y: 36,
      goldAccumulated: 210,
      maxGoldCapacity: 600,
      monsterIds: [m2.id],
      maxMonsters: 2,
    },
    {
      id: 'b_habitat_dark',
      type: 'habitat',
      name: 'Dark Habitat',
      nameAr: 'موطن الظلال الأبدي',
      element: 'dark',
      level: 2,
      maxLevel: 5,
      x: 22,
      y: 60,
      goldAccumulated: 420,
      maxGoldCapacity: 600,
      monsterIds: [m3.id],
      maxMonsters: 2,
    },
    {
      id: 'b_habitat_water',
      type: 'habitat',
      name: 'Water Habitat',
      nameAr: 'موطن الشلالات المائية',
      element: 'water',
      level: 2,
      maxLevel: 5,
      x: 52,
      y: 64,
      goldAccumulated: 180,
      maxGoldCapacity: 600,
      monsterIds: [m4.id],
      maxMonsters: 2,
    },
    {
      id: 'b_breeding',
      type: 'breeding',
      name: 'Breeding Mountain',
      nameAr: 'جبل التزاوج الأسطوري',
      level: 2,
      maxLevel: 3,
      x: 48,
      y: 20,
      monsterIds: [],
    },
    {
      id: 'b_hatchery',
      type: 'hatchery',
      name: 'Monster Hatchery',
      nameAr: 'حاضنة وفقس البيوض',
      level: 2,
      maxLevel: 4,
      x: 75,
      y: 50,
      monsterIds: [],
    },
    {
      id: 'b_farm_1',
      type: 'farm',
      name: 'Dragon Fruit Farm',
      nameAr: 'مزرعة ثمار التنين',
      level: 3,
      maxLevel: 5,
      x: 20,
      y: 35,
      monsterIds: [],
      currentCrop: 'Dragon Pepper',
      foodAccumulated: 150,
      harvestReadyAt: Date.now() - 10000, // ready to harvest!
    },
    {
      id: 'b_storage',
      type: 'storage',
      name: 'Resource Vault',
      nameAr: 'خزينة الذهب والموارد',
      level: 2,
      maxLevel: 5,
      x: 78,
      y: 28,
      monsterIds: [],
    },
  ];

  m1.habitatId = 'b_habitat_fire';
  m2.habitatId = 'b_habitat_earth';
  m3.habitatId = 'b_habitat_dark';
  m4.habitatId = 'b_habitat_water';

  return {
    playerName: 'سيد الوحوش (Monster Master)',
    level: 12,
    xp: 640,
    maxXp: 1200,
    gold: 4850,
    food: 1450,
    gems: 45,
    buildings: defaultBuildings,
    monsters: [m1, m2, m3, m4],
    eggsInHatchery: [
      {
        id: 'egg_fire_1',
        speciesId: 'pyrodrake',
        nameAr: 'بيضة التنين الناري',
        element: 'fire',
        hatchTimeMs: 30000,
        startedAt: Date.now() - 25000,
        readyAt: Date.now() + 5000,
        isReady: false,
      },
    ],
    completedStages: 1,
  };
}

export function loadSavedGameState(): PlayerState {
  if (typeof window === 'undefined') return getInitialGameState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.monsters && parsed.buildings) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load saved MONSTERR state, using default:', err);
  }
  return getInitialGameState();
}

export function saveGameState(state: PlayerState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save MONSTERR state:', err);
  }
}
