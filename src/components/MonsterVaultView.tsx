import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Monster, PlayerState } from '../types/game';
import { ELEMENT_COLORS, SPECIES_CATALOG } from '../data/monstersData';
import { sound } from '../services/soundEffects';
import {
  Sparkles,
  Heart,
  Zap,
  Shield,
  Swords,
  Gauge,
  Wheat,
  ChevronLeft,
  Flame,
  Award,
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
  const [levelUpEffect, setLevelUpEffect] = useState<boolean>(false);

  const activeMonster =
    playerState.monsters.find((m) => m.id === activeMonsterId) || playerState.monsters[0];

  const feedMonster = (monster: Monster) => {
    const foodCost = monster.level * 45;
    if (playerState.food < foodCost) {
      alert('لا تملك غذاء كافياً لإطعام هذا الوحش! قم بزراعة المحاصيل في المزرعة.');
      return;
    }

    sound.playCoin();
    setLevelUpEffect(true);
    setTimeout(() => setLevelUpEffect(false), 900);

    const newLevel = monster.level + 1;
    let newStage = monster.stage;
    if (newLevel >= 20) newStage = 'adult';
    else if (newLevel >= 10) newStage = 'juvenile';

    const updatedMonsters = playerState.monsters.map((m) => {
      if (m.id === monster.id) {
        return {
          ...m,
          level: newLevel,
          stage: newStage,
          maxHp: Math.round(m.maxHp * 1.09),
          currentHp: Math.round(m.maxHp * 1.09),
          attack: Math.round(m.attack * 1.08),
          defense: Math.round(m.defense * 1.08),
          speed: Math.round(m.speed * 1.02),
          goldPerHour: Math.round(m.goldPerHour * 1.15),
        };
      }
      return m;
    });

    onUpdatePlayerState({
      ...playerState,
      food: playerState.food - foodCost,
      xp: playerState.xp + 50,
      monsters: updatedMonsters,
    });
  };

  if (!activeMonster) {
    return <div className="text-center p-8 text-slate-400">لا توجد وحوش بعد!</div>;
  }

  const foodCostForNextLevel = activeMonster.level * 45;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 rounded-2xl border border-slate-800 p-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>معرض وملاذ الوحوش (Monster Vault & Evolution)</span>
          </div>
          <h2 className="text-2xl font-black text-white">موسوعة وتطوير الوحوش</h2>
          <p className="text-xs text-slate-400 mt-1">
            أطعم وحوشك لترقية مستواها وفتح أطوار تطورها (صغير - يافع - ناضج) واكتساب مهارات خارقة.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400">إجمالي الوحوش المملوكة:</span>
          <span className="text-amber-400 font-extrabold text-sm">
            {playerState.monsters.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Monster List (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-2.5 max-h-[600px] overflow-y-auto pr-1">
          {playerState.monsters.map((m) => {
            const isSelected = m.id === activeMonster.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveMonsterId(m.id)}
                className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-3.5 ${
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

                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>HP: {m.maxHp}</span>
                    <span>·</span>
                    <span>ATK: {m.attack}</span>
                    <span>·</span>
                    <span>SPD: {m.speed}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Selected Monster Details & Feeding (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="relative bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl overflow-hidden">
            {/* Background element glow */}
            <div
              className="absolute -top-20 -left-20 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20"
              style={{ backgroundColor: ELEMENT_COLORS[activeMonster.element].glow }}
            />

            <div className="relative flex flex-col md:flex-row gap-6 items-center">
              {/* Monster Avatar with Level up animation */}
              <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl shrink-0">
                <img
                  src={activeMonster.avatar}
                  alt={activeMonster.name}
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    levelUpEffect ? 'scale-110 brightness-150' : 'scale-100'
                  }`}
                />
                <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-xs font-bold text-amber-400">
                  طور: {activeMonster.stage === 'adult' ? 'ناضج (Adult)' : activeMonster.stage === 'juvenile' ? 'يافع (Juvenile)' : 'صغير (Baby)'}
                </div>

                <AnimatePresence>
                  {levelUpEffect && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1.2 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-amber-500/30 backdrop-blur-xs text-2xl font-black text-amber-300"
                    >
                      LEVEL UP!
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Monster Core Info & Feeding */}
              <div className="flex flex-col flex-1 w-full gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black text-white">{activeMonster.nameAr}</h3>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        ELEMENT_COLORS[activeMonster.element].bg
                      } ${ELEMENT_COLORS[activeMonster.element].text}`}
                    >
                      عنصر {ELEMENT_COLORS[activeMonster.element].nameAr}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-1">
                    المستوى الحالي: Lv.{activeMonster.level} / إنتاج الذهب: {activeMonster.goldPerHour} ذهب/ساعة
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                  <div className="flex flex-col items-center p-2 rounded-xl bg-slate-900/60">
                    <Heart className="w-4 h-4 text-emerald-400 mb-1" />
                    <span className="text-[11px] text-slate-400">الصحة (HP)</span>
                    <span className="text-sm font-black text-white">{activeMonster.maxHp}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-slate-900/60">
                    <Swords className="w-4 h-4 text-red-400 mb-1" />
                    <span className="text-[11px] text-slate-400">الهجوم (ATK)</span>
                    <span className="text-sm font-black text-white">{activeMonster.attack}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-slate-900/60">
                    <Shield className="w-4 h-4 text-blue-400 mb-1" />
                    <span className="text-[11px] text-slate-400">الدفاع (DEF)</span>
                    <span className="text-sm font-black text-white">{activeMonster.defense}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-slate-900/60">
                    <Gauge className="w-4 h-4 text-yellow-400 mb-1" />
                    <span className="text-[11px] text-slate-400">السرعة (SPD)</span>
                    <span className="text-sm font-black text-white">{activeMonster.speed}</span>
                  </div>
                </div>

                {/* Feeding Action Button */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => feedMonster(activeMonster)}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                  >
                    <Wheat className="w-4 h-4" />
                    <span>إطعام وترقية الوحش ({foodCostForNextLevel} طعام)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Equipped Skills Section */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-extrabold text-slate-300">
              المهارات القتالية المجهزة ({activeMonster.skills.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeMonster.skills.map((skill) => (
                <div
                  key={skill.id}
                  className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-white">{skill.nameAr}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        ELEMENT_COLORS[skill.element].bg
                      } ${ELEMENT_COLORS[skill.element].text}`}
                    >
                      {skill.element.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{skill.descriptionAr}</p>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
                    <span className="text-red-400 font-bold">القوة: {skill.power}</span>
                    <span className="text-cyan-400 font-bold">الاستحمال: {skill.staminaCost}</span>
                    <span className="text-amber-400 font-bold">فترة الانتظار: {skill.cooldown}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
