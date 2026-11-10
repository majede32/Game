import { BattleStage, ElementType, EvolutionStage, Monster, MonsterRarity, MonsterRune, MonsterSkill, RuneType } from '../types/game';

// Elemental type advantages (Attacker -> Defender) based on Monster Legends 10-Element cycle
export const ELEMENT_ADVANTAGES: Record<ElementType, ElementType[]> = {
  fire: ['nature'],
  nature: ['magic'],
  magic: ['metal'],
  metal: ['light'],
  light: ['dark'],
  dark: ['earth'],
  earth: ['thunder'],
  thunder: ['water'],
  water: ['fire'],
  special: [],
};

export const ELEMENT_DISADVANTAGES: Record<ElementType, ElementType[]> = {
  fire: ['water'],
  nature: ['fire'],
  magic: ['nature'],
  metal: ['magic'],
  light: ['metal'],
  dark: ['light'],
  earth: ['dark'],
  thunder: ['earth'],
  water: ['thunder'],
  special: [],
};

export const ELEMENT_COLORS: Record<ElementType, { bg: string; text: string; border: string; glow: string; nameAr: string; icon: string }> = {
  fire: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/40',
    glow: 'rgba(239, 68, 68, 0.6)',
    nameAr: 'ناري (Fire)',
    icon: '🔥',
  },
  nature: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/40',
    glow: 'rgba(16, 185, 129, 0.6)',
    nameAr: 'طبيعي (Nature)',
    icon: '🌿',
  },
  earth: {
    bg: 'bg-amber-600/20',
    text: 'text-amber-400',
    border: 'border-amber-600/40',
    glow: 'rgba(217, 119, 6, 0.6)',
    nameAr: 'أرضي (Earth)',
    icon: '⛰️',
  },
  thunder: {
    bg: 'bg-yellow-400/20',
    text: 'text-yellow-300',
    border: 'border-yellow-400/40',
    glow: 'rgba(250, 204, 21, 0.6)',
    nameAr: 'كهربائي (Thunder)',
    icon: '⚡',
  },
  water: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/40',
    glow: 'rgba(59, 130, 246, 0.6)',
    nameAr: 'مائي (Water)',
    icon: '💧',
  },
  dark: {
    bg: 'bg-purple-600/20',
    text: 'text-purple-400',
    border: 'border-purple-600/40',
    glow: 'rgba(168, 85, 247, 0.6)',
    nameAr: 'ظلامي (Dark)',
    icon: '🌑',
  },
  magic: {
    bg: 'bg-fuchsia-500/20',
    text: 'text-fuchsia-400',
    border: 'border-fuchsia-500/40',
    glow: 'rgba(217, 70, 239, 0.6)',
    nameAr: 'سحري (Magic)',
    icon: '✨',
  },
  light: {
    bg: 'bg-amber-300/25',
    text: 'text-amber-200',
    border: 'border-amber-300/40',
    glow: 'rgba(252, 211, 77, 0.7)',
    nameAr: 'ضوئي (Light)',
    icon: '☀️',
  },
  metal: {
    bg: 'bg-slate-400/20',
    text: 'text-slate-300',
    border: 'border-slate-400/40',
    glow: 'rgba(148, 163, 184, 0.6)',
    nameAr: 'معدني (Metal)',
    icon: '🛡️',
  },
  special: {
    bg: 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20',
    text: 'text-cyan-300',
    border: 'border-cyan-400/40',
    glow: 'rgba(6, 182, 212, 0.7)',
    nameAr: 'خاص (Special)',
    icon: '👑',
  },
};

export interface SpeciesDef {
  speciesId: string;
  name: string;
  nameAr: string;
  element: ElementType;
  secondaryElement?: ElementType;
  role: 'Attacker' | 'Tank' | 'Support' | 'Control';
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Ancestor';
  baseHp: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  avatar: string;
  descriptionAr: string;
  goldRate: number;
  skills: MonsterSkill[];
}

export const SPECIES_CATALOG: Record<string, SpeciesDef> = {
  pyrodrake: {
    speciesId: 'pyrodrake',
    name: 'Pyrodrake',
    nameAr: 'بايرودريك التنين الناري',
    element: 'fire',
    role: 'Attacker',
    rarity: 'Epic',
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
    role: 'Tank',
    rarity: 'Epic',
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
    role: 'Attacker',
    rarity: 'Legendary',
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
    role: 'Support',
    rarity: 'Rare',
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
  floragorgon: {
    speciesId: 'floragorgon',
    name: 'Floragorgon',
    nameAr: 'فلوراروك ملك الطبيعة المعمر',
    element: 'nature',
    role: 'Control',
    rarity: 'Legendary',
    baseHp: 780,
    baseAttack: 92,
    baseDefense: 110,
    baseSpeed: 88,
    avatar: '/src/assets/images/monster_nature_floragorgon_1794265818987.jpg',
    descriptionAr: 'كائن أسطوري حارس للغابات القديمة، يمتلك طاقة تجديد حيوية وقدرة على تطويق الأعداء بالجذور الصلبة.',
    goldRate: 135,
    skills: [
      {
        id: 'flora_bloom',
        name: 'Bloom of Life',
        nameAr: 'إزهار الحياة المجدد (Bloom Heal)',
        element: 'nature',
        power: 120,
        staminaCost: 35,
        cooldown: 2,
        target: 'all_allies',
        description: 'Heals all allies by channelling ancient forest vitality.',
        descriptionAr: 'إطلاق موجة شفاء طبيعية تجدد نقاط صحة جميع وحوش الفريق.',
        effectType: 'heal',
        effectValue: 280,
        animationKey: 'attack_heal_bloom',
      },
      {
        id: 'flora_vines',
        name: 'Thorny Vine Lash',
        nameAr: 'سياط الكروم الشوكية',
        element: 'nature',
        power: 115,
        staminaCost: 25,
        cooldown: 1,
        target: 'single_enemy',
        description: 'Lashes the enemy with sharp barbed roots that cause bleeding damage.',
        descriptionAr: 'جلد الخصم بجذور شوكية حادة تسبب ضرراً طبيعياً مدمراً وتشل حركته.',
        effectType: 'damage',
        animationKey: 'attack_nature_vines',
      },
      {
        id: 'flora_spores',
        name: 'Toxic Spore Burst',
        nameAr: 'انفجار الأبواغ السامة',
        element: 'nature',
        power: 85,
        staminaCost: 20,
        cooldown: 1,
        target: 'all_enemies',
        description: 'Emits a cloud of paralyzing spores covering all foes.',
        descriptionAr: 'سحابة أبواغ حارقة تنتشر على كامل فريق الخصم وتلحق بهم ضرراً مستمراً.',
        effectType: 'burn',
        effectValue: 35,
        animationKey: 'attack_nature_vines',
      },
      {
        id: 'flora_strike',
        name: 'Leaf Blade',
        nameAr: 'شفرة الأوراق القاطعة',
        element: 'nature',
        power: 55,
        staminaCost: 0,
        cooldown: 0,
        target: 'single_enemy',
        description: 'Fast leaf strike restoring stamina.',
        descriptionAr: 'ضربة ورقية سريعة تعيد شحن 15 من طاقة الاستحمال.',
        effectType: 'damage',
        animationKey: 'attack_physical_strike',
      },
    ],
  },
  voltrion: {
    speciesId: 'voltrion',
    name: 'Voltrion',
    nameAr: 'فولتريون صقر الصواعق الأسطوري',
    element: 'thunder',
    role: 'Attacker',
    rarity: 'Legendary',
    baseHp: 590,
    baseAttack: 128,
    baseDefense: 72,
    baseSpeed: 118,
    avatar: '/src/assets/images/monster_thunder_voltrion_1794265831820.jpg',
    descriptionAr: 'طائر الرعد الكوني المحلق في سحب العواصف، يشحن هجماته بتيار كهربائي بمليارات الفولتات.',
    goldRate: 160,
    skills: [
      {
        id: 'volt_thunder',
        name: 'Judgement Lightning',
        nameAr: 'صاعقة الحكم السماوية (Thunder Strike)',
        element: 'thunder',
        power: 160,
        staminaCost: 40,
        cooldown: 2,
        target: 'single_enemy',
        description: 'Calls down a blinding thunderbolt that stuns and electrocutes the target.',
        descriptionAr: 'استدعاء صاعقة رعدية عمودية خارقة تسحق الخصم وتصيبه بالشلل التام.',
        effectType: 'stun',
        effectValue: 1,
        animationKey: 'attack_thunder_strike',
      },
      {
        id: 'volt_claws',
        name: 'Plasma Claws',
        nameAr: 'مخالب البلازما المشحونة',
        element: 'thunder',
        power: 100,
        staminaCost: 20,
        cooldown: 0,
        target: 'single_enemy',
        description: 'Strikes the target with high-voltage charged claws.',
        descriptionAr: 'هجوم بمخالب بلازمية عالية الجهد مع نسبة ضربة حرجة مرتفعة.',
        effectType: 'damage',
        animationKey: 'attack_thunder_strike',
      },
      {
        id: 'volt_chain',
        name: 'Chain Lightning Arc',
        nameAr: 'قوس البرق المتفرع',
        element: 'thunder',
        power: 80,
        staminaCost: 30,
        cooldown: 1,
        target: 'all_enemies',
        description: 'A storm spark bouncing between all opponents.',
        descriptionAr: 'شرارة كهرومغناطيسية تتنقل بين جميع وحوش الخصم وتحدث ضرراً جماعياً.',
        effectType: 'damage',
        animationKey: 'attack_thunder_strike',
      },
      {
        id: 'volt_strike',
        name: 'Spark Peck',
        nameAr: 'نقرة الشرارة السريعة',
        element: 'thunder',
        power: 50,
        staminaCost: 0,
        cooldown: 0,
        target: 'single_enemy',
        description: 'Quick electric jab restoring stamina.',
        descriptionAr: 'ضربة كهربائية خفيفة تشحن طاقة الاستحمال (+15).',
        effectType: 'damage',
        animationKey: 'attack_physical_strike',
      },
    ],
  },
  sylvanus: {
    speciesId: 'sylvanus',
    name: 'Sylvanus',
    nameAr: 'سيلفانوس حارس الغابة العتيق',
    element: 'nature',
    role: 'Tank',
    rarity: 'Epic',
    baseHp: 810,
    baseAttack: 88,
    baseDefense: 120,
    baseSpeed: 75,
    avatar: '/src/assets/images/monster_nature_sylvanus_1794331192752.jpg',
    descriptionAr: 'عملاق خشبي حارس الغابة العتيق مغطى بأوراق السنديان والرموز السحرية المتوهجة، يستمد صلابته من جذور الأرض.',
    goldRate: 130,
    skills: [
      {
        id: 'sylva_shield',
        name: 'Bark Armor Shield',
        nameAr: 'درع اللحاء الصخري',
        element: 'nature',
        power: 0,
        staminaCost: 25,
        cooldown: 2,
        target: 'self',
        description: 'Covers the monster in thick bark that absorbs enemy blows.',
        descriptionAr: 'تغليف الجسم بدروع لحائية سميكة تمتص ضربات الأعداء وتصد الضرر.',
        effectType: 'shield',
        effectValue: 300,
        animationKey: 'attack_heal_bloom',
      },
      {
        id: 'sylva_root',
        name: 'Ancient Root Crush',
        nameAr: 'سحق الجذور العتيقة',
        element: 'nature',
        power: 125,
        staminaCost: 30,
        cooldown: 1,
        target: 'single_enemy',
        description: 'Crushes the foe with massive underground timber.',
        descriptionAr: 'سحق الخصم بجذوع أشجار غابية هائلة تحدث ارتداداً عنيفاً.',
        effectType: 'damage',
        animationKey: 'attack_nature_vines',
      },
      {
        id: 'sylva_strike',
        name: 'Branch Strike',
        nameAr: 'ضربة الغصن السريعة',
        element: 'nature',
        power: 50,
        staminaCost: 0,
        cooldown: 0,
        target: 'single_enemy',
        description: 'Basic timber strike restoring stamina.',
        descriptionAr: 'ضربة غصنية أساسية تستعيد طاقة الاستحمال.',
        effectType: 'damage',
        animationKey: 'attack_physical_strike',
      },
      {
        id: 'sylva_spore',
        name: 'Moss Spore Cloud',
        nameAr: 'أبواغ الطحالب المخدرة',
        element: 'nature',
        power: 70,
        staminaCost: 20,
        cooldown: 1,
        target: 'all_enemies',
        description: 'Slows down and poisons all opponents.',
        descriptionAr: 'نشر غبار طحلبي يضعف هجمات الخصوم ويسبب تسميماً تدريجياً.',
        effectType: 'burn',
        effectValue: 30,
        animationKey: 'attack_nature_vines',
      },
    ],
  },
  stormclaw: {
    speciesId: 'stormclaw',
    name: 'Stormclaw',
    nameAr: 'ستورمكلو نمر العواصف الرعدية',
    element: 'thunder',
    role: 'Attacker',
    rarity: 'Rare',
    baseHp: 650,
    baseAttack: 118,
    baseDefense: 80,
    baseSpeed: 112,
    avatar: '/src/assets/images/monster_thunder_stormclaw_1794331208127.jpg',
    descriptionAr: 'نمر صواعق أزرق بأسنان سيفية تومض بالطاقة الكهربائية الفائقة ومخالب مكهربة تمزق أعتى الدروع.',
    goldRate: 150,
    skills: [
      {
        id: 'storm_voltage',
        name: 'Hyper Voltage Pounce',
        nameAr: 'وثبة الفولتية الفائقة',
        element: 'thunder',
        power: 140,
        staminaCost: 35,
        cooldown: 1,
        target: 'single_enemy',
        description: 'Leaps into the target with crackling electricity.',
        descriptionAr: 'وثبة نمر صاعقة تشحن الخصم بكهرباء متفجرة مع فرصة شلل عالية.',
        effectType: 'stun',
        effectValue: 1,
        animationKey: 'attack_thunder_strike',
      },
      {
        id: 'storm_plasma',
        name: 'Thunder Roar',
        nameAr: 'زئير الرعد الصاخب',
        element: 'thunder',
        power: 90,
        staminaCost: 25,
        cooldown: 1,
        target: 'all_enemies',
        description: 'Sonic thunder roar that stuns the arena.',
        descriptionAr: 'زئير رعدي مدوي يهز ساحة المعركة ويضرب جميع الخصوم.',
        effectType: 'damage',
        animationKey: 'attack_thunder_strike',
      },
      {
        id: 'storm_fang',
        name: 'Static Fang',
        nameAr: 'أنياب الشحنة الساكنة',
        element: 'thunder',
        power: 95,
        staminaCost: 15,
        cooldown: 0,
        target: 'single_enemy',
        description: 'Quick electric bite.',
        descriptionAr: 'عضة مشحونة سريعة بتكلفة استحمال ضئيلة.',
        effectType: 'damage',
        animationKey: 'attack_thunder_strike',
      },
      {
        id: 'storm_strike',
        name: 'Claw Slash',
        nameAr: 'مخلب الرعد السريع',
        element: 'thunder',
        power: 55,
        staminaCost: 0,
        cooldown: 0,
        target: 'single_enemy',
        description: 'Restores stamina on contact.',
        descriptionAr: 'ضربة سريعة تعيد شحن طاقة الاستحمال (+15).',
        effectType: 'damage',
        animationKey: 'attack_physical_strike',
      },
    ],
  },
  genie: {
    speciesId: 'genie',
    name: 'Genie',
    nameAr: 'جيني مارد السحر الأزرق',
    element: 'magic',
    role: 'Control',
    rarity: 'Epic',
    baseHp: 680,
    baseAttack: 114,
    baseDefense: 85,
    baseSpeed: 108,
    avatar: '/src/assets/images/monster_magic_genie_1794332869841.jpg',
    descriptionAr: 'مارد سحري أزرق محرر من القمقم الكوني، يتحكم بالطاقات البنفسجية ويشل قوى الخصوم بتعويذات التنويم والاستنزاف.',
    goldRate: 155,
    skills: [
      {
        id: 'genie_arcane_mirage',
        name: 'Arcane Mirage Stun',
        nameAr: 'سراب الأوهام السحرية (Stun)',
        element: 'magic',
        power: 135,
        staminaCost: 35,
        cooldown: 2,
        target: 'single_enemy',
        description: 'Wraps the target in illusions that disrupt their mind, stunning them for 1 turn.',
        descriptionAr: 'إحاطة الخصم بأوهام سحرية خارقة تسلب وعيه وتشل حركته لدورة كاملة.',
        effectType: 'stun',
        effectValue: 1,
        animationKey: 'attack_meteor_special',
      },
      {
        id: 'genie_mystic_wave',
        name: 'Mystic Surge',
        nameAr: 'موجة السحر الكوني',
        element: 'magic',
        power: 90,
        staminaCost: 25,
        cooldown: 1,
        target: 'all_enemies',
        description: 'Sends arcane ripples across the enemy team.',
        descriptionAr: 'إطلاق موجات سحرية بنفسجية تصيب جميع وحوش الخصم.',
        effectType: 'damage',
        animationKey: 'attack_dark_bloodplague',
      },
      {
        id: 'genie_wish_clarity',
        name: 'Wish of Clarity',
        nameAr: 'أمنية الصفاء الروحي',
        element: 'magic',
        power: 0,
        staminaCost: 10,
        cooldown: 2,
        target: 'all_allies',
        description: 'Restores stamina to all allies and cleanses negative effects.',
        descriptionAr: 'إعادة شحن طاقة الاستحمال لكافة الحلفاء وشفاء جزء من نقاط الصحة.',
        effectType: 'heal',
        effectValue: 220,
        animationKey: 'attack_heal_bloom',
      },
      {
        id: 'genie_strike',
        name: 'Magic Palm Strike',
        nameAr: 'صفعة المارد السريعة',
        element: 'magic',
        power: 55,
        staminaCost: 0,
        cooldown: 0,
        target: 'single_enemy',
        description: 'Basic strike restoring stamina.',
        descriptionAr: 'ضربة سحرية أساسية تستعيد 15 من طاقة الاستحمال.',
        effectType: 'damage',
        animationKey: 'attack_physical_strike',
      },
    ],
  },
  solaris: {
    speciesId: 'solaris',
    name: 'Solaris',
    nameAr: 'سولاريس طائر النور المقدس',
    element: 'light',
    role: 'Support',
    rarity: 'Legendary',
    baseHp: 750,
    baseAttack: 105,
    baseDefense: 98,
    baseSpeed: 114,
    avatar: '/src/assets/images/monster_light_solaris_1794332883802.jpg',
    descriptionAr: 'طائر الشمس الملائكي ذو الأجنحة القوس قزحية المضيئة، ينشر أنوار الحياة ويبدد لعنات الظلام بسطوعه الطاهر.',
    goldRate: 170,
    skills: [
      {
        id: 'solaris_divine_blessing',
        name: 'Divine Solar Blessing',
        nameAr: 'البركة الشمسية الشاملة (Full Heal)',
        element: 'light',
        power: 0,
        staminaCost: 35,
        cooldown: 2,
        target: 'all_allies',
        description: 'Bathes the whole team in sacred solar radiance, restoring massive HP.',
        descriptionAr: 'إفاضة نور سماوي يعالج 350 نقطة صحة لجميع وحوش الفريق وينقي الساحات.',
        effectType: 'heal',
        effectValue: 350,
        animationKey: 'attack_heal_bloom',
      },
      {
        id: 'solaris_solar_beam',
        name: 'Celestial Solar Ray',
        nameAr: 'شعاع النور الحارق',
        element: 'light',
        power: 130,
        staminaCost: 30,
        cooldown: 1,
        target: 'single_enemy',
        description: 'Focuses a blinding pillar of light onto a single enemy.',
        descriptionAr: 'تركيز حزمة ضوئية محرقة تسحق الخصم وتخترق دفاعاته الطبيعية.',
        effectType: 'damage',
        animationKey: 'attack_meteor_special',
      },
      {
        id: 'solaris_light_shield',
        name: 'Aegis of Dawn',
        nameAr: 'حاجز فجر النور',
        element: 'light',
        power: 0,
        staminaCost: 20,
        cooldown: 2,
        target: 'self',
        description: 'Summons a protective halo that absorbs incoming strikes.',
        descriptionAr: 'تكوين هالة شمسية تمتص 280 نقطة ضرر.',
        effectType: 'shield',
        effectValue: 280,
        animationKey: 'attack_heal_bloom',
      },
      {
        id: 'solaris_strike',
        name: 'Sacred Feather',
        nameAr: 'ريشة النور السريعة',
        element: 'light',
        power: 52,
        staminaCost: 0,
        cooldown: 0,
        target: 'single_enemy',
        description: 'Restores stamina on contact.',
        descriptionAr: 'هجمة ضوئية سريعة تعيد شحن طاقة الاستحمال (+15).',
        effectType: 'damage',
        animationKey: 'attack_physical_strike',
      },
    ],
  },
  ironguard: {
    speciesId: 'ironguard',
    name: 'Iron Guard',
    nameAr: 'أيرون غارد الفارس الفولاذي',
    element: 'metal',
    role: 'Tank',
    rarity: 'Legendary',
    baseHp: 890,
    baseAttack: 100,
    baseDefense: 145,
    baseSpeed: 68,
    avatar: '/src/assets/images/monster_metal_ironguard_1794332898769.jpg',
    descriptionAr: 'عملاق فولاذي مدجج بدروع التيتانيوم والمطارق الميكانيكية، يمتلك أعلى قدرة تحمل وصلابة دفاعية في اللعبة.',
    goldRate: 165,
    skills: [
      {
        id: 'iron_fortress',
        name: 'Fortress Titanium Shield',
        nameAr: 'درع الحصن الفولاذي المتين',
        element: 'metal',
        power: 0,
        staminaCost: 30,
        cooldown: 2,
        target: 'self',
        description: 'Locks armor into an impenetrable fortress absorbing massive blows.',
        descriptionAr: 'تفعيل نظام الحصن الفولاذي لامتصاص 420 نقطة ضرر وتثبيت الخط الدفاعي.',
        effectType: 'shield',
        effectValue: 420,
        animationKey: 'attack_earth_shatter',
      },
      {
        id: 'iron_hammer',
        name: 'Hydraulic Titan Hammer',
        nameAr: 'مطرقة التيتان الهيدروليكية',
        element: 'metal',
        power: 145,
        staminaCost: 35,
        cooldown: 1,
        target: 'single_enemy',
        description: 'Slams a massive steel hammer onto the target, stunning them.',
        descriptionAr: 'سحق الخصم بمطرقة فولاذية ثقيلة تسبب ضرراً ميكانيكياً مدمراً وشللاً مؤقتاً.',
        effectType: 'stun',
        effectValue: 1,
        animationKey: 'attack_earth_shatter',
      },
      {
        id: 'iron_cleave',
        name: 'Steel Blade Spin',
        nameAr: 'دوامة الشفرات الفولاذية',
        element: 'metal',
        power: 85,
        staminaCost: 25,
        cooldown: 1,
        target: 'all_enemies',
        description: 'Spins blades striking the entire opposing squad.',
        descriptionAr: 'دوران سريع بشفرات الصلب يصيب كافة وحوش الفريق الخصم.',
        effectType: 'damage',
        animationKey: 'attack_physical_claws_fire',
      },
      {
        id: 'iron_strike',
        name: 'Iron Fist',
        nameAr: 'قبضة الفولاذ السريعة',
        element: 'metal',
        power: 58,
        staminaCost: 0,
        cooldown: 0,
        target: 'single_enemy',
        description: 'Restores stamina on impact.',
        descriptionAr: 'لكمة معدنية أساسية تستعيد 15 من طاقة الاستحمال.',
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
    role: spec.role,
    rarity: spec.rarity,
    level,
    rank: 0,
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
    runes: [],
    relics: [],
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
    nameAr: 'المرحلة 4: مدرج العمالقة السماوي',
    subtitle: 'Sky Colosseum Titans',
    difficulty: 'صعب',
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
  {
    id: 5,
    nameAr: 'المرحلة 5: أدغال الطبيعة الشوكية',
    subtitle: 'Verdant Briar Jungle',
    difficulty: 'صعب',
    recommendedLevel: 30,
    enemies: [
      { speciesId: 'floragorgon', level: 30 },
      { speciesId: 'sylvanus', level: 31 },
      { speciesId: 'aquashark', level: 30 },
    ],
    rewards: {
      gold: 7500,
      food: 6000,
      xp: 4500,
      gemChance: 1.0,
    },
  },
  {
    id: 6,
    nameAr: 'المرحلة 6: قمة العواصف الرعدية',
    subtitle: 'Thunderstorm Citadel Peak',
    difficulty: 'خبير',
    recommendedLevel: 36,
    enemies: [
      { speciesId: 'voltrion', level: 36 },
      { speciesId: 'stormclaw', level: 37 },
      { speciesId: 'pyrodrake', level: 36 },
    ],
    rewards: {
      gold: 11000,
      food: 9000,
      xp: 7000,
      gemChance: 1.0,
    },
  },
  {
    id: 7,
    nameAr: 'المرحلة 7: سراديب هاوية النسيان الأبدي',
    subtitle: 'Eternal Oblivion Crypts',
    difficulty: 'أسطوري',
    recommendedLevel: 42,
    enemies: [
      { speciesId: 'shadowfang', level: 42 },
      { speciesId: 'voltrion', level: 43 },
      { speciesId: 'floragorgon', level: 42 },
    ],
    rewards: {
      gold: 16000,
      food: 13000,
      xp: 10000,
      gemChance: 1.0,
    },
  },
  {
    id: 8,
    nameAr: 'المرحلة 8: عرش التيتان الأسطوري الأعظم (الزعيم النهائي)',
    subtitle: 'Grand Apex Titan Colosseum',
    difficulty: 'زعيم',
    recommendedLevel: 50,
    enemies: [
      { speciesId: 'pyrodrake', level: 50 },
      { speciesId: 'voltrion', level: 50 },
      { speciesId: 'floragorgon', level: 50 },
    ],
    rewards: {
      gold: 30000,
      food: 25000,
      xp: 20000,
      gemChance: 1.0,
    },
  },
];

export interface BattleArenaTheme {
  id: string;
  nameAr: string;
  nameEn: string;
  subtitleAr: string;
  element: ElementType | 'neutral';
  image: string;
  ambientParticle: 'ember' | 'spore' | 'spark' | 'bubble' | 'dust';
  overlayTint: string;
  accentColor: string;
}

export const REALISTIC_ARENAS: BattleArenaTheme[] = [
  {
    id: 'desert_canyon',
    nameAr: 'وادي الأخاديد الصخري (Grand Canyon)',
    nameEn: 'Canyon Plateau Arena',
    subtitleAr: 'حلبة وادي الأخاديد الأسطورية المشابهة لـ Monster Legends مع جبال حمراء وشمس دافئة',
    element: 'earth',
    image: '/src/assets/images/arena_desert_canyon_1794322246833.jpg',
    ambientParticle: 'dust',
    overlayTint: 'from-amber-950/20 via-transparent to-stone-950/60',
    accentColor: '#d97706',
  },
  {
    id: 'volcano',
    nameAr: 'فوهة البركان المتفجرة (Caldera)',
    nameEn: 'Molten Volcano Caldera',
    subtitleAr: 'حمم مستعرة وصخور بركانية سوداء مع لهب متطاير وأعمدة بازلتية',
    element: 'fire',
    image: '/src/assets/images/arena_volcano_caldera_1794265846405.jpg',
    ambientParticle: 'ember',
    overlayTint: 'from-red-950/30 via-transparent to-amber-950/60',
    accentColor: '#ef4444',
  },
  {
    id: 'forest',
    nameAr: 'غابة الأرواح المضيئة (Mystic Woods)',
    nameEn: 'Mystic Spirit Forest',
    subtitleAr: 'أشجار أسطورية عملاقة ونباتات مشعة وسحر الطبيعة الأخضر',
    element: 'nature',
    image: '/src/assets/images/arena_mystic_forest_1794265858366.jpg',
    ambientParticle: 'spore',
    overlayTint: 'from-emerald-950/30 via-transparent to-slate-950/60',
    accentColor: '#10b981',
  },
  {
    id: 'thunder',
    nameAr: 'قمة العواصف الرعدية (Storm Peak)',
    nameEn: 'Thunderstorm Mountain Peak',
    subtitleAr: 'سماء عاصفة وصواعق مدوية فوق قمم صخرية شاهقة',
    element: 'thunder',
    image: '/src/assets/images/arena_thunder_peak_1794265871061.jpg',
    ambientParticle: 'spark',
    overlayTint: 'from-blue-950/30 via-transparent to-yellow-950/30',
    accentColor: '#facc15',
  },
  {
    id: 'abyss',
    nameAr: 'معبد المحيط الغارق (Sunken Abyss)',
    nameEn: 'Abyssal Ocean Temple',
    subtitleAr: 'أعماق البحر الفيروزي وتماثيل غارقة وفقاعات متلألئة',
    element: 'water',
    image: '/src/assets/images/arena_abyssal_temple_1794265884907.jpg',
    ambientParticle: 'bubble',
    overlayTint: 'from-cyan-950/30 via-transparent to-blue-950/60',
    accentColor: '#06b6d4',
  },
  {
    id: 'colosseum',
    nameAr: 'كولوسيوم المصارعين الإمبراطوري',
    nameEn: 'Imperial Colosseum',
    subtitleAr: 'ميدان القتال الكلاسيكي التاريخي المحاط بالمشاعل والجمهور',
    element: 'neutral',
    image: '/src/assets/images/battle_arena_colosseum_1794261177610.jpg',
    ambientParticle: 'dust',
    overlayTint: 'from-slate-950/30 via-transparent to-slate-950/60',
    accentColor: '#f59e0b',
  },
];

// -------------------------------------------------------------
// RUNE SYSTEM (تعويذات الرونز)
// -------------------------------------------------------------
export interface RuneConfig {
  type: RuneType;
  nameAr: string;
  nameEn: string;
  colorBg: string;
  colorText: string;
  borderColor: string;
  icon: string;
  descriptionAr: string;
  getBonusPercent: (level: number) => number;
  getBonusFlat: (level: number) => number;
}

export const RUNE_CONFIGS: Record<RuneType, RuneConfig> = {
  life: {
    type: 'life',
    nameAr: 'رون الحياة (Life)',
    nameEn: 'Life Rune',
    colorBg: 'bg-emerald-500/20',
    colorText: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    icon: '💚',
    descriptionAr: 'يزيد الحد الأقصى لصحة الوحش بنسبة مئوية قوية.',
    getBonusPercent: (lvl) => 10 + lvl * 7, // Level 1: 17%, Level 5: 45%, Level 10: 80%
    getBonusFlat: () => 0,
  },
  strength: {
    type: 'strength',
    nameAr: 'رون القوة (Strength)',
    nameEn: 'Strength Rune',
    colorBg: 'bg-red-500/20',
    colorText: 'text-red-400',
    borderColor: 'border-red-500/40',
    icon: '⚔️',
    descriptionAr: 'يزيد قوة الهجوم وضرر كافة المهارات بنسبة مئوية هائلة.',
    getBonusPercent: (lvl) => 10 + lvl * 7,
    getBonusFlat: () => 0,
  },
  speed: {
    type: 'speed',
    nameAr: 'رون السرعة (Speed)',
    nameEn: 'Speed Rune',
    colorBg: 'bg-blue-500/20',
    colorText: 'text-blue-400',
    borderColor: 'border-blue-500/40',
    icon: '⚡',
    descriptionAr: 'يزيد سرعة الوحش بقيمة رقمية مباشرة لأسبقية الهجوم في المعركة.',
    getBonusPercent: () => 0,
    getBonusFlat: (lvl) => 4 + lvl * 4, // Level 1: +8, Level 5: +24, Level 10: +44
  },
  team_speed: {
    type: 'team_speed',
    nameAr: 'رون سرعة الفريق (Team Speed)',
    nameEn: 'Team Speed Rune',
    colorBg: 'bg-amber-500/20',
    colorText: 'text-amber-300',
    borderColor: 'border-amber-500/40',
    icon: '🏃',
    descriptionAr: 'يمنح سرعة إضافية لجميع حلفائك الثلاثة داخل المعركة.',
    getBonusPercent: () => 0,
    getBonusFlat: (lvl) => 2 + lvl * 2, // Level 1: +4 to team, Level 5: +12, Level 10: +22
  },
};

export function createRuneInstance(type: RuneType, level: number = 1): MonsterRune {
  const cfg = RUNE_CONFIGS[type];
  const bonusPercent = cfg.getBonusPercent(level);
  const bonusFlat = cfg.getBonusFlat(level);
  return {
    id: `rune_${type}_${level}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    type,
    level,
    bonusPercent: bonusPercent > 0 ? bonusPercent : undefined,
    bonusFlat: bonusFlat > 0 ? bonusFlat : undefined,
    nameAr: `${cfg.nameAr} المستوى ${toRomanNumeral(level)}`,
  };
}

export function toRomanNumeral(num: number): string {
  const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  return romans[num - 1] || `${num}`;
}

export function getStarterRunes(): MonsterRune[] {
  return [
    createRuneInstance('strength', 2),
    createRuneInstance('life', 2),
    createRuneInstance('speed', 2),
    createRuneInstance('team_speed', 1),
    createRuneInstance('strength', 1),
    createRuneInstance('life', 1),
  ];
}

// Calculates absolute stat boosts given an equipped monster's runes
export function calculateMonsterRuneBonuses(monster: Monster): {
  hpBonusPercent: number;
  attackBonusPercent: number;
  speedFlatBonus: number;
  teamSpeedFlatBonus: number;
} {
  let hpBonusPercent = 0;
  let attackBonusPercent = 0;
  let speedFlatBonus = 0;
  let teamSpeedFlatBonus = 0;

  if (Array.isArray(monster.runes)) {
    monster.runes.forEach((r) => {
      const cfg = RUNE_CONFIGS[r.type];
      if (cfg) {
        if (r.type === 'life') hpBonusPercent += cfg.getBonusPercent(r.level);
        if (r.type === 'strength') attackBonusPercent += cfg.getBonusPercent(r.level);
        if (r.type === 'speed') speedFlatBonus += cfg.getBonusFlat(r.level);
        if (r.type === 'team_speed') teamSpeedFlatBonus += cfg.getBonusFlat(r.level);
      }
    });
  }

  return { hpBonusPercent, attackBonusPercent, speedFlatBonus, teamSpeedFlatBonus };
}

// -------------------------------------------------------------
// MULTIPLAYER LEAGUES (دوري الكؤوس)
// -------------------------------------------------------------
export interface MultiplayerLeagueTier {
  id: 'Bronze' | 'Silver' | 'Gold' | 'Champion' | 'Legendary';
  nameAr: string;
  minTrophies: number;
  icon: string;
  badgeBg: string;
  chestRewards: { gold: number; food: number; gems: number; runeTier: number };
}

export const MULTIPLAYER_LEAGUES: MultiplayerLeagueTier[] = [
  {
    id: 'Bronze',
    nameAr: 'الدوري البرونزي (Bronze)',
    minTrophies: 0,
    icon: '🥉',
    badgeBg: 'from-amber-800 to-amber-950',
    chestRewards: { gold: 1500, food: 1000, gems: 5, runeTier: 1 },
  },
  {
    id: 'Silver',
    nameAr: 'الدوري الفضي (Silver)',
    minTrophies: 1200,
    icon: '🥈',
    badgeBg: 'from-slate-400 to-slate-700',
    chestRewards: { gold: 3500, food: 2500, gems: 10, runeTier: 2 },
  },
  {
    id: 'Gold',
    nameAr: 'الدوري الذهبي (Gold)',
    minTrophies: 2000,
    icon: '🥇',
    badgeBg: 'from-yellow-500 to-amber-700',
    chestRewards: { gold: 7500, food: 5000, gems: 20, runeTier: 3 },
  },
  {
    id: 'Champion',
    nameAr: 'دوري الأبطال (Champion)',
    minTrophies: 3000,
    icon: '🏆',
    badgeBg: 'from-cyan-500 to-blue-800',
    chestRewards: { gold: 15000, food: 10000, gems: 40, runeTier: 4 },
  },
  {
    id: 'Legendary',
    nameAr: 'الدوري الأسطوري (Legendary)',
    minTrophies: 4000,
    icon: '👑',
    badgeBg: 'from-purple-500 via-pink-600 to-amber-500',
    chestRewards: { gold: 30000, food: 20000, gems: 80, runeTier: 5 },
  },
];

export interface SimulatedOpponent {
  id: string;
  name: string;
  trophies: number;
  monsters: { speciesId: string; level: number }[];
  rewardTrophies: number;
}

export function generateMultiplayerOpponents(playerTrophies: number): SimulatedOpponent[] {
  const sampleNames = [
    'سيد التنانين (DragonLord)',
    'قاهر العواصف (StormBringer)',
    'فارس النور (SolarKnight)',
    'حارس الزمرد (EmeraldGaurd)',
    'أسطورة الظلال (ShadowMaster)',
    'صياد النيازك (MeteorHunter)',
  ];

  const speciesList = ['pyrodrake', 'terrarok', 'shadowfang', 'aquashark', 'floragorgon', 'voltrion', 'genie', 'solaris', 'ironguard'];

  const approxLevel = Math.max(10, Math.min(45, Math.floor(playerTrophies / 100)));

  return [
    {
      id: 'opp_1',
      name: sampleNames[0],
      trophies: Math.max(0, playerTrophies - 45),
      monsters: [
        { speciesId: speciesList[Math.floor(Math.random() * speciesList.length)], level: approxLevel - 1 },
        { speciesId: speciesList[Math.floor(Math.random() * speciesList.length)], level: approxLevel },
        { speciesId: speciesList[Math.floor(Math.random() * speciesList.length)], level: approxLevel - 1 },
      ],
      rewardTrophies: 28,
    },
    {
      id: 'opp_2',
      name: sampleNames[1],
      trophies: playerTrophies + 15,
      monsters: [
        { speciesId: speciesList[Math.floor(Math.random() * speciesList.length)], level: approxLevel },
        { speciesId: speciesList[Math.floor(Math.random() * speciesList.length)], level: approxLevel + 1 },
        { speciesId: speciesList[Math.floor(Math.random() * speciesList.length)], level: approxLevel },
      ],
      rewardTrophies: 32,
    },
    {
      id: 'opp_3',
      name: sampleNames[2],
      trophies: playerTrophies + 60,
      monsters: [
        { speciesId: speciesList[Math.floor(Math.random() * speciesList.length)], level: approxLevel + 2 },
        { speciesId: speciesList[Math.floor(Math.random() * speciesList.length)], level: approxLevel + 2 },
        { speciesId: speciesList[Math.floor(Math.random() * speciesList.length)], level: approxLevel + 3 },
      ],
      rewardTrophies: 38,
    },
  ];
}

// -------------------------------------------------------------
// FACTION COLOSSEUM (حلبات المصارعة حسب الندرة)
// -------------------------------------------------------------
export interface ColosseumTier {
  id: string;
  nameAr: string;
  subtitleAr: string;
  allowedRarities: MonsterRarity[];
  descriptionAr: string;
  icon: string;
  gradient: string;
  nodesCount: number;
  baseRewardGold: number;
}

export const FACTION_COLOSSEUMS: ColosseumTier[] = [
  {
    id: 'stone_colosseum',
    nameAr: 'كولوسيوم الحجر (Stone Colosseum)',
    subtitleAr: 'فئة الوحوش النادرة والممتازة (Rare / Epic)',
    allowedRarities: ['Common', 'Uncommon', 'Rare', 'Epic'],
    descriptionAr: 'حلبة مخصصة لاختبار المهارات التكتيكية بالوحوش المتوسطة مع استبعاد الأساطير.',
    icon: '🪨',
    gradient: 'from-stone-700 to-zinc-900',
    nodesCount: 5,
    baseRewardGold: 4000,
  },
  {
    id: 'bronze_colosseum',
    nameAr: 'كولوسيوم البرونز (Bronze Colosseum)',
    subtitleAr: 'حلبة الأساطير (Legendary Only)',
    allowedRarities: ['Legendary'],
    descriptionAr: 'معارك محتدمة لا يسمح فيها إلا بنخبة الوحوش الأسطورية الحاملة للتعويذات الفائقة.',
    icon: '🛡️',
    gradient: 'from-amber-700 to-orange-950',
    nodesCount: 5,
    baseRewardGold: 9000,
  },
  {
    id: 'iron_colosseum',
    nameAr: 'كولوسيوم التيتانيوم (Iron Colosseum)',
    subtitleAr: 'حلبة الكائنات المتسامية والخارقة (Mythic & Ascended)',
    allowedRarities: ['Mythic', 'Ancestor', 'Legendary'],
    descriptionAr: 'أقسى تحدي قتالي في عالم مونستر مع مكافآت ضخمة من الجواهر ورونز المستوى المتقدم.',
    icon: '⚔️',
    gradient: 'from-purple-900 to-slate-950',
    nodesCount: 5,
    baseRewardGold: 18000,
  },
];


