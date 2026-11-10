import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BattleMonster, ElementType } from '../types/game';
import { ELEMENT_COLORS } from '../data/monstersData';
import { Flame, Sparkles, Shield, Zap, Skull, Heart } from 'lucide-react';

interface MonsterBattleSpriteProps {
  battleMonster: BattleMonster;
  isCurrentTurn: boolean;
  isSelectedTarget: boolean;
  isAttacking: boolean;
  isTakingHit: boolean;
  onSelect: () => void;
  floatingTexts: { id: string; text: string; color: string; isCrit?: boolean }[];
}

export const MonsterBattleSprite: React.FC<MonsterBattleSpriteProps> = ({
  battleMonster,
  isCurrentTurn,
  isSelectedTarget,
  isAttacking,
  isTakingHit,
  onSelect,
  floatingTexts,
}) => {
  const { monster, isAi, currentHp, currentStamina, isDefeated, statusEffects } = battleMonster;
  const hpPercent = Math.max(0, (currentHp / monster.maxHp) * 100);
  const staminaPercent = Math.max(0, (currentStamina / monster.maxStamina) * 100);
  const elemColor = ELEMENT_COLORS[monster.element] || ELEMENT_COLORS.fire;

  // Lunge distance: positive for player (lunging right toward enemy), negative for AI (lunging left)
  const lungeDistance = isAi ? -140 : 140;

  return (
    <div
      onClick={() => !isDefeated && onSelect()}
      className={`relative flex flex-col items-center cursor-pointer select-none transition-all ${
        isDefeated ? 'opacity-35 grayscale pointer-events-none' : ''
      }`}
    >
      {/* Floating Damage / Combat Text Popups */}
      <AnimatePresence>
        {floatingTexts.map((ft) => (
          <motion.div
            key={ft.id}
            initial={{ opacity: 0, y: 15, scale: 0.6 }}
            animate={{ opacity: 1, y: -45, scale: ft.isCrit ? 1.35 : 1.15 }}
            exit={{ opacity: 0, y: -70 }}
            className={`absolute -top-12 z-50 whitespace-nowrap text-xs sm:text-sm font-black px-2.5 py-1 rounded-lg shadow-2xl bg-slate-950/95 border border-slate-700 pointer-events-none ${ft.color}`}
          >
            {ft.text}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Target Reticle Indicator */}
      {isSelectedTarget && !isDefeated && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="absolute -top-10 z-40 px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] shadow-[0_0_15px_rgba(239,68,68,0.9)] border border-red-300 whitespace-nowrap"
        >
          🎯 الهدف المحدد
        </motion.div>
      )}

      {/* Turn Halo Indicator */}
      {isCurrentTurn && !isDefeated && (
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute -top-6 z-40 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shadow-[0_0_20px_rgba(250,204,21,1)] whitespace-nowrap"
        >
          {isAi ? 'الخصم يستعد للهجوم' : '⚡ دورك للهجوم!'}
        </motion.div>
      )}

      {/* --- THE FULL-BODY ANIMATED MONSTER CREATURE --- */}
      <motion.div
        animate={
          isDefeated
            ? { opacity: 0.25, y: 35, scale: 0.8 }
            : isTakingHit
            ? {
                x: isAi ? 35 : -35,
                rotate: isAi ? 10 : -10,
                scale: 0.92,
                filter: 'brightness(2.2) contrast(1.5)',
              }
            : isAttacking
            ? {
                x: [0, lungeDistance, 0],
                scale: [1, 1.25, 1],
                rotate: isAi ? [-5, -15, 0] : [5, 15, 0],
              }
            : isCurrentTurn
            ? {
                scale: [1, 1.05, 1],
                y: [0, -8, 0],
              }
            : {
                y: [0, -5, 0],
                scaleY: [1, 1.03, 1],
              }
        }
        transition={
          isAttacking
            ? { duration: 0.45, ease: 'easeInOut' }
            : isTakingHit
            ? { duration: 0.25, ease: 'easeOut' }
            : { repeat: Infinity, duration: isCurrentTurn ? 2 : 3.2, ease: 'easeInOut' }
        }
        className={`relative w-28 h-32 sm:w-36 sm:h-44 md:w-44 md:h-52 flex items-center justify-center transition-all ${
          isAi ? '-scale-x-100' : 'scale-x-100'
        }`}
      >
        {/* Elemental Aura / Flame particles around monster */}
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-40 pointer-events-none transition-all"
          style={{
            backgroundColor: elemColor.glow,
            transform: isCurrentTurn ? 'scale(1.2)' : 'scale(0.85)',
          }}
        />

        {/* Real Creature Sprite (No restrictive square card box!) */}
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={monster.avatar}
            alt={monster.name}
            className={`w-full h-full object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.85)] transition-all ${
              isCurrentTurn ? 'drop-shadow-[0_0_25px_var(--glow)]' : ''
            }`}
            style={
              {
                '--glow': elemColor.glow,
              } as React.CSSProperties
            }
          />
        </div>
      </motion.div>

      {/* --- 3D RUNIC STONE COMBAT PEDESTAL UNDER THE MONSTER'S FEET --- */}
      <div className="relative -mt-6 sm:-mt-8 flex flex-col items-center">
        {/* Soft shadow cast by monster */}
        <div className="w-24 sm:w-36 h-6 bg-black/60 rounded-full blur-xs -mb-3" />

        {/* 3D Rune Platform Disc */}
        <div
          className={`relative w-28 sm:w-40 h-10 sm:h-12 rounded-[50%] border-2 transition-all shadow-2xl flex items-center justify-center ${
            isCurrentTurn
              ? 'border-yellow-400 bg-gradient-to-b from-yellow-500/30 to-slate-900 shadow-[0_0_30px_rgba(250,204,21,0.8)]'
              : isSelectedTarget
              ? 'border-red-500 bg-gradient-to-b from-red-600/30 to-slate-900 shadow-[0_0_20px_rgba(239,68,68,0.7)]'
              : 'border-slate-700 bg-gradient-to-b from-slate-800/80 to-slate-950'
          }`}
        >
          {/* Glowing Rune ring */}
          <div
            className="w-20 sm:w-28 h-6 sm:h-8 rounded-[50%] border border-dashed opacity-60 animate-spin"
            style={{ borderColor: elemColor.glow, animationDuration: '20s' }}
          />
          <div
            className="absolute w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor]"
            style={{ backgroundColor: elemColor.glow }}
          />
        </div>
      </div>

      {/* --- MONSTER LEGENDS STYLE COMBAT NAMEPLATE & HUD --- */}
      <div className="w-32 sm:w-40 mt-1 flex flex-col items-center gap-1 bg-slate-950/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700/80 shadow-2xl">
        {/* Monster Legends Badge: (Rarity) Name Lvl X */}
        <div className="flex items-center justify-center gap-1.5 text-xs font-black text-white whitespace-nowrap">
          <span className="w-4 h-4 rounded-full bg-gradient-to-b from-amber-300 to-amber-600 text-slate-950 font-black text-[9px] flex items-center justify-center shadow-xs">
            {monster.stars >= 3 ? 'L' : monster.stars === 2 ? 'R' : 'C'}
          </span>
          <span className="truncate max-w-[85px] sm:max-w-[105px]">{monster.nameAr.split(' ')[0]}</span>
          <span className="text-amber-400 font-extrabold text-[11px]">Lvl {monster.level}</span>
        </div>

        {/* Element Icon & Role Badge */}
        <div className="flex items-center gap-1">
          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 ${elemColor.bg} ${elemColor.text} border ${elemColor.border}`}>
            <span>{elemColor.icon || '🔥'}</span>
            <span>{elemColor.nameAr.split(' ')[0]}</span>
          </span>
          {monster.role && (
            <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {monster.role === 'Attacker'
                ? 'مهاجم'
                : monster.role === 'Tank'
                ? 'مدافع'
                : monster.role === 'Support'
                ? 'داعم'
                : 'متحكم'}
            </span>
          )}
        </div>

        {/* Health Bar with percentage */}
        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700/70">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              hpPercent > 50
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : hpPercent > 20
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                : 'bg-gradient-to-r from-red-600 to-rose-500'
            }`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>

        {/* Stamina Bar (for player monsters) */}
        {!isAi && (
          <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
              style={{ width: `${staminaPercent}%` }}
            />
          </div>
        )}

        <div className="w-full flex items-center justify-between text-[8px] font-mono text-slate-400 px-0.5">
          <span>{currentHp}/{monster.maxHp} HP</span>
          <span>{Math.round(hpPercent)}%</span>
        </div>

        {/* Status Effects Badges */}
        {statusEffects.length > 0 && (
          <div className="flex items-center justify-center gap-1 mt-0.5 flex-wrap">
            {statusEffects.map((ef, idx) => (
              <span
                key={idx}
                className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40"
              >
                {ef.type === 'burn'
                  ? '🔥 حرق'
                  : ef.type === 'stun'
                  ? '⚡ شلل'
                  : ef.type === 'shield'
                  ? '🛡️ درع'
                  : '☠️ سم'}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
