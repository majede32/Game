import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Monster, MonsterEgg, PlayerState } from '../types/game';
import { sound } from '../services/soundEffects';
import { Heart, Sparkles, X, ArrowLeftRight, Check, Flame } from 'lucide-react';

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
  const [parent1, setParent1] = useState<Monster | null>(playerState.monsters[0] || null);
  const [parent2, setParent2] = useState<Monster | null>(
    playerState.monsters[1] || playerState.monsters[0] || null
  );
  const [isBreeding, setIsBreeding] = useState<boolean>(false);

  const startBreedingProcess = () => {
    if (!parent1 || !parent2) return;
    if (parent1.id === parent2.id && playerState.monsters.length > 1) {
      alert('يُفضل اختيار وحشين مختلفين للتهجين والتزاوج!');
    }

    setIsBreeding(true);
    sound.playCoin();

    // Determine offspring species based on parents
    let offspringSpecies = parent1.speciesId;
    if (Math.random() > 0.5) {
      offspringSpecies = parent2.speciesId;
    }

    const egg: MonsterEgg = {
      id: `egg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      speciesId: offspringSpecies,
      nameAr: `بيضة هجينة (${parent1.nameAr.split(' ')[0]} + ${parent2.nameAr.split(' ')[0]})`,
      element: parent1.element,
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
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-6"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
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
        <div className="flex items-center justify-around bg-slate-950/80 p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
          {/* Parent 1 */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-pink-500/50 shadow-lg">
              {parent1 ? (
                <img src={parent1.avatar} alt={parent1.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-xs text-slate-500">
                  اختر الوالد 1
                </div>
              )}
            </div>
            <span className="text-xs font-bold text-slate-200">
              {parent1 ? parent1.nameAr.split(' ')[0] : '---'}
            </span>
          </div>

          {/* Heart Fusion Icon */}
          <div className="flex flex-col items-center">
            <motion.div
              animate={isBreeding ? { scale: [1, 1.4, 1], rotate: [0, 15, -15, 0] } : {}}
              transition={{ repeat: Infinity, duration: 0.6 }}
              className="w-14 h-14 rounded-full bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-pink-400 shadow-[0_0_20px_rgba(244,114,182,0.5)]"
            >
              <Heart className="w-7 h-7 fill-current" />
            </motion.div>
            <span className="text-[10px] text-pink-300 font-bold mt-1">
              {isBreeding ? 'جاري التهجين...' : 'دمج الجينات'}
            </span>
          </div>

          {/* Parent 2 */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-pink-500/50 shadow-lg">
              {parent2 ? (
                <img src={parent2.avatar} alt={parent2.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-xs text-slate-500">
                  اختر الوالد 2
                </div>
              )}
            </div>
            <span className="text-xs font-bold text-slate-200">
              {parent2 ? parent2.nameAr.split(' ')[0] : '---'}
            </span>
          </div>
        </div>

        {/* Monster Selector Pickers */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-400">اختر الوحوش المراد تزويجها:</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto">
            {playerState.monsters.map((m) => {
              const isP1 = parent1?.id === m.id;
              const isP2 = parent2?.id === m.id;

              return (
                <button
                  key={m.id}
                  onClick={() => {
                    if (isP1) setParent1(null);
                    else if (!parent1) setParent1(m);
                    else if (!parent2 && !isP1) setParent2(m);
                    else setParent2(m);
                  }}
                  className={`p-2 rounded-xl border flex items-center gap-2 text-right transition-all ${
                    isP1 || isP2
                      ? 'bg-pink-500/20 border-pink-500 ring-1 ring-pink-500'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <img src={m.avatar} alt={m.name} className="w-9 h-9 rounded-lg object-cover" />
                  <div className="truncate text-xs font-bold text-white">
                    {m.nameAr.split(' ')[0]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={startBreedingProcess}
          disabled={!parent1 || !parent2 || isBreeding}
          className="w-full py-3.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-lg transition-transform active:scale-98 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isBreeding ? 'جاري إنتاج البيضة...' : 'بدء التزاوج وإنتاج بيضة جديدة'}</span>
        </button>
      </motion.div>
    </div>
  );
};
