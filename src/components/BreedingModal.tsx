import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Monster, MonsterEgg, PlayerState } from '../types/game';
import { sound } from '../services/soundEffects';
import { Heart, Sparkles, X, AlertCircle } from 'lucide-react';

interface BreedingModalProps {
  playerState: PlayerState;
  onClose: () => void;
  onCompleteBreeding: (newEgg: MonsterEgg, updatedState: PlayerState) => void;
}

export const BreedingModal: React.FC<BreedingModalProps> = ({
  playerState,
  onClose,
  onCompleteBreeding,
}) => {
  // Ensure default parent1 and parent2 are strictly distinct
  const [parent1, setParent1] = useState<Monster | null>(playerState.monsters[0] || null);
  const [parent2, setParent2] = useState<Monster | null>(
    playerState.monsters.length > 1 ? playerState.monsters[1] : null
  );
  const [activeSlot, setActiveSlot] = useState<1 | 2>(playerState.monsters.length > 1 ? 2 : 1);
  const [isBreeding, setIsBreeding] = useState<boolean>(false);

  const isSameParent = parent1 && parent2 && parent1.id === parent2.id;
  const canStartBreeding = parent1 && parent2 && !isSameParent && !isBreeding;

  const handleSelectMonster = (m: Monster) => {
    if (activeSlot === 1) {
      if (parent2 && parent2.id === m.id) {
        // Swap or prevent duplicate
        setParent2(null);
      }
      setParent1(m);
      setActiveSlot(2);
    } else {
      if (parent1 && parent1.id === m.id) {
        // Prevent picking identical monster for parent 2
        return;
      }
      setParent2(m);
    }
  };

  const startBreedingProcess = () => {
    if (!canStartBreeding || !parent1 || !parent2) return;

    setIsBreeding(true);
    sound.playCoin();

    // Hybrid genetics: check element combinations for exciting new species
    const e1 = parent1.element;
    const e2 = parent2.element;
    const pair = [e1, e2].sort().join('+');

    let offspringSpecies = Math.random() > 0.5 ? parent1.speciesId : parent2.speciesId;
    let offspringElement = Math.random() > 0.5 ? parent1.element : parent2.element;

    if (pair === 'earth+water') {
      offspringSpecies = 'floragorgon';
      offspringElement = 'nature';
    } else if (pair === 'fire+thunder' || pair === 'dark+fire') {
      offspringSpecies = 'voltrion';
      offspringElement = 'thunder';
    } else if (pair === 'nature+water' || pair === 'earth+nature') {
      offspringSpecies = 'sylvanus';
      offspringElement = 'nature';
    } else if (pair === 'dark+thunder' || pair === 'thunder+water') {
      offspringSpecies = 'stormclaw';
      offspringElement = 'thunder';
    }

    const egg: MonsterEgg = {
      id: `egg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      speciesId: offspringSpecies,
      nameAr: `بيضة هجينة (${parent1.nameAr.split(' ')[0]} + ${parent2.nameAr.split(' ')[0]})`,
      element: offspringElement,
      hatchTimeMs: 15000,
      startedAt: Date.now(),
      readyAt: Date.now() + 15000,
      isReady: false,
    };

    setTimeout(() => {
      const updated: PlayerState = {
        ...playerState,
        eggsInHatchery: [...playerState.eggsInHatchery, egg],
        xp: playerState.xp + 100,
      };
      setIsBreeding(false);
      onCompleteBreeding(egg, updated);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-5"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-400 fill-pink-400/20" />
            <h3 className="text-xl font-extrabold text-white">جبل التزاوج والتهجين الأسطوري</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Breeding Podium Showcase */}
        <div className="flex items-center justify-around bg-slate-950/80 p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          {/* Parent 1 */}
          <div
            onClick={() => setActiveSlot(1)}
            className={`flex flex-col items-center gap-2 cursor-pointer transition-transform ${
              activeSlot === 1 ? 'scale-105' : 'opacity-90'
            }`}
          >
            <div
              className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 transition-all shadow-lg ${
                activeSlot === 1
                  ? 'border-pink-400 ring-4 ring-pink-500/40'
                  : 'border-slate-700'
              }`}
            >
              {parent1 ? (
                <img
                  src={parent1.avatar}
                  alt={parent1.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-xs text-slate-500">
                  اختر الوالد 1
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-200">
                {parent1 ? parent1.nameAr.split(' ')[0] : 'اختر الوالد 1'}
              </span>
              {activeSlot === 1 && (
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
              )}
            </div>
          </div>

          {/* Heart Fusion Icon */}
          <div className="flex flex-col items-center">
            <motion.div
              animate={isBreeding ? { scale: [1, 1.4, 1], rotate: [0, 15, -15, 0] } : {}}
              transition={{ repeat: Infinity, duration: 0.6 }}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-pink-400 shadow-[0_0_20px_rgba(244,114,182,0.5)]"
            >
              <Heart className="w-6 h-6 fill-current" />
            </motion.div>
            <span className="text-[10px] text-pink-300 font-bold mt-1">
              {isBreeding ? 'جاري التهجين...' : 'دمج الجينات'}
            </span>
          </div>

          {/* Parent 2 */}
          <div
            onClick={() => setActiveSlot(2)}
            className={`flex flex-col items-center gap-2 cursor-pointer transition-transform ${
              activeSlot === 2 ? 'scale-105' : 'opacity-90'
            }`}
          >
            <div
              className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 transition-all shadow-lg ${
                activeSlot === 2
                  ? 'border-pink-400 ring-4 ring-pink-500/40'
                  : 'border-slate-700'
              }`}
            >
              {parent2 ? (
                <img
                  src={parent2.avatar}
                  alt={parent2.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-xs text-slate-500">
                  اختر الوالد 2
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-200">
                {parent2 ? parent2.nameAr.split(' ')[0] : 'اختر الوالد 2'}
              </span>
              {activeSlot === 2 && (
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
              )}
            </div>
          </div>
        </div>

        {/* Validation Warning if player only has 1 monster or selects the same */}
        {isSameParent && (
          <div className="flex items-center gap-2 p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>لا يمكن تهجين الوحش مع نفسه! يرجى اختيار وحشين مختلفين لإتمام التزاوج.</span>
          </div>
        )}

        {playerState.monsters.length < 2 && (
          <div className="flex items-center gap-2 p-3 bg-amber-950/80 border border-amber-800 rounded-xl text-xs text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>تحتاج على الأقل إلى وحشين في جزيرتك لفتح عملية التزاوج والتهجين.</span>
          </div>
        )}

        {/* Monster Selector Pickers */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>اختر وحشاً لتعبئة {activeSlot === 1 ? 'الوالد الأول (Parent 1)' : 'الوالد الثاني (Parent 2)'}:</span>
            <span className="text-pink-400">انقر على الخانة لتغيير التحديد</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1">
            {playerState.monsters.map((m) => {
              const isP1 = parent1?.id === m.id;
              const isP2 = parent2?.id === m.id;
              const isCurrentSlotSelected = (activeSlot === 1 && isP1) || (activeSlot === 2 && isP2);
              const isDisabledForSecondSlot = activeSlot === 2 && isP1;

              return (
                <button
                  key={m.id}
                  disabled={isDisabledForSecondSlot}
                  onClick={() => handleSelectMonster(m)}
                  className={`p-2 rounded-xl border flex items-center gap-2 text-right transition-all ${
                    isCurrentSlotSelected
                      ? 'bg-pink-500/25 border-pink-400 ring-2 ring-pink-500 shadow-md'
                      : isP1 || isP2
                      ? 'bg-slate-800/80 border-pink-500/40 text-slate-300'
                      : isDisabledForSecondSlot
                      ? 'bg-slate-950 opacity-40 cursor-not-allowed border-slate-850'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <img
                    src={m.avatar}
                    alt={m.name}
                    className="w-9 h-9 rounded-lg object-cover shrink-0"
                  />
                  <div className="truncate text-xs font-bold text-white flex flex-col">
                    <span>{m.nameAr.split(' ')[0]}</span>
                    <span className="text-[10px] text-amber-400">Lv.{m.level}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={startBreedingProcess}
          disabled={!canStartBreeding}
          className={`w-full py-3.5 rounded-xl font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition-transform ${
            canStartBreeding
              ? 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white active:scale-98 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {isBreeding
              ? 'جاري إنتاج البيضة...'
              : isSameParent
              ? 'اختر وحشين مختلفين للمتابعة'
              : !parent1 || !parent2
              ? 'يرجى اختيار الوالدين الأول والثاني'
              : 'بدء التزاوج وإنتاج بيضة جديدة'}
          </span>
        </button>
      </motion.div>
    </div>
  );
};
