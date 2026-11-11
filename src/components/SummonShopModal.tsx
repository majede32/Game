import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Monster, PlayerState } from '../types/game';
import { SPECIES_CATALOG, createMonsterInstance, ELEMENT_COLORS } from '../data/monstersData';
import { sound } from '../services/soundEffects';
import {
  Sparkles,
  Gem,
  Coins,
  Wheat,
  X,
  Check,
  Star,
  ShoppingBag,
  Info,
  Gift,
  Flame,
  Award,
} from 'lucide-react';

interface SummonShopModalProps {
  playerState: PlayerState;
  onUpdatePlayerState: (updated: PlayerState) => void;
  onClose: () => void;
}

export const SummonShopModal: React.FC<SummonShopModalProps> = ({
  playerState,
  onUpdatePlayerState,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'summon' | 'resources'>('summon');
  const [isSummoning, setIsSummoning] = useState<boolean>(false);
  const [summonedMonsters, setSummonedMonsters] = useState<Monster[]>([]);
  const [showRatesModal, setShowRatesModal] = useState<boolean>(false);

  // Pity counter tracked in localStorage or state
  const [gemPity, setGemPity] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('monsterr_gem_pity');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const savePity = (val: number) => {
    setGemPity(val);
    try {
      localStorage.setItem('monsterr_gem_pity', val.toString());
    } catch {}
  };

  // Helper for Rarity letter badge
  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'Mythic':
      case 'Ancestor':
        return { text: 'M', bg: 'from-purple-500 to-pink-500 text-white' };
      case 'Legendary':
        return { text: 'L', bg: 'from-amber-400 to-amber-600 text-slate-950' };
      case 'Epic':
        return { text: 'E', bg: 'from-purple-600 to-indigo-700 text-white' };
      case 'Rare':
        return { text: 'R', bg: 'from-blue-500 to-cyan-600 text-white' };
      case 'Uncommon':
        return { text: 'UC', bg: 'from-emerald-500 to-teal-700 text-white' };
      default:
        return { text: 'C', bg: 'from-amber-300 to-amber-500 text-slate-950' };
    }
  };

  // Common/Uncommon pool: pyrodrake, terrarok, aquashark, floragorgon
  // Rare/Epic pool: sylvanus, stormclaw, genie, shadowfang
  // Legendary/Mythic pool: voltrion, solaris, ironguard

  const drawOneMonster = (type: 'gold' | 'gem', isGuaranteedHigh: boolean = false): Monster => {
    const roll = Math.random() * 100;
    let speciesId = 'pyrodrake';
    let baseLevel = 5;

    if (type === 'gold') {
      if (roll < 60) {
        const pool = ['pyrodrake', 'terrarok', 'aquashark', 'floragorgon'];
        speciesId = pool[Math.floor(Math.random() * pool.length)];
        baseLevel = Math.floor(Math.random() * 3) + 4;
      } else if (roll < 90) {
        const pool = ['sylvanus', 'stormclaw', 'genie'];
        speciesId = pool[Math.floor(Math.random() * pool.length)];
        baseLevel = Math.floor(Math.random() * 3) + 6;
      } else {
        const pool = ['shadowfang', 'floragorgon'];
        speciesId = pool[Math.floor(Math.random() * pool.length)];
        baseLevel = 8;
      }
    } else {
      // Gem summon with pity
      if (isGuaranteedHigh || roll < 15) {
        // Legendary / Mythic
        const pool = ['voltrion', 'solaris', 'ironguard'];
        speciesId = pool[Math.floor(Math.random() * pool.length)];
        baseLevel = Math.floor(Math.random() * 4) + 14;
      } else if (roll < 50) {
        // Epic
        const pool = ['shadowfang', 'floragorgon', 'stormclaw'];
        speciesId = pool[Math.floor(Math.random() * pool.length)];
        baseLevel = Math.floor(Math.random() * 4) + 10;
      } else {
        // Rare
        const pool = ['genie', 'sylvanus', 'pyrodrake', 'aquashark'];
        speciesId = pool[Math.floor(Math.random() * pool.length)];
        baseLevel = Math.floor(Math.random() * 4) + 8;
      }
    }

    return createMonsterInstance(speciesId, baseLevel);
  };

  // Perform 1x Gold Summon
  const handleGoldSummon = (count: 1 | 10) => {
    const cost = count === 1 ? 4000 : 36000;
    if (playerState.gold < cost) {
      alert(`لا يوجد لديك ذهب كافٍ! تحتاج إلى ${cost.toLocaleString()} ذهب.`);
      return;
    }

    sound.playCoin();
    setIsSummoning(true);

    const results: Monster[] = [];
    for (let i = 0; i < count; i++) {
      results.push(drawOneMonster('gold'));
    }

    setTimeout(() => {
      sound.playSummonFanfare();
      setIsSummoning(false);
      setSummonedMonsters(results);

      const updatedState: PlayerState = {
        ...playerState,
        gold: playerState.gold - cost,
        monsters: [...results, ...playerState.monsters],
      };
      onUpdatePlayerState(updatedState);
    }, 1200);
  };

  // Perform Gem Summon (1x or 10x with Pity)
  const handleGemSummon = (count: 1 | 10) => {
    const cost = count === 1 ? 25 : 225;
    if (playerState.gems < cost) {
      alert(`لا يوجد لديك جواهر كافية! تحتاج إلى ${cost} جوهرة.`);
      return;
    }

    sound.playCoin();
    setIsSummoning(true);

    const results: Monster[] = [];
    let currentPity = gemPity;

    for (let i = 0; i < count; i++) {
      currentPity += 1;
      const hitPity = currentPity >= 10;
      const monster = drawOneMonster('gem', hitPity || (count === 10 && i === 9));
      if (monster.rarity === 'Legendary' || monster.rarity === 'Mythic' || hitPity) {
        currentPity = 0;
      }
      results.push(monster);
    }

    savePity(currentPity);

    setTimeout(() => {
      sound.playSummonFanfare();
      setIsSummoning(false);
      setSummonedMonsters(results);

      const updatedState: PlayerState = {
        ...playerState,
        gems: playerState.gems - cost,
        monsters: [...results, ...playerState.monsters],
      };
      onUpdatePlayerState(updatedState);
    }, 1400);
  };

  // Buy Food with Gold
  const buyFoodWithGold = () => {
    const goldCost = 2500;
    const foodGain = 1200;
    if (playerState.gold < goldCost) {
      alert(`لا يوجد لديك ذهب كافٍ! تحتاج إلى ${goldCost.toLocaleString()} ذهب.`);
      return;
    }
    sound.playCoin();
    onUpdatePlayerState({
      ...playerState,
      gold: playerState.gold - goldCost,
      food: playerState.food + foodGain,
    });
  };

  // Buy Gold with Gems
  const buyGoldWithGems = () => {
    const gemCost = 15;
    const goldGain = 10000;
    if (playerState.gems < gemCost) {
      alert(`لا يوجد لديك جواهر كافية! تحتاج إلى ${gemCost} جوهرة.`);
      return;
    }
    sound.playCoin();
    onUpdatePlayerState({
      ...playerState,
      gems: playerState.gems - gemCost,
      gold: playerState.gold + goldGain,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none" dir="rtl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-black text-white">بوابة استدعاء الوحوش والمتجر الأسطوري</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRatesModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 hover:text-amber-400 text-xs font-bold border border-slate-700"
              title="احتمالات ونسب الاستدعاء"
            >
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>نسب الندرة</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Currency & Pity Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800 text-xs font-black">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Coins className="w-4 h-4" />
              <span>{playerState.gold.toLocaleString()} ذهب</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Wheat className="w-4 h-4" />
              <span>{playerState.food.toLocaleString()} طعام</span>
            </div>
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Gem className="w-4 h-4" />
              <span>{playerState.gems} جوهرة</span>
            </div>
          </div>

          {/* Pity Counter */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-950/50 border border-purple-500/40 text-[11px] text-purple-300">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>عداد الحظ الأسطوري (Pity):</span>
            <span className="font-mono text-amber-400 font-bold">{gemPity}/10</span>
            <span className="text-[9px] text-slate-400 hidden sm:inline">(ضمان أسطوري عند 10)</span>
          </div>
        </div>

        {/* Tabs Switcher */}
        <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('summon')}
            className={`flex-1 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'summon'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>بوابة الاستدعاء (Summon Portal)</span>
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`flex-1 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'resources'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>متجر الموارد والحزم</span>
          </button>
        </div>

        {/* TAB 1: SUMMON PORTAL */}
        {activeTab === 'summon' && !isSummoning && summonedMonsters.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Standard Gold Summon Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-amber-500/30 flex flex-col justify-between gap-4 shadow-lg hover:border-amber-400 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
                    بوابة الذهب العادية
                  </span>
                  <Coins className="w-5 h-5 text-amber-400" />
                </div>
                <h4 className="text-base font-black text-white">الاستدعاء الذهبي</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  افتح بوابة العناصر بالذهب لضم وحوش جديدة لجزيرتك وحظيرتك.
                </p>
                <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>فرصة 10% لوحوش ملحمية (Epic)</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => handleGoldSummon(1)}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Coins className="w-4 h-4 fill-current" />
                  <span>استدعاء 1x (4,000 ذهب)</span>
                </button>
                <button
                  onClick={() => handleGoldSummon(10)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-amber-300 border border-amber-500/40 font-black text-xs rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>استدعاء 10x متعدد (36,000 ذهب · وفر 10%)</span>
                </button>
              </div>
            </div>

            {/* Mythic Gem Summon Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-cyan-950/40 via-purple-950/30 to-slate-950 border border-cyan-400/40 flex flex-col justify-between gap-4 shadow-xl hover:border-cyan-300 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40">
                    بوابة الجواهر الأسطورية
                  </span>
                  <Gem className="w-5 h-5 text-cyan-400" />
                </div>
                <h4 className="text-base font-black text-white">استدعاء الجواهر الأسطوري</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  استدعِ وحشاً أسطورياً فائق الندرة (فولتريون، سولاريس، آيرونجارد، شادوفانج).
                </p>
                <div className="mt-3 flex items-center gap-1 text-[11px] text-cyan-200">
                  <Star className="w-3.5 h-3.5 text-yellow-300 fill-current" />
                  <span>ضمان وحش أسطوري/ميثك كل 10 استدعاءات!</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => handleGemSummon(1)}
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-xs rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.6)] border border-cyan-300 transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Gem className="w-4 h-4 fill-current" />
                  <span>استدعاء 1x (25 جوهرة)</span>
                </button>
                <button
                  onClick={() => handleGemSummon(10)}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.6)] border border-purple-300 transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Award className="w-4 h-4 text-yellow-300" />
                  <span>استدعاء 10x ممتاز (225 جوهرة · ضمان Epic+)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUMMONING ANIMATION CHAMBER */}
        {isSummoning && (
          <div className="py-12 flex flex-col items-center justify-center gap-4">
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.25, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              className="w-32 h-32 rounded-full border-4 border-dashed border-amber-400 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.8)]"
            >
              <Sparkles className="w-14 h-14 text-yellow-300 animate-spin" />
            </motion.div>
            <p className="text-sm font-black text-amber-300 animate-pulse">
              البوابة تفتح أسرارها وتستدعي أرواح الوحوش الأسطورية...
            </p>
          </div>
        )}

        {/* SUMMONED MONSTERS REVEAL */}
        {summonedMonsters.length > 0 && !isSummoning && (
          <div className="p-4 rounded-3xl bg-slate-950 border-2 border-amber-400 shadow-2xl flex flex-col items-center text-center gap-4">
            <span className="text-xs font-black text-amber-400 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40">
              ✨ تم استدعاء ({summonedMonsters.length}) وحش بنجاح! ✨
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 w-full max-h-[50vh] overflow-y-auto p-1">
              {summonedMonsters.map((monster, idx) => {
                const badge = getRarityBadge(monster.rarity || 'Common');
                const elemColor = ELEMENT_COLORS[monster.element] || ELEMENT_COLORS.fire;

                return (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.08 }}
                    className="p-3 rounded-2xl bg-slate-900 border border-slate-750 flex flex-col items-center gap-2 relative shadow-lg"
                  >
                    <span
                      className={`absolute top-2 right-2 w-5 h-5 rounded-full bg-gradient-to-b ${badge.bg} text-[10px] font-black flex items-center justify-center shadow-md`}
                    >
                      {badge.text}
                    </span>

                    <div className="w-20 h-20 flex items-center justify-center my-1">
                      <img
                        src={monster.avatar}
                        alt={monster.name}
                        className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
                      />
                    </div>

                    <div className="w-full">
                      <h5 className="text-xs font-black text-white truncate">{monster.nameAr}</h5>
                      <div className="flex items-center justify-center gap-1.5 mt-1 text-[10px]">
                        <span className={`px-1 rounded font-bold ${elemColor.bg} ${elemColor.text}`}>
                          {elemColor.nameAr.split(' ')[0]}
                        </span>
                        <span className="text-amber-400 font-mono">Lv.{monster.level}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <button
              onClick={() => setSummonedMonsters([])}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-transform active:scale-95"
            >
              استلام الوحوش وإضافتها للحظيرة
            </button>
          </div>
        )}

        {/* TAB 2: RESOURCES SHOP */}
        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Wheat className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">حزمة طعام المزرعة</h4>
                  <span className="text-xs text-emerald-400 font-bold">+1,200 طعام</span>
                </div>
              </div>
              <button
                onClick={buyFoodWithGold}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-transform active:scale-95"
              >
                2,500 ذهب
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">صندوق الذهب الملكي</h4>
                  <span className="text-xs text-amber-400 font-bold">+10,000 ذهب</span>
                </div>
              </div>
              <button
                onClick={buyGoldWithGems}
                className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-transform active:scale-95"
              >
                15 جوهرة
              </button>
            </div>
          </div>
        )}

        {/* Rates Transparency Modal */}
        <AnimatePresence>
          {showRatesModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-md bg-slate-900 border-2 border-amber-500 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-right"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-sm font-black text-white">نسب واحتمالات الاستدعاء (Drop Rates)</h4>
                  <button
                    onClick={() => setShowRatesModal(false)}
                    className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="font-bold text-amber-400 block mb-1">بوابة الذهب (Gold Portal):</span>
                    <ul className="space-y-1 text-slate-300">
                      <li>• عادي / غير شائع (C/UC): 60%</li>
                      <li>• نادر (Rare): 30%</li>
                      <li>• ملحمي (Epic): 10%</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="font-bold text-cyan-300 block mb-1">بوابة الجواهر (Gem Portal):</span>
                    <ul className="space-y-1 text-slate-300">
                      <li>• نادر (Rare): 50%</li>
                      <li>• ملحمي (Epic): 35%</li>
                      <li>• أسطوري (Legendary): 12%</li>
                      <li>• خرافي / ميثك (Mythic): 3%</li>
                      <li className="text-amber-300 font-bold pt-1">
                        ✨ ضمان وحش أسطوري أو ميثك على الأقل عند الاستدعاء العاشر (Pity System)!
                      </li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => setShowRatesModal(false)}
                  className="w-full py-2 bg-amber-500 text-slate-950 font-black text-xs rounded-xl"
                >
                  إغلاق
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
