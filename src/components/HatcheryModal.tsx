import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MonsterEgg, PlayerState } from '../types/game';
import { createMonsterInstance, SPECIES_CATALOG } from '../data/monstersData';
import { sound } from '../services/soundEffects';
import { Egg, Sparkles, X, Check, ArrowRight } from 'lucide-react';

interface HatcheryModalProps {
  playerState: PlayerState;
  onClose: () => void;
  onMonsterHatched: (updatedState: PlayerState) => void;
}

export const HatcheryModal: React.FC<HatcheryModalProps> = ({
  playerState,
  onClose,
  onMonsterHatched,
}) => {
  const [crackingEggId, setCrackingEggId] = useState<string | null>(null);
  const [hatchedMonster, setHatchedMonster] = useState<any | null>(null);

  const hatchEgg = (egg: MonsterEgg) => {
    setCrackingEggId(egg.id);
    sound.playHit();

    setTimeout(() => {
      sound.playVictory();
      const newMonster = createMonsterInstance(egg.speciesId, 1); // Baby monster level 1!

      // Find suitable habitat
      const suitableHabitat = playerState.buildings.find(
        (b) =>
          b.type === 'habitat' &&
          (b.element === newMonster.element || !b.element) &&
          b.monsterIds.length < (b.maxMonsters || 2)
      );

      if (suitableHabitat) {
        newMonster.habitatId = suitableHabitat.id;
        suitableHabitat.monsterIds.push(newMonster.id);
      }

      const updatedState: PlayerState = {
        ...playerState,
        eggsInHatchery: playerState.eggsInHatchery.filter((e) => e.id !== egg.id),
        monsters: [...playerState.monsters, newMonster],
        xp: playerState.xp + 150,
      };

      setCrackingEggId(null);
      setHatchedMonster(newMonster);
      onMonsterHatched(updatedState);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-6"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Egg className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-extrabold text-white">حاضنة وتفريخ البيض (Hatchery)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hatched Monster Celebration Screen */}
        {hatchedMonster ? (
          <div className="flex flex-col items-center gap-4 text-center py-4">
            <motion.div
              initial={{ scale: 0.4, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              className="relative w-40 h-40 rounded-3xl overflow-hidden border-4 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.6)]"
            >
              <img
                src={hatchedMonster.avatar}
                alt={hatchedMonster.name}
                className="w-full h-full object-cover"
              />
            </motion.div>

            <div>
              <div className="text-xs font-bold text-amber-400 mb-1">فقست البيضة بنجاح!</div>
              <h4 className="text-2xl font-black text-white">{hatchedMonster.nameAr}</h4>
              <p className="text-xs text-slate-400 mt-1">
                وحش جديد انضم إلى جزيرتك بمستوى 1! تم إيداعه في موطنه المناسب.
              </p>
            </div>

            <button
              onClick={() => setHatchedMonster(null)}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black rounded-xl text-sm shadow-md"
            >
              رائع! تفقد الحاضنة مجدداً
            </button>
          </div>
        ) : (
          /* Nests Grid */
          <div className="flex flex-col gap-4">
            {playerState.eggsInHatchery.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-950/60 rounded-2xl border border-slate-800 flex flex-col items-center gap-2">
                <Egg className="w-10 h-10 text-slate-600" />
                <span className="text-sm font-bold">لا توجد بيوض في الحاضنة حالياً</span>
                <span className="text-xs text-slate-500">
                  توجه إلى جبل التزاوج (Breeding Mountain) لتهجين وحشين وإنتاج بيضة جديدة!
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {playerState.eggsInHatchery.map((egg) => {
                  const isCracking = crackingEggId === egg.id;

                  return (
                    <div
                      key={egg.id}
                      className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center gap-3 relative overflow-hidden"
                    >
                      <motion.div
                        animate={
                          isCracking
                            ? { rotate: [-10, 10, -10, 10, 0], scale: [1, 1.2, 1] }
                            : { y: [0, -5, 0] }
                        }
                        transition={{ repeat: isCracking ? 3 : Infinity, duration: 1.5 }}
                        className="w-20 h-24 rounded-[50%] bg-gradient-to-t from-amber-600 via-yellow-500 to-amber-300 border-2 border-yellow-200 shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center justify-center cursor-pointer"
                        onClick={() => hatchEgg(egg)}
                      >
                        <Sparkles className="w-8 h-8 text-white/80" />
                      </motion.div>

                      <div className="text-center">
                        <span className="text-xs font-bold text-white">{egg.nameAr}</span>
                        <div className="text-[10px] text-amber-400 mt-0.5">جاهزة للفقس فوراً!</div>
                      </div>

                      <button
                        onClick={() => hatchEgg(egg)}
                        disabled={isCracking}
                        className="w-full py-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95"
                      >
                        {isCracking ? 'جاري كسر القشرة...' : 'انقر لفقس البيضة'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
