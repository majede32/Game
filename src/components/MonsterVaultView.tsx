import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EvolutionStage, Monster, PlayerState } from '../types/game';
import { ELEMENT_COLORS, EVOLUTION_STAGES_INFO, RUNE_CONFIGS } from '../data/monstersData';
import { sound } from '../services/soundEffects';
import { EvolutionModal } from './EvolutionModal';
import { RuneModal } from './RuneModal';
import {
  Sparkles,
  Heart,
  Zap,
  Shield,
  Swords,
  Gauge,
  Wheat,
  Star,
  Award,
  Flame,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

interface MonsterVaultViewProps {
  playerState: PlayerState;
  onUpdatePlayerState: (updated: PlayerState) => void;
  selectedMonsterId?: string;
}

export const MonsterVaultView: React.FC<MonsterVaultViewProps> = ({
  playerState,
  onUpdatePlayerState,
  selectedMonsterId,
}) => {
  const [activeMonsterId, setActiveMonsterId] = useState<string>(
    selectedMonsterId || playerState.monsters[0]?.id || ''
  );
  const [elementFilter, setElementFilter] = useState<string>('all');
  const [levelUpEffect, setLevelUpEffect] = useState<boolean>(false);
  const [evolvingMonster, setEvolvingMonster] = useState<Monster | null>(null);
  const [isRuneModalOpen, setIsRuneModalOpen] = useState<boolean>(false);

  const activeMonster =
    playerState.monsters.find((m) => m.id === activeMonsterId) || playerState.monsters[0];

  // Get max level permissible for the current evolution stage
  const getStageMaxLevel = (stage: EvolutionStage): number => {
    switch (stage) {
      case 'baby':
        return 10;
      case 'juvenile':
        return 20;
      case 'adult':
        return 35;
      case 'ascended':
        return 50;
      default:
        return 50;
    }
  };

  // Feed monster by amount of levels with strict stage capping
  const feedMonster = (monster: Monster, desiredLevels: number = 1) => {
    const stageMax = getStageMaxLevel(monster.stage);

    if (monster.level >= stageMax) {
      alert(
        `بلغ ${monster.nameAr} الحد الأقصى للمستوى في ${
          EVOLUTION_STAGES_INFO[monster.stage].titleAr
        } (المستوى ${stageMax})!\nيجب إجراء مراسم الارتقاء (Evolution) أولاً لفتح مستويات الطور التالي.`
      );
      setEvolvingMonster(monster);
      return;
    }

    // Clamp levels to not exceed the stage evolution cap
    const levelsToAdd = Math.min(desiredLevels, stageMax - monster.level);
    if (levelsToAdd <= 0) return;

    let totalFoodCost = 0;
    for (let i = 0; i < levelsToAdd; i++) {
      totalFoodCost += (monster.level + i) * 45;
    }

    if (playerState.food < totalFoodCost) {
      alert(`تحتاج إلى ${totalFoodCost} طعام لإطعام هذا الوحش! ازرع المحاصيل في المزرعة أولاً.`);
      return;
    }

    sound.playCoin();
    setLevelUpEffect(true);
    setTimeout(() => setLevelUpEffect(false), 900);

    const newLevel = monster.level + levelsToAdd;
    const isNowAtStageCap = newLevel >= stageMax;

    const updatedMonsters = playerState.monsters.map((m) => {
      if (m.id === monster.id) {
        return {
          ...m,
          level: newLevel,
          canEvolve: isNowAtStageCap || m.canEvolve,
          isLevelLocked: isNowAtStageCap,
          lockedReasonAr: isNowAtStageCap
            ? `بلغ المستوى ${stageMax}. الارتقاء مطلوب لمتابعة رفع المستوى.`
            : undefined,
          maxHp: Math.round(m.maxHp * (1 + 0.08 * levelsToAdd)),
          currentHp: Math.round(m.maxHp * (1 + 0.08 * levelsToAdd)),
          attack: Math.round(m.attack * (1 + 0.07 * levelsToAdd)),
          defense: Math.round(m.defense * (1 + 0.07 * levelsToAdd)),
          speed: Math.round(m.speed * (1 + 0.015 * levelsToAdd)),
          goldPerHour: Math.round(m.goldPerHour * (1 + 0.12 * levelsToAdd)),
        };
      }
      return m;
    });

    onUpdatePlayerState({
      ...playerState,
      food: playerState.food - totalFoodCost,
      xp: playerState.xp + 40 * levelsToAdd,
      monsters: updatedMonsters,
    });

    if (isNowAtStageCap) {
      setTimeout(() => {
        alert(
          `مبروك! بلغ ${monster.nameAr} المستوى ${stageMax} وأصبح جاهزاً للارتقاء إلى الطور التالي!`
        );
        const evolvedRef = updatedMonsters.find((m) => m.id === monster.id);
        if (evolvedRef) setEvolvingMonster(evolvedRef);
      }, 500);
    }
  };

  const filteredMonsters = playerState.monsters.filter((m) => {
    if (elementFilter === 'all') return true;
    return m.element === elementFilter;
  });

  if (!activeMonster) {
    return <div className="text-center p-8 text-slate-400">لا توجد وحوش بعد!</div>;
  }

  const stageInfo = EVOLUTION_STAGES_INFO[activeMonster.stage];
  const nextMilestone =
    activeMonster.level < 10
      ? 10
      : activeMonster.level < 20
      ? 20
      : activeMonster.level < 35
      ? 35
      : 50;

  const progressToNextMilestone = Math.min(
    100,
    Math.round((activeMonster.level / nextMilestone) * 100)
  );

  return (
    <div className="flex flex-col gap-5 p-3 sm:p-5 max-w-7xl mx-auto w-full pb-20 md:pb-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>نظام تطوير الوحوش ومستويات الارتقاء الأربعة</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            مستودع وتطوير الوحوش (Evolutions & Levels)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            أطعم الوحوش بالغذاء لرفع المستوى وفتح أطوار التطور: صغير ➔ يافع ➔ عملاق ناضج ➔ متسامي
            أسطوري.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {['all', 'fire', 'earth', 'water', 'dark'].map((el) => (
            <button
              key={el}
              onClick={() => setElementFilter(el)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all capitalize ${
                elementFilter === el
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-850 text-slate-400 hover:text-white'
              }`}
            >
              {el === 'all' ? 'الكل' : el}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Monster Picker, Right Detail & Evolution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Monster List (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-2 max-h-[560px] overflow-y-auto pr-1">
          {filteredMonsters.map((m) => {
            const isSelected = m.id === activeMonster.id;
            const mStage = EVOLUTION_STAGES_INFO[m.stage];

            return (
              <button
                key={m.id}
                onClick={() => setActiveMonsterId(m.id)}
                className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-3 ${
                  isSelected
                    ? 'bg-slate-850 border-amber-500 shadow-md ring-1 ring-amber-500/40'
                    : 'bg-slate-900/80 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                }`}
              >
                <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-700 shrink-0">
                  <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 right-0 bg-slate-950/90 text-amber-400 text-[10px] font-bold px-1 rounded-tl">
                    Lv.{m.level}
                  </span>
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-white truncate">{m.nameAr}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        ELEMENT_COLORS[m.element].bg
                      } ${ELEMENT_COLORS[m.element].text}`}
                    >
                      {m.element.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span className={mStage.badgeColor}>{mStage.titleAr.split(' ')[1]}</span>
                    <span>·</span>
                    <div className="flex items-center gap-0.5">
                      {[...Array(m.stars)].map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Selected Monster Details, Evolution & Level Up (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="relative bg-slate-900/90 rounded-3xl border border-slate-800 p-5 shadow-xl overflow-hidden">
            {/* Background element glow */}
            <div
              className="absolute -top-20 -left-20 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20"
              style={{ backgroundColor: ELEMENT_COLORS[activeMonster.element].glow }}
            />

            <div className="relative flex flex-col sm:flex-row gap-5 items-center">
              {/* Monster Avatar with Evolution Stage Frame */}
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-3xl overflow-hidden border-2 border-slate-750 shadow-2xl shrink-0">
                <img
                  src={activeMonster.avatar}
                  alt={activeMonster.name}
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    levelUpEffect ? 'scale-110 brightness-150' : 'scale-100'
                  }`}
                />

                {/* Stars Badge */}
                <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-slate-700 flex items-center gap-0.5">
                  {[...Array(activeMonster.stars)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Stage Tag */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/90 px-2.5 py-0.5 rounded-md border border-slate-700 text-[10px] font-extrabold text-amber-400">
                  {stageInfo.titleAr}
                </div>

                <AnimatePresence>
                  {levelUpEffect && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1.2 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-amber-500/30 backdrop-blur-xs text-xl font-black text-amber-300"
                    >
                      LEVEL UP!
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Monster Info & Evolution Milestone */}
              <div className="flex flex-col flex-1 w-full gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      {activeMonster.nameAr}
                    </h3>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      المستوى: <span className="text-amber-400 font-bold">Lv.{activeMonster.level}</span> · إنتاج الذهب:{' '}
                      <span className="text-yellow-300 font-bold">{activeMonster.goldPerHour}</span> ذهب/ساعة
                    </div>
                  </div>

                  {/* Evolution Ceremony Button */}
                  <button
                    onClick={() => setEvolvingMonster(activeMonster)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 fill-current" />
                    <span>مراسم الارتقاء</span>
                  </button>
                </div>

                {/* Evolution Milestone Progress Tracker */}
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                    <span>مرحلة التطور القادمة (المستوى {nextMilestone})</span>
                    <span className="text-amber-400">{progressToNextMilestone}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                      style={{ width: `${progressToNextMilestone}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Lv.1 صغير</span>
                    <span>Lv.10 يافع</span>
                    <span>Lv.20 عملاق ناضج</span>
                    <span>Lv.35 متسامي</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <div className="flex flex-col items-center p-1.5 rounded-lg bg-slate-900/60">
                    <Heart className="w-3.5 h-3.5 text-emerald-400 mb-0.5" />
                    <span className="text-[10px] text-slate-400">الصحة</span>
                    <span className="text-xs font-black text-white">{activeMonster.maxHp}</span>
                  </div>
                  <div className="flex flex-col items-center p-1.5 rounded-lg bg-slate-900/60">
                    <Swords className="w-3.5 h-3.5 text-red-400 mb-0.5" />
                    <span className="text-[10px] text-slate-400">الهجوم</span>
                    <span className="text-xs font-black text-white">{activeMonster.attack}</span>
                  </div>
                  <div className="flex flex-col items-center p-1.5 rounded-lg bg-slate-900/60">
                    <Shield className="w-3.5 h-3.5 text-blue-400 mb-0.5" />
                    <span className="text-[10px] text-slate-400">الدفاع</span>
                    <span className="text-xs font-black text-white">{activeMonster.defense}</span>
                  </div>
                  <div className="flex flex-col items-center p-1.5 rounded-lg bg-slate-900/60">
                    <Gauge className="w-3.5 h-3.5 text-yellow-400 mb-0.5" />
                    <span className="text-[10px] text-slate-400">السرعة</span>
                    <span className="text-xs font-black text-white">{activeMonster.speed}</span>
                  </div>
                </div>

                {/* Equipped Runes Quick Summary */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-300">الرونز المجهزة:</span>
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2].map((idx) => {
                        const r = activeMonster.runes?.[idx];
                        if (r) {
                          const cfg = RUNE_CONFIGS[r.type];
                          return (
                            <span
                              key={idx}
                              title={`${r.nameAr}`}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${cfg.borderColor} ${cfg.colorBg} ${cfg.colorText}`}
                            >
                              {cfg.icon} Lv.{r.level}
                            </span>
                          );
                        }
                        return (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-dashed border-slate-700 bg-slate-900 text-slate-500"
                          >
                            فارغ
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => setIsRuneModalOpen(true)}
                    className="px-2.5 py-1 text-[11px] font-extrabold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3 text-amber-300" />
                    <span>إدارة الرونز</span>
                  </button>
                </div>

                {/* Feeding Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => feedMonster(activeMonster, 1)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                  >
                    <Wheat className="w-3.5 h-3.5" />
                    <span>إطعام 1x ({activeMonster.level * 45} طعام)</span>
                  </button>

                  <button
                    onClick={() => feedMonster(activeMonster, 5)}
                    className="py-2.5 px-3 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>+5 مستويات سريعة</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Equipped Skills Section */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-extrabold text-slate-300">
              المهارات القتالية المجهزة ({activeMonster.skills.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeMonster.skills.map((skill) => (
                <div
                  key={skill.id}
                  className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-col justify-between gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-white">{skill.nameAr}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        ELEMENT_COLORS[skill.element].bg
                      } ${ELEMENT_COLORS[skill.element].text}`}
                    >
                      {skill.element.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {skill.descriptionAr}
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1.5 border-t border-slate-800">
                    <span className="text-red-400 font-bold">القوة: {skill.power}</span>
                    <span className="text-cyan-400 font-bold">الاستحمال: {skill.staminaCost}</span>
                    <span className="text-amber-400 font-bold">انتظار: {skill.cooldown} دور</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Evolution Modal */}
      {evolvingMonster && (
        <EvolutionModal
          monster={evolvingMonster}
          playerState={playerState}
          onClose={() => setEvolvingMonster(null)}
          onEvolutionComplete={(updatedMonster, updatedPlayerState) => {
            onUpdatePlayerState(updatedPlayerState);
            setEvolvingMonster(null);
          }}
        />
      )}

      {/* Rune Management Modal */}
      {isRuneModalOpen && (
        <RuneModal
          playerState={playerState}
          onUpdatePlayerState={onUpdatePlayerState}
          monsterId={activeMonster.id}
          onClose={() => setIsRuneModalOpen(false)}
        />
      )}
    </div>
  );
};

