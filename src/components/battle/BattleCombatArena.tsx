import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BattleMonster, MonsterSkill } from '../../types/game';
import { BattleArenaTheme, ELEMENT_ADVANTAGES, ELEMENT_COLORS } from '../../data/monstersData';
import { MonsterBattleSprite } from '../MonsterBattleSprite';
import { Swords, Shield, Zap, Sparkles, FastForward, Play, RotateCcw, Skull } from 'lucide-react';

interface FloatingText {
  id: string;
  targetMonsterId: string;
  text: string;
  color: string;
  isCrit?: boolean;
}

interface BattleCombatArenaProps {
  currentArena: BattleArenaTheme;
  playerMonsters: BattleMonster[];
  enemyMonsters: BattleMonster[];
  activeTurnMonsterId: string;
  selectedSkill: MonsterSkill | null;
  selectedTargetId: string;
  attackingMonsterId: string | null;
  hitMonsterId: string | null;
  floatingTexts: FloatingText[];
  activeVfx: { key: string; targetId: string; attackerId: string } | null;
  screenShake: boolean;
  autoBattle: boolean;
  battleSpeed: number;
  battleLog: string[];
  onSelectSkill: (skill: MonsterSkill) => void;
  onSelectTarget: (targetId: string) => void;
  onExecutePlayerSkill: (skill?: MonsterSkill) => void;
  onRechargeStamina: () => void;
  onToggleAutoBattle: () => void;
  onToggleSpeed: () => void;
  onSurrender: () => void;
}

export const BattleCombatArena: React.FC<BattleCombatArenaProps> = ({
  currentArena,
  playerMonsters,
  enemyMonsters,
  activeTurnMonsterId,
  selectedSkill,
  selectedTargetId,
  attackingMonsterId,
  hitMonsterId,
  floatingTexts,
  activeVfx,
  screenShake,
  autoBattle,
  battleSpeed,
  battleLog,
  onSelectSkill,
  onSelectTarget,
  onExecutePlayerSkill,
  onRechargeStamina,
  onToggleAutoBattle,
  onToggleSpeed,
  onSurrender,
}) => {
  const currentActiveMonster = [...playerMonsters, ...enemyMonsters].find(
    (m) => m.monster.id === activeTurnMonsterId
  );
  const isPlayerTurn = currentActiveMonster ? !currentActiveMonster.isAi : false;

  const currentEnemyTarget =
    enemyMonsters.find((m) => m.monster.id === selectedTargetId) ||
    enemyMonsters.find((m) => !m.isDefeated);

  const turnQueue = [...playerMonsters, ...enemyMonsters].filter((m) => !m.isDefeated);

  return (
    <div className="flex flex-col gap-3 w-full select-none">
      {/* Top Combat Control HUD */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1.5">
            <Swords className="w-4 h-4 text-red-500" />
            <span>ساحة {currentArena.nameAr}</span>
          </span>
        </div>

        {/* Dynamic Turn Order Queue Icons */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-950/70 px-3 py-1 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 font-bold ml-1">ترتيب الأدوار:</span>
          {turnQueue.slice(0, 5).map((bm) => {
            const isActive = bm.monster.id === activeTurnMonsterId;
            return (
              <div
                key={bm.monster.id}
                className={`relative w-7 h-7 rounded-full overflow-hidden border-2 transition-all ${
                  isActive
                    ? 'border-yellow-400 ring-2 ring-yellow-400/50 scale-110 z-10'
                    : bm.isAi
                    ? 'border-red-500/60 opacity-70'
                    : 'border-blue-500/60 opacity-70'
                }`}
                title={bm.monster.nameAr}
              >
                <img src={bm.monster.avatar} alt={bm.monster.name} className="w-full h-full object-cover" />
              </div>
            );
          })}
        </div>

        {/* Speed, Auto, Surrender */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleAutoBattle}
            className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
              autoBattle
                ? 'bg-red-500/20 border-red-500 text-red-300 ring-1 ring-red-500/50'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {autoBattle ? 'تلقائي (AUTO ON)' : 'تلقائي (AUTO)'}
          </button>

          <button
            onClick={onToggleSpeed}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs font-bold text-amber-400"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{battleSpeed}x</span>
          </button>

          <button
            onClick={onSurrender}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold"
          >
            انسحاب
          </button>
        </div>
      </div>

      {/* REALISTIC BATTLEFIELD ARENA STAGE (Authentic 2.5D with realistic HD arenas) */}
      <div
        className={`relative w-full min-h-[460px] sm:min-h-[520px] md:min-h-[580px] rounded-3xl overflow-hidden border-2 border-slate-750 shadow-2xl flex flex-col justify-between p-3 sm:p-5 md:p-6 transition-transform ${
          screenShake ? 'translate-x-2 -translate-y-2' : ''
        }`}
      >
        {/* Realistic Arena HD Backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 pointer-events-none"
          style={{ backgroundImage: `url('${currentArena.image}')` }}
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${currentArena.overlayTint} pointer-events-none`} />

        {/* Ambient VFX Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {currentArena.ambientParticle === 'ember' && (
            <div className="absolute inset-0">
              <div className="absolute bottom-10 left-1/4 w-2 h-2 rounded-full bg-amber-400 blur-xs animate-ping" />
              <div className="absolute bottom-20 left-1/2 w-3 h-3 rounded-full bg-red-500 blur-xs animate-pulse" />
              <div className="absolute bottom-16 right-1/3 w-2 h-2 rounded-full bg-yellow-300 blur-xs animate-bounce" />
            </div>
          )}
          {currentArena.ambientParticle === 'spark' && (
            <div className="absolute inset-0 opacity-40">
              <div className="absolute top-10 left-1/3 w-1 h-8 bg-cyan-300 rotate-12 blur-xs animate-pulse" />
              <div className="absolute top-20 right-1/4 w-1 h-6 bg-yellow-300 -rotate-12 blur-xs animate-ping" />
            </div>
          )}
        </div>

        {/* 3v3 REAL MONSTERS BATTLEFIELD (Authentic Stepped Depth Layout) */}
        <div className="relative z-10 w-full h-full my-auto grid grid-cols-2 gap-4 items-center min-h-[360px] sm:min-h-[420px]">
          {/* Player Team (Left side - 3 real animated monsters with contact shadows & runic pedestals) */}
          <div className="relative flex flex-col justify-around h-full py-2">
            {playerMonsters.map((bm, idx) => (
              <div
                key={bm.monster.id}
                className={`relative transition-transform ${
                  idx === 1 ? 'translate-x-4 sm:translate-x-10 scale-105 z-20' : 'scale-95 z-10'
                }`}
              >
                <MonsterBattleSprite
                  battleMonster={bm}
                  isCurrentTurn={bm.monster.id === activeTurnMonsterId}
                  isSelectedTarget={false}
                  isAttacking={bm.monster.id === attackingMonsterId}
                  isTakingHit={bm.monster.id === hitMonsterId}
                  onSelect={() => {}}
                  floatingTexts={floatingTexts.filter((ft) => ft.targetMonsterId === bm.monster.id)}
                />
              </div>
            ))}
          </div>

          {/* Enemy AI Team (Right side - 3 real animated monsters, tap to target) */}
          <div className="relative flex flex-col justify-around h-full py-2 items-end">
            {enemyMonsters.map((bm, idx) => (
              <div
                key={bm.monster.id}
                className={`relative transition-transform ${
                  idx === 1 ? '-translate-x-4 sm:-translate-x-10 scale-105 z-20' : 'scale-95 z-10'
                }`}
              >
                <MonsterBattleSprite
                  battleMonster={bm}
                  isCurrentTurn={bm.monster.id === activeTurnMonsterId}
                  isSelectedTarget={bm.monster.id === selectedTargetId}
                  isAttacking={bm.monster.id === attackingMonsterId}
                  isTakingHit={bm.monster.id === hitMonsterId}
                  onSelect={() => onSelectTarget(bm.monster.id)}
                  floatingTexts={floatingTexts.filter((ft) => ft.targetMonsterId === bm.monster.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Turn Action Control Deck (Player Skills Deck) */}
      <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-800 p-3 sm:p-4 flex flex-col gap-3 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">الوحش المهاجم الآن:</span>
            <span className="text-sm font-black text-amber-400">
              {currentActiveMonster?.monster.nameAr || 'انتظار...'}
            </span>
            {isPlayerTurn && (
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-extrabold border border-emerald-500/30">
                أنت المتحكم
              </span>
            )}
          </div>

          {isPlayerTurn && (
            <div className="flex items-center gap-2">
              <button
                onClick={onRechargeStamina}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>شحن الاستحمال (+45)</span>
              </button>
            </div>
          )}
        </div>

        {/* 4 Skill Cards */}
        {isPlayerTurn && currentActiveMonster ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {currentActiveMonster.monster.skills.map((skill) => {
              const cooldown = currentActiveMonster.skillCooldowns[skill.id] || 0;
              const hasStamina = currentActiveMonster.currentStamina >= skill.staminaCost;
              const isUsable = cooldown === 0 && hasStamina;
              const isSelected = selectedSkill?.id === skill.id;

              // Check element advantage
              const isAdvantage =
                currentEnemyTarget &&
                (ELEMENT_ADVANTAGES[skill.element] || []).includes(currentEnemyTarget.monster.element);

              const elemColor = ELEMENT_COLORS[skill.element] || ELEMENT_COLORS.fire;

              return (
                <button
                  key={skill.id}
                  onClick={() => {
                    onSelectSkill(skill);
                    onExecutePlayerSkill(skill);
                  }}
                  disabled={!isUsable}
                  className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between gap-1 relative ${
                    isSelected
                      ? 'bg-slate-800 border-amber-400 shadow-xl ring-2 ring-amber-400/50 scale-[1.02]'
                      : isUsable
                      ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      : 'bg-slate-950/40 border-slate-900 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs sm:text-sm text-white truncate max-w-[120px]">
                      {skill.nameAr}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${elemColor.bg} ${elemColor.text}`}
                    >
                      <span>{elemColor.icon}</span>
                      <span>{elemColor.nameAr.split(' ')[0]}</span>
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 line-clamp-1">{skill.descriptionAr}</p>

                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pt-1 border-t border-slate-800">
                    <span className="text-red-400">قوة: {skill.power}</span>
                    <span className="text-cyan-400">طاقة: {skill.staminaCost}</span>
                    {isAdvantage && <span className="text-amber-300 font-black animate-pulse">2.5x ضرر!</span>}
                    {cooldown > 0 && <span className="text-amber-400">انتظار: {cooldown}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-slate-400 font-bold animate-pulse">
            جاري تنفيذ هجوم المعركة...
          </div>
        )}

        {/* Live Combat Log Bar */}
        <div className="bg-slate-950/70 rounded-xl border border-slate-800/80 px-3 py-1.5 text-[10px] text-slate-400 font-mono truncate">
          • {battleLog[0] || 'المعركة جارية...'}
        </div>
      </div>
    </div>
  );
};
