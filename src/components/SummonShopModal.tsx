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
  Flame,
  Shield,
  Zap,
  RotateCcw,
  Star,
  ShoppingBag,
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
  const [summonedMonster, setSummonedMonster] = useState<Monster | null>(null);

  // Available species list for summoning
  const allSpeciesKeys = Object.keys(SPECIES_CATALOG);

  // Perform Gold Summon
  const handleGoldSummon = () => {
    const cost = 4000;
    if (playerState.gold < cost) {
      alert(`لا يوجد لديك ذهب كافٍ! تحتاج إلى ${cost} ذهب.`);
      return;
    }

    sound.playCoin();
    setIsSummoning(true);

    // Pick random monster (more chance for standard monsters)
    const pool = ['pyrodrake', 'terrarok', 'aquashark', 'sylvanus', 'floragorgon'];
    const chosenSpecies = pool[Math.floor(Math.random() * pool.length)];
    const newMonster = createMonsterInstance(chosenSpecies, Math.floor(Math.random() * 3) + 5);

    setTimeout(() => {
      sound.playSummonFanfare();
      setIsSummoning(false);
      setSummonedMonster(newMonster);

      // Add monster to player collection
      const updatedState: PlayerState = {
        ...playerState,
        gold: playerState.gold - cost,
        monsters: [newMonster, ...playerState.monsters],
      };
      onUpdatePlayerState(updatedState);
    }, 1200);
  };

  // Perform Mythic Gem Summon
  const handleGemSummon = () => {
    const cost = 25;
    if (playerState.gems < cost) {
      alert(`لا يوجد لديك جواهر كافية! تحتاج إلى ${cost} جوهرة.`);
      return;
    }

    sound.playCoin();
    setIsSummoning(true);

    // Pick elite monster (Voltrion, Stormclaw, Shadowfang, Floragorgon)
    const pool = ['voltrion', 'stormclaw', 'shadowfang', 'floragorgon', 'pyrodrake'];
    const chosenSpecies = pool[Math.floor(Math.random() * pool.length)];
    const newMonster = createMonsterInstance(chosenSpecies, Math.floor(Math.random() * 4) + 12);
    // Grant higher stars for gem summon
    newMonster.stars = 3;

    setTimeout(() => {
      sound.playSummonFanfare();
      setIsSummoning(false);
      setSummonedMonster(newMonster);

      const updatedState: PlayerState = {
        ...playerState,
        gems: playerState.gems - cost,
        monsters: [newMonster, ...playerState.monsters],
      };
      onUpdatePlayerState(updatedState);
    }, 1400);
  };

  // Buy Food with Gold
  const buyFoodWithGold = () => {
    const goldCost = 2500;
    const foodGain = 1200;
    if (playerState.gold < goldCost) {
      alert(`لا يوجد لديك ذهب كافٍ! تحتاج إلى ${goldCost} ذهب.`);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-black text-white">بوابة استدعاء الوحوش والمتجر الأسطوري</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currency Bar */}
        <div className="flex items-center justify-center gap-4 bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800 text-xs font-black">
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
        {activeTab === 'summon' && !isSummoning && !summonedMonster && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Standard Gold Summon Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-amber-500/30 flex flex-col justify-between gap-4 shadow-lg hover:border-amber-400 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
                    استدعاء برونزي
                  </span>
                  <Coins className="w-5 h-5 text-amber-400" />
                </div>
                <h4 className="text-base font-black text-white">الاستدعاء الذهبي العادي</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  افتح بوابة العناصر باستعمال الذهب للحصول على وحش جديد ينضم لحظيرتك ومزرعتك.
                </p>
                <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>فرصة للحصول على وحوش الطبيعة والماء والنار والأرض</span>
                </div>
              </div>

              <button
                onClick={handleGoldSummon}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Coins className="w-4 h-4 fill-current" />
                <span>استدعاء مقابل 4,000 ذهب</span>
              </button>
            </div>

            {/* Mythic Gem Summon Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-cyan-950/40 via-purple-950/30 to-slate-950 border border-cyan-400/40 flex flex-col justify-between gap-4 shadow-xl hover:border-cyan-300 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40">
                    استدعاء أسطوري خارق
                  </span>
                  <Gem className="w-5 h-5 text-cyan-400" />
                </div>
                <h4 className="text-base font-black text-white">استدعاء الجواهر الأسطوري</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  استدعِ وحشاً أسطورياً من الطراز الرفيع ذو 3 نجوم وقوة هجومية ساحقة (فولتريون، ستورمكلو، فلوراروك...).
                </p>
                <div className="mt-3 flex items-center gap-1 text-[11px] text-cyan-200">
                  <Star className="w-3.5 h-3.5 text-yellow-300 fill-current" />
                  <span>مستوى متقدم (Lv.12+) وضمان ندرة فائقة</span>
                </div>
              </div>

              <button
                onClick={handleGemSummon}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-xs rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.6)] border border-cyan-300 transition-transform active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Gem className="w-4 h-4 fill-current" />
                <span>استدعاء مقابل 25 جوهرة</span>
              </button>
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
              البوابة تفتح أسرارها وتستدعي وحشاً أسطورياً...
            </p>
          </div>
        )}

        {/* SUMMONED MONSTER REVEAL MODAL */}
        {summonedMonster && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-5 rounded-3xl bg-slate-950 border-2 border-amber-400 shadow-2xl flex flex-col items-center text-center gap-3"
          >
            <span className="text-xs font-black text-amber-400 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40">
              ✨ تم استدعاء وحش جديد بنجاح! ✨
            </span>

            {/* Monster Artwork */}
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 my-1 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full blur-2xl opacity-40 bg-amber-500 animate-pulse" />
              <img
                src={summonedMonster.avatar}
                alt={summonedMonster.name}
                className="w-full h-full object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.85)]"
              />
            </div>

            <div>
              <h4 className="text-xl font-black text-white">{summonedMonster.nameAr}</h4>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-xs font-mono text-amber-400 font-bold">المستوى {summonedMonster.level}</span>
                <span>·</span>
                <span className="text-xs font-bold text-slate-300">
                  {summonedMonster.element === 'fire' && '🔥 ناري'}
                  {summonedMonster.element === 'water' && '💧 مائي'}
                  {summonedMonster.element === 'earth' && '⛰️ أرضي'}
                  {summonedMonster.element === 'nature' && '🌿 طبيعي'}
                  {summonedMonster.element === 'thunder' && '⚡ رعدي'}
                  {summonedMonster.element === 'dark' && '🌑 ظلامي'}
                </span>
              </div>
            </div>

            {/* Stats preview */}
            <div className="flex items-center justify-around w-full max-w-sm bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs font-bold">
              <span className="text-emerald-400">صحة: {summonedMonster.maxHp}</span>
              <span className="text-red-400">هجوم: {summonedMonster.attack}</span>
              <span className="text-blue-400">دفاع: {summonedMonster.defense}</span>
            </div>

            <button
              onClick={() => setSummonedMonster(null)}
              className="w-full max-w-sm py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-md mt-2"
            >
              إضافة الوحش للمجموعة ومتابعة اللعب
            </button>
          </motion.div>
        )}

        {/* TAB 2: RESOURCE SHOP */}
        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Buy Food Pack */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Wheat className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">حزمة ثمار التنين الغذائية</h4>
                  <span className="text-xs text-emerald-400 font-bold">+1,200 طعام لإطعام وحوشك</span>
                </div>
              </div>
              <button
                onClick={buyFoodWithGold}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-black text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>شراء مقابل 2,500 ذهب</span>
              </button>
            </div>

            {/* Buy Gold Pack */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">خزينة الذهب الملكية</h4>
                  <span className="text-xs text-amber-400 font-bold">+10,000 ذهب فوري</span>
                </div>
              </div>
              <button
                onClick={buyGoldWithGems}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-black text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Gem className="w-3.5 h-3.5" />
                <span>تحويل 15 جوهرة إلى ذهب</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
