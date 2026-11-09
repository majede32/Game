import { BattleStage, ElementType, EvolutionStage, Monster, MonsterSkill } from '../types/game';

// Elemental type advantages (Attacker -> Defender)
export const ELEMENT_ADVANTAGES: Record<ElementType, ElementType[]> = {
  fire: ['nature'],
  nature: ['earth'],
  earth: ['thunder'],
  thunder: ['water'],
  water: ['fire'],
  dark: ['nature', 'thunder'],
};

export const ELEMENT_DISADVANTAGES: Record<ElementType, ElementType[]> = {
  fire: ['water'],
  nature: ['fire'],
  earth: ['nature'],
  thunder: ['earth'],
  water: ['thunder'],
  dark: ['dark'],
};

export const ELEMENT_COLORS: Record<ElementType, { bg: string; text: string; border: string; glow: string; nameAr: string }> = {
  fire: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/40',
    glow: 'rgba(239, 68, 68, 0.6)',
    nameAr: 'ناري (Fire)',
  },
  earth: {
    bg: 'bg-amber-600/20',
    text: 'text-amber-400',
    border: 'border-amber-600/40',
    glow: 'rgba(217, 119, 6, 0.6)',
    nameAr: 'أرضي (Earth)',
  },
  water: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/40',
    glow: 'rgba(59, 130, 246, 0.6)',
    nameAr: 'مائي (Water)',
  },
  dark: {
    bg: 'bg-purple-600/20',
    text: 'text-purple-400',
    border: 'border-purple-600/40',
    glow: 'rgba(168, 85, 247, 0.6)',
    nameAr: 'ظلامي (Dark)',
  },
  nature: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/40',
    glow: 'rgba(16, 185, 129, 0.6)',
    nameAr: 'طبيعي (Nature)',
  },
  thunder: {
    bg: 'bg-yellow-400/20',
    text: 'text-yellow-300',
    border: 'border-yellow-400/40',
    glow: 'rgba(250, 204, 21, 0.6)',
    nameAr: 'كهربائي (Thunder)',
  },
};

export const SPECIES_CATALOG: Record<string, {
  speciesId: string;
  name: string;
  nameAr: string;
  element: ElementType;
  secondaryElement?: ElementType;
  baseHp: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  avatar: string;
  descriptionAr: string;
  goldRate: number;
  skills: MonsterSkill[];
}> = {
  pyrodrake: {
    speciesId: 'pyrodrake',
    name: 'Pyrodrake',
    nameAr: 'بايرودريك التنين الناري',
    element: 'fire',
    baseHp: 620,
    baseAttack: 110,
    baseDefense: 75,
    baseSpeed: 95,
    avatar: '/src/assets/images/monster_fire_pyrodrake_1794261178897.jpg',
    descriptionAr: 'تنين بركاني قديم يمتلك قوة إسقاط النيازك من الفضاء وصهر دروع الخصوم.',
    goldRate: 140,
    skills: [
      {
        id: 'pyro_meteor',
        name: 'Meteor Special Strike',
        nameAr: 'سقوط النيزك الخارق (Meteor)',
        element: 'fire',
        power: 165,
        staminaCost: 40,
        cooldown: 2,
        target: 'single_enemy',
        description: 'Summons a colossal cosmic blazing meteor that crashes into the target with immense burning damage.',
        descriptionAr: 'استدعاء نيزك ملتهب ضخم من الفضاء يسحق الخصم بضرر ناري كارثي وحرق مستمر.',
        effectType: 'burn',
        effectValue: 3,
        animationKey: 'attack_meteor_special',
      },
      {
        id: 'pyro_claws',
        name: 'Fire Claws',
        nameAr: 'مخالب اللهب (Fire Claws)',
        element: 'fire',
        power: 95,
        staminaCost: 20,
        cooldown: 0,
        target: 'single_enemy',
        description: 'Double slashing burning claw attack with high critical rate.',
        descriptionAr: 'ضربة تمزيق بمخالب مستعرة تسبب ضرراً ناري سريعاً.',
        effectType: 'damage',
        animationKey: 'attack_physical_claws_fire',
      },
      {
        id: 'pyro_roar',
        name: 'Dragon Roar',
        nameAr: 'زئير التنين الحارق',
        element: 'fire',
        power: 70,
        staminaCost: 25,
        cooldown: 1,
        target: 'all_enemies',
        description: 'Blasts all foes with a scorching wave.',
        descriptionAr: 'موجة حرارية تضرب جميع وحوش الخصم معاً.',
        effectType: 'damage',
        animationKey: 'attack_meteor_special',
      },
      {
        id: 'pyro_strike',
        name: 'Physical Strike',
        nameAr: 'ضربة جسدية سريعة',
        element: 'fire',
        power: 55,
        staminaCost: 0,
        cooldown: 0,
        target: 'single_enemy',
        description: 'Basic strike that restores 15 stamina.',
        descriptionAr: 'ضربة أساسية تستعيد 15 من طاقة الاستحمال.',
        effectType: 'damage',
        animationKey: 'attack_physical_strike',
      },
    ],
  },
  terrarok: {
    speciesId: 'terrarok',
    name: 'Terrarok',
    nameAr: 'تيراروك عملاق الأرض',
    element: 'earth',
    baseHp: 820,
    baseAttack: 85,
    baseDefense: 130,
    baseSpeed: 70,
    avatar: '/src/assets/images/monster_earth_golem_1794261177699.jpg',
    descriptionAr: 'عملاق صخري مدعم بالبلورات الزمردية، يتحكم بحركات الصفائح التكتونية والزلازل.',
    goldRate: 120,
    skills: [
      {
        id: 'terra_shatter',
        name: 'Earth Shatter',
        nameAr: 'انشقاق الأرض التكتوني (Earth Shatter)',
        element: 'earth',
        power: 140,
        staminaCost: 35,
        cooldown: 2,
        target: 'single_enemy',
        description: 'Shatters the bedrock beneath the opponent causing heavy concussive damage and stun.',
        descriptionAr: 'شق الأرض وبعثرة الصخور بعنف مع فرصة عالية لتجميد وشل حركة الخصم.',
        effectType: 'stun',
        effectValue: 1,
        animationKey: 'attack_earth_shatter',
      },
      {
        id: 'terra_boulder',
        name: 'Colossal Boulder',
        nameAr: 'قذيفة الجلمود الحجري',
        element: 'earth',
        power: 90,
        staminaCost: 20,
        cooldown: 0,
        target: 'single_enemy',
        description: 'Hurls an enormous boulder at high speed.',
        descriptionAr: 'رمي صخرة عملاقة تسحق دفاعات الخصم.',
        effectType: 'damage',
        animationKey: 'attack_earth_shatter',
      },
      {
        id: 'terra_shield',
        name: 'Granite Armor',
        nameAr: 'درع الغرانيت والبلور',
        element: 'earth',
        power: 0,
        staminaCost: 25,
        cooldown: 2,
        target: 'self',
        description: 'Hardens skin into diamond-hard granite, absorbing incoming damage.',
        descriptionAr: 'تصليد الجسد لامتصاص 50% من الضرر القادم لمدة دورتين.',
        effectType: 'shield',
        effectValue: 250,
        animationKey: 'attack_earth_shatter',
      },
      {
        id: 'terra_strike',
        name: 'Earth Punch',
        nameAr: 'لكمة الحجر',
        element: 'earth',
        power: 50,
        staminaCost: 0,
        cooldown: 0,
        target: 'single_enemy',
        description: 'Basic stone strike that recovers stamina.',
        descriptionAr: 'لكمة أرضية أساسية تسترجع طاقة الاستحمال.',
        effectType: 'damage',
        animationKey: 'attack_physical_strike',
      },
    ],
  },
  shadowfang: {
    speciesId: 'shadowfang',
    name: 'Shadowfang',
    nameAr: 'شادوفانغ شبح الظلال',
    element: 'dark',
    baseHp: 580,
    baseAttack: 125,
    baseDefense: 65,
    baseSpeed: 110,
    avatar: '/src/assets/images/monster_dark_vampire_1794261179486.jpg',
    descriptionAr: 'كائن أسطوري من أبعاد الظلام، يتغذى على حيوية الخصوم ويفتك بدفاعاتهم بأمواج الطاعون.',
    goldRate: 155,
    skills: [
      {
        id: 'dark_bloodplague',
        name: 'Dark Bloodplague',
        nameAr: 'طاعون الدم المظلم (Bloodplague)',
        element: 'dark',
        power: 135,
        staminaCost: 35,
        cooldown: 2,
        target: 'single_enemy',
        description: 'Infects the enemy with a necrotic curse, siphoning 50% of dealt damage as health.',
        descriptionAr: 'إصابة الخصم بلعنة دموية مظلمة مع امتصاص 50% من الضرر لترميم نقاط صحة شادوفانغ.',
        effectType: 'drain',
        effectValue: 50,
        animationKey: 'attack_dark_bloodplague',
      },
      {
        id: 'dark_claws',
        name: 'Shadow Rake',
        nameAr: 'مخالب الظل السامة',
        element: 'dark',
        power: 85,
        staminaCost: 15,
        cooldown: 0,
        target: 'single_enemy',
        description: 'Strikes through armor with dark venomous energy.',
        descriptionAr: 'هجوم سريع بمخالب الظلام يخترق جزءاً من الدفاع.',
        effectType: 'damage',
        animationKey: 'attack_dark_bloodplague',
      },
      {
        id: 'dark_veil',
        name: 'Void Curse',
        nameAr: 'لعنة الفراغ الأسود',
        element: 'dark',
        power: 65,
        staminaCost: 25,
        cooldown: 1,
        target: 'all_enemies',
        description: 'Afflicts all enemies with debilitating dark miasma.',
        descriptionAr: 'نشر ضباب مظلم يضعف هجوم كافة الأعداء.',
        effectType: 'burn',
        effectValue: 2,
        animationKey: 'attack_dark_bloodplague',
      },
      {
        id: 'dark_strike',
        name: 'Soul Poke',
        nameAr: 'وخزة الروح الأساسية',
        element: 'dark',
        power: 50,
        staminaCost: 0,
        cooldown: 0,
        target: 'single_enemy',
        description: 'Basic strike recovering stamina.',
        descriptionAr: 'ضربة أساسية تستعيد 15 نقطة استحمال.',
        effectType: 'damage',
        animationKey: 'attack_physical_strike',
      },
    ],
  },
  aquashark: {
    speciesId: 'aquashark',
    name: 'Aquashark',
    nameAr: 'أكواشارك التنين المائي',
    element: 'water',
    baseHp: 690,
    baseAttack: 95,
    baseDefense: 90,
    baseSpeed: 100,
    avatar: '/src/assets/images/monster_water_hydra_1794261178957.jpg',
    descriptionAr: 'تنين مائي بلوري يتحكم بأمواج المحيطات وطاقات الشفاء وتجميد الخصوم.',
    goldRate: 130,
    skills: [
      {
        id: 'aqua_surge',
        name: 'Tidal Deluge',
        nameAr: 'طوفان المد العاتي (Tidal Surge)',
        element: 'water',
        power: 120,
        staminaCost: 30,
        cooldown: 1,
        target: 'all_enemies',
        description: 'Sends a sweeping tidal wave hitting all opponents.',
        descriptionAr: 'موجة تسونامي عاتية تجتاح صفوف العدو بأكملها وتخفض سرعتهم.',
        effectType: 'damage',
        animationKey: 'attack_water_surge',
      },
      {
        id: 'aqua_heal',
        name: 'Oceanic Bloom',
        nameAr: 'بركة الشفاء المحيطية (Heal)',
        element: 'water',
        power: 0,
        staminaCost: 30,
        cooldown: 2,
        target: 'all_allies',
        description: 'Bathes allies in rejuvenating sacred water, restoring HP.',
        descriptionAr: 'علاج مائي مبارك يرمم 300 نقطة صحة لجميع وحوش فريقك.',
        effectType: 'heal',
        effectValue: 300,
        animationKey: 'attack_heal_bloom',
      },
      {
        id: 'aqua_bite',
        name: 'Frost Fang',
        nameAr: 'أنياب الصقيع المائي',
        element: 'water',
        power: 85,
        staminaCost: 15,
        cooldown: 0,
        target: 'single_enemy',
        description: 'Cold piercing water bite.',
        descriptionAr: 'عضة صقيعية قوية تسبب ضرراً مائياً مباشراً.',
        effectType: 'damage',
        animationKey: 'attack_water_surge',
      },
      {
        id: 'aqua_strike',
        name: 'Water Splash',
        nameAr: 'رشقة مائية سريعة',
        element: 'water',
        power: 45,
        staminaCost: 0,
        cooldown: 0,
        target: 'single_enemy',
        description: 'Restores stamina on hit.',
        descriptionAr: 'هجمة مائية أساسية تعيد شحن الاستحمال.',
        effectType: 'damage',
        animationKey: 'attack_physical_strike',
      },
    ],
  },
};

export interface EvolutionStageInfo {
  stage: EvolutionStage;
  titleAr: string;
  minLevel: number;
  badgeColor: string;
  glowColor: string;
  multiplier: number;
  descriptionAr: string;
}

export const EVOLUTION_STAGES_INFO: Record<EvolutionStage, EvolutionStageInfo> = {
  baby: {
    stage: 'baby',
    titleAr: 'طور الصغير (Baby)',
    minLevel: 1,
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    glowColor: 'rgba(52, 211, 153, 0.4)',
    multiplier: 1.0,
    descriptionAr: 'كائن وليد مليء بالطاقة والنشاط، يكتشف قدراته الأولية.',
  },
  juvenile: {
    stage: 'juvenile',
    titleAr: 'طور اليافع (Juvenile)',
    minLevel: 10,
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    glowColor: 'rgba(59, 130, 246, 0.5)',
    multiplier: 1.4,
    descriptionAr: 'اشتداد مخالب وقرون الوحش وفتح مهارات هجومية متقدمة (+40% قوة).',
  },
  adult: {
    stage: 'adult',
    titleAr: 'طور العملاق الناضج (Adult Titan)',
    minLevel: 20,
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    glowColor: 'rgba(245, 158, 11, 0.6)',
    multiplier: 2.0,
    descriptionAr: 'بلوغ القوة الكاملة واكتساب المهارة الخارقة (Ultimate Special) المدمرة.',
  },
  ascended: {
    stage: 'ascended',
    titleAr: 'طور التحول المتسامي الأسطوري (Mythic Ascended)',
    minLevel: 35,
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    glowColor: 'rgba(168, 85, 247, 0.8)',
    multiplier: 3.2,
    descriptionAr: 'تسامي أسطوري يمنح الوحش هالة ضوئية مضاعفة وأعلى قدرات تدميرية.',
  },
};

export function createMonsterInstance(speciesId: string, level: number = 10, stars: number = 1): Monster {
  const spec = SPECIES_CATALOG[speciesId] || SPECIES_CATALOG.pyrodrake;
  const hpMultiplier = 1 + (level - 1) * 0.14 + (stars - 1) * 0.15;
  const statMultiplier = 1 + (level - 1) * 0.12 + (stars - 1) * 0.15;

  let stage: EvolutionStage = 'baby';
  let canEvolve = false;
  let evolutionMilestone: 10 | 20 | 35 | undefined = undefined;

  if (level >= 35) {
    stage = 'ascended';
  } else if (level >= 20) {
    stage = 'adult';
    if (level === 20) {
      canEvolve = true;
      evolutionMilestone = 35;
    }
  } else if (level >= 10) {
    stage = 'juvenile';
    if (level === 10) {
      canEvolve = true;
      evolutionMilestone = 20;
    }
  } else {
    stage = 'baby';
    if (level === 9) {
      canEvolve = true;
      evolutionMilestone = 10;
    }
  }

  const maxHp = Math.round(spec.baseHp * hpMultiplier);
  const attack = Math.round(spec.baseAttack * statMultiplier);
  const defense = Math.round(spec.baseDefense * statMultiplier);
  const speed = Math.round(spec.baseSpeed * (1 + (level - 1) * 0.03 + (stars - 1) * 0.05));

  return {
    id: `m_${speciesId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    speciesId: spec.speciesId,
    name: spec.name,
    nameAr: spec.nameAr,
    element: spec.element,
    secondaryElement: spec.secondaryElement,
    level,
    xp: 0,
    maxXp: level * 100,
    stage,
    stars,
    canEvolve,
    evolutionMilestone,
    maxHp,
    currentHp: maxHp,
    attack,
    defense,
    speed,
    stamina: 100,
    maxStamina: 100,
    avatar: spec.avatar,
    skills: JSON.parse(JSON.stringify(spec.skills)),
    goldPerHour: Math.round(spec.goldRate * (1 + (level - 1) * 0.2 + (stars - 1) * 0.25)),
  };
}

export const CAMPAIGN_STAGES: BattleStage[] = [
  {
    id: 1,
    nameAr: 'المرحلة 1: جزيرة الرياح العاصفة',
    subtitle: 'Windy Peak Island',
    difficulty: 'سهل',
    recommendedLevel: 5,
    enemies: [
      { speciesId: 'aquashark', level: 5 },
      { speciesId: 'terrarok', level: 6 },
    ],
    rewards: {
      gold: 500,
      food: 300,
      xp: 250,
      gemChance: 0.3,
    },
  },
  {
    id: 2,
    nameAr: 'المرحلة 2: الفوهة البركانية الملتهبة',
    subtitle: 'Molten Crater Ambush',
    difficulty: 'متوسط',
    recommendedLevel: 10,
    enemies: [
      { speciesId: 'pyrodrake', level: 10 },
      { speciesId: 'terrarok', level: 11 },
      { speciesId: 'shadowfang', level: 10 },
    ],
    rewards: {
      gold: 1200,
      food: 800,
      xp: 600,
      gemChance: 0.5,
    },
  },
  {
    id: 3,
    nameAr: 'المرحلة 3: أطلال هاوية الظلال',
    subtitle: 'Abyssal Void Ruins',
    difficulty: 'صعب',
    recommendedLevel: 18,
    enemies: [
      { speciesId: 'shadowfang', level: 18 },
      { speciesId: 'pyrodrake', level: 19 },
      { speciesId: 'shadowfang', level: 18 },
    ],
    rewards: {
      gold: 2500,
      food: 1800,
      xp: 1400,
      gemChance: 0.8,
    },
  },
  {
    id: 4,
    nameAr: 'المرحلة 4: مدرج العمالقة السماوي (معركة الزعيم)',
    subtitle: 'Sky Colosseum Titans',
    difficulty: 'زعيم',
    recommendedLevel: 25,
    enemies: [
      { speciesId: 'terrarok', level: 25 },
      { speciesId: 'pyrodrake', level: 26 },
      { speciesId: 'aquashark', level: 25 },
    ],
    rewards: {
      gold: 5000,
      food: 4000,
      xp: 3000,
      gemChance: 1.0,
    },
  },
];
