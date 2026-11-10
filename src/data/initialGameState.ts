import { IslandBuilding, Monster, PlayerState } from '../types/game';
import { createMonsterInstance, SPECIES_CATALOG } from './monstersData';

const CURRENT_VERSION = 'v2_monsterr';
const STORAGE_KEY = `monsterr_game_state_${CURRENT_VERSION}`;
const LEGACY_STORAGE_KEY = 'monsterr_game_state_v1';

export function getInitialGameState(): PlayerState {
  const m1 = createMonsterInstance('pyrodrake', 14);
  const m2 = createMonsterInstance('terrarok', 13);
  const m3 = createMonsterInstance('shadowfang', 12);
  const m4 = createMonsterInstance('aquashark', 10);
  const m5 = createMonsterInstance('floragorgon', 11);
  const m6 = createMonsterInstance('voltrion', 12);

  const defaultBuildings: IslandBuilding[] = [
    {
      id: 'b_habitat_fire',
      type: 'habitat',
      name: 'Fire Habitat',
      nameAr: 'موطن اللهب البركاني',
      element: 'fire',
      level: 3,
      maxLevel: 5,
      x: 20,
      y: 48,
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
      x: 50,
      y: 46,
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
      x: 80,
      y: 50,
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
      x: 34,
      y: 75,
      goldAccumulated: 180,
      maxGoldCapacity: 600,
      monsterIds: [m4.id],
      maxMonsters: 2,
    },
    {
      id: 'b_habitat_nature',
      type: 'habitat',
      name: 'Nature Habitat',
      nameAr: 'موطن الغابات الخضراء',
      element: 'nature',
      level: 2,
      maxLevel: 5,
      x: 32,
      y: 32,
      goldAccumulated: 250,
      maxGoldCapacity: 600,
      monsterIds: [m5.id],
      maxMonsters: 2,
    },
    {
      id: 'b_habitat_thunder',
      type: 'habitat',
      name: 'Thunder Habitat',
      nameAr: 'موطن الصواعق الكهرومغناطيسية',
      element: 'thunder',
      level: 2,
      maxLevel: 5,
      x: 68,
      y: 32,
      goldAccumulated: 290,
      maxGoldCapacity: 600,
      monsterIds: [m6.id],
      maxMonsters: 2,
    },
    {
      id: 'b_breeding',
      type: 'breeding',
      name: 'Breeding Mountain',
      nameAr: 'جبل التزاوج الأسطوري',
      level: 2,
      maxLevel: 3,
      x: 50,
      y: 16,
      monsterIds: [],
    },
    {
      id: 'b_hatchery',
      type: 'hatchery',
      name: 'Monster Hatchery',
      nameAr: 'حاضنة وفقس البيوض',
      level: 2,
      maxLevel: 4,
      x: 80,
      y: 22,
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
      y: 22,
      monsterIds: [],
      currentCrop: 'توت أزرق سريع (Blue Berries)',
      foodAccumulated: 150,
      plantedAt: Date.now() - 30000,
      harvestReadyAt: Date.now() - 5000,
      growthDurationSeconds: 15,
      cropYield: 150,
    },
    {
      id: 'b_storage',
      type: 'storage',
      name: 'Resource Vault',
      nameAr: 'خزينة الذهب والموارد',
      level: 2,
      maxLevel: 5,
      x: 70,
      y: 75,
      monsterIds: [],
    },
  ];

  m1.habitatId = 'b_habitat_fire';
  m2.habitatId = 'b_habitat_earth';
  m3.habitatId = 'b_habitat_dark';
  m4.habitatId = 'b_habitat_water';
  m5.habitatId = 'b_habitat_nature';
  m6.habitatId = 'b_habitat_thunder';

  return {
    playerName: 'سيد الوحوش (Monster Master)',
    level: 12,
    xp: 640,
    maxXp: 1200,
    gold: 5850,
    food: 1850,
    gems: 50,
    buildings: defaultBuildings,
    monsters: [m1, m2, m3, m4, m5, m6],
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

/**
 * Validates and repairs state loaded from localStorage
 */
function sanitizeAndMigrateState(parsed: any): PlayerState {
  const initial = getInitialGameState();

  const playerName = typeof parsed.playerName === 'string' ? parsed.playerName : initial.playerName;
  const level = Number.isFinite(parsed.level) && parsed.level > 0 ? parsed.level : initial.level;
  const xp = Number.isFinite(parsed.xp) && parsed.xp >= 0 ? parsed.xp : initial.xp;
  const maxXp = Number.isFinite(parsed.maxXp) && parsed.maxXp > 0 ? parsed.maxXp : initial.maxXp;
  const gold = Number.isFinite(parsed.gold) && parsed.gold >= 0 ? parsed.gold : initial.gold;
  const food = Number.isFinite(parsed.food) && parsed.food >= 0 ? parsed.food : initial.food;
  const gems = Number.isFinite(parsed.gems) && parsed.gems >= 0 ? parsed.gems : initial.gems;
  const completedStages = Number.isFinite(parsed.completedStages) ? parsed.completedStages : 1;

  // Validate monsters array
  const monsters: Monster[] = Array.isArray(parsed.monsters) && parsed.monsters.length > 0
    ? parsed.monsters.map((m: any, idx: number) => {
        const baseLevel = Number.isFinite(m.level) && m.level > 0 ? m.level : 1;
        const stars = Number.isFinite(m.stars) && m.stars >= 1 ? m.stars : 1;
        let stage = m.stage;
        if (!['baby', 'juvenile', 'adult', 'ascended'].includes(stage)) {
          if (baseLevel >= 35) stage = 'ascended';
          else if (baseLevel >= 20) stage = 'adult';
          else if (baseLevel >= 10) stage = 'juvenile';
          else stage = 'baby';
        }

        // Check if monster reached level cap for its current stage
        let isLevelLocked = false;
        let lockedReasonAr: string | undefined = undefined;
        let canEvolve = false;

        if (stage === 'baby' && baseLevel >= 10) {
          isLevelLocked = true;
          canEvolve = true;
          lockedReasonAr = 'بلغ الحد الأقصى لطور الصغير (المستوى 10). يتطلب الارتقاء إلى يافع.';
        } else if (stage === 'juvenile' && baseLevel >= 20) {
          isLevelLocked = true;
          canEvolve = true;
          lockedReasonAr = 'بلغ الحد الأقصى لطور اليافع (المستوى 20). يتطلب الارتقاء إلى عملاق ناضج.';
        } else if (stage === 'adult' && baseLevel >= 35) {
          isLevelLocked = true;
          canEvolve = true;
          lockedReasonAr = 'بلغ الحد الأقصى لطور العملاق (المستوى 35). يتطلب التحول المتسامي.';
        }

        return {
          id: m.id || `m_repaired_${idx}`,
          speciesId: m.speciesId || 'pyrodrake',
          name: m.name || 'Monster',
          nameAr: m.nameAr || 'وحش',
          element: m.element || 'fire',
          secondaryElement: m.secondaryElement,
          level: baseLevel,
          xp: Number.isFinite(m.xp) ? m.xp : 0,
          maxXp: Number.isFinite(m.maxXp) ? m.maxXp : baseLevel * 100,
          stage,
          stars,
          maxHp: Number.isFinite(m.maxHp) && m.maxHp > 0 ? m.maxHp : 600,
          currentHp: Number.isFinite(m.currentHp) && m.currentHp > 0 ? m.currentHp : (m.maxHp || 600),
          attack: Number.isFinite(m.attack) ? m.attack : 100,
          defense: Number.isFinite(m.defense) ? m.defense : 80,
          speed: Number.isFinite(m.speed) ? m.speed : 90,
          stamina: Number.isFinite(m.stamina) ? m.stamina : 100,
          maxStamina: Number.isFinite(m.maxStamina) ? m.maxStamina : 100,
          avatar: (SPECIES_CATALOG[m.speciesId]?.avatar) || m.avatar || '/src/assets/images/monster_fire_pyrodrake_1794261178897.jpg',
          habitatId: m.habitatId,
          skills: Array.isArray(m.skills) ? m.skills : [],
          goldPerHour: Number.isFinite(m.goldPerHour) ? m.goldPerHour : 100,
          canEvolve: m.canEvolve ?? canEvolve,
          isLevelLocked,
          lockedReasonAr,
        };
      })
    : initial.monsters;

  // Validate buildings array
  const buildings: IslandBuilding[] = Array.isArray(parsed.buildings) && parsed.buildings.length > 0
    ? parsed.buildings.map((b: any, idx: number) => {
        const initB = initial.buildings.find((def) => def.id === b.id) || initial.buildings[idx % initial.buildings.length];
        return {
          id: b.id || initB.id,
          type: b.type || initB.type,
          name: b.name || initB.name,
          nameAr: b.nameAr || initB.nameAr,
          element: b.element || initB.element,
          level: Number.isFinite(b.level) && b.level >= 1 ? Math.min(b.level, initB.maxLevel) : 1,
          maxLevel: initB.maxLevel || 5,
          x: Number.isFinite(b.x) ? b.x : initB.x,
          y: Number.isFinite(b.y) ? b.y : initB.y,
          goldAccumulated: Number.isFinite(b.goldAccumulated) ? b.goldAccumulated : 0,
          maxGoldCapacity: Number.isFinite(b.maxGoldCapacity) ? b.maxGoldCapacity : (initB.maxGoldCapacity || 600),
          foodAccumulated: Number.isFinite(b.foodAccumulated) ? b.foodAccumulated : 0,
          monsterIds: Array.isArray(b.monsterIds) ? b.monsterIds : [],
          maxMonsters: Number.isFinite(b.maxMonsters) ? b.maxMonsters : (initB.maxMonsters || 2),
          currentCrop: b.currentCrop,
          harvestReadyAt: b.harvestReadyAt,
          plantedAt: b.plantedAt,
          growthDurationSeconds: b.growthDurationSeconds,
          cropYield: b.cropYield,
        };
      })
    : initial.buildings;

  const eggsInHatchery = Array.isArray(parsed.eggsInHatchery) ? parsed.eggsInHatchery : [];

  return {
    playerName,
    level,
    xp,
    maxXp,
    gold,
    food,
    gems,
    buildings,
    monsters,
    eggsInHatchery,
    completedStages,
  };
}

export function loadSavedGameState(): PlayerState {
  if (typeof window === 'undefined') return getInitialGameState();
  try {
    // 1. Check current version
    let raw = localStorage.getItem(STORAGE_KEY);

    // 2. Fallback to legacy v1 if v2 not yet saved
    if (!raw) {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    }

    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const sanitized = sanitizeAndMigrateState(parsed);
        // Persist migrated format immediately
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
        return sanitized;
      }
    }
  } catch (err) {
    console.error('Error reading localStorage save, restoring safely:', err);
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

export function resetGameState(): PlayerState {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  }
  return getInitialGameState();
}
