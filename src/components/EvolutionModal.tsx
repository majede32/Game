import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Monster, PlayerState } from '../types/game';
import { EVOLUTION_STAGES_INFO } from '../data/monstersData';
import { sound } from '../services/soundEffects';
import { Sparkles, Flame, Shield, Swords, Gauge, Heart, ArrowUp, Star, X } from 'lucide-react';

interface EvolutionModalProps {
  monster: Monster;
  playerState: PlayerState;
  onClose: () => void;
  onEvolutionComplete: (updatedMonster: Monster, updatedPlayerState: PlayerState) => void;
}

export const EvolutionModal: React.FC<EvolutionModalProps> = ({
  monster,
  playerState,
  onClose,
  onEvolutionComplete,
}) => {
  const [phase, setPhase] = useState<'preview' | 'evolving' | 'completed'>('preview');

  // Next evolution target
  let nextStage: 'juvenile' | 'adult' | 'ascended' = 'juvenile';
  let nextTitle = 'طور اليافع (Juvenile)';
  let hpBoost = 450;
  let atkBoost = 75;
  let defBoost = 55;
  let spdBoost = 15;

  if (monster.stage === 'baby') {
    nextStage = 'juvenile';
    nextTitle = 'طور اليافع (Juvenile Stage)';
    hpBoost = 520;
    atkBoost = 85;
    defBoost = 60;
    spdBoost = 12;
  } else if (monster.stage === 'juvenile') {
    nextStage = 'adult';
    nextTitle = 'طور العملاق الناضج (Adult Titan)';
    hpBoost = 950;
    atkBoost = 160;
    defBoost = 120;
    spdBoost = 22;
  } else {
    nextStage = 'ascended';
    nextTitle = 'طور التحول الأسطوري المتسامي (Mythic Ascended)';
    hpBoost = 1600;
    atkBoost = 280;
    defBoost = 210;
    spdBoost = 35;
  }

  const startEvolution = () => {
    setPhase('evolving');
    sound.playHit();

    setTimeout(() => {
      sound.playVictory();
      setPhase('completed');
    }, 1800);
  };

  const confirmEvolution = () => {
    const updatedMonster: Monster = {
      ...monster,
      stage: nextStage,
      stars: Math.min(5, monster.stars + 1),
      maxHp: monster.maxHp + hpBoost,
      currentHp: monster.maxHp + hpBoost,
      attack: monster.attack + atkBoost,
      defense: monster.defense + defBoost,
      speed: monster.speed + spdBoost,
      goldPerHour: Math.round(monster.goldPerHour * 1.5),
      canEvolve: false,
    };

    const updatedMonsters = playerState.monsters.map((m) =>
      m.id === monster.id ? updatedMonster : m
    );

    const updatedState: PlayerState = {
      ...playerState,
      xp: playerState.xp + 400,
      monsters: updatedMonsters,
    };

    onEvolutionComplete(updatedMonster, updatedState);
  };

  const currentInfo = EVOLUTION_STAGES_INFO[monster.stage];
  const nextInfo = EVOLUTION_STAGES_INFO[nextStage];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-xl bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-5 relative overflow-hidden"
      >
        {/* Ambient ray effects */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Phase 1: Preview */}
        {phase === 'preview' && (
          <div className="flex flex-col items-center gap-5 w-full text-center">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>مراسم الارتقاء والتطور الكبرى (Monster Evolution)</span>
            </div>

            <h3 className="text-2xl font-black text-white">
              ارتقاء {monster.nameAr} إلى {nextTitle}
            </h3>

            {/* Monster Avatar with Aura */}
            <div className="relative w-44 h-44 rounded-3xl overflow-hidden border-4 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.5)]">
              <img src={monster.avatar} alt={monster.name} className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-700">
                {[...Array(monster.stars)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>

            {/* Stat Gain Comparison Grid */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <div className="flex flex-col items-center p-2 rounded-xl bg-slate-900/60">
                <Heart className="w-4 h-4 text-emerald-400 mb-1" />
                <span className="text-[10px] text-slate-400">الصحة (HP)</span>
                <span className="text-xs font-bold text-slate-300">{monster.maxHp}</span>
                <span className="text-xs font-black text-emerald-400">+{hpBoost}</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-xl bg-slate-900/60">
                <Swords className="w-4 h-4 text-red-400 mb-1" />
                <span className="text-[10px] text-slate-400">الهجوم (ATK)</span>
                <span className="text-xs font-bold text-slate-300">{monster.attack}</span>
                <span className="text-xs font-black text-red-400">+{atkBoost}</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-xl bg-slate-900/60">
                <Shield className="w-4 h-4 text-blue-400 mb-1" />
                <span className="text-[10px] text-slate-400">الدفاع (DEF)</span>
                <span className="text-xs font-bold text-slate-300">{monster.defense}</span>
                <span className="text-xs font-black text-blue-400">+{defBoost}</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-xl bg-slate-900/60">
                <Gauge className="w-4 h-4 text-yellow-400 mb-1" />
                <span className="text-[10px] text-slate-400">السرعة (SPD)</span>
                <span className="text-xs font-bold text-slate-300">{monster.speed}</span>
                <span className="text-xs font-black text-yellow-400">+{spdBoost}</span>
              </div>
            </div>

            <button
              onClick={startEvolution}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-slate-950 font-black text-base rounded-2xl shadow-xl transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 fill-current" />
              <span>بدء مراسم التحول والارتقاء الآن!</span>
            </button>
          </div>
        )}

        {/* Phase 2: Cinematic Evolution Animation */}
        {phase === 'evolving' && (
          <div className="flex flex-col items-center justify-center py-12 gap-6 text-center">
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="relative w-48 h-48 rounded-full border-4 border-dashed border-amber-400 flex items-center justify-center shadow-[0_0_60px_rgba(245,158,11,1)]"
            >
              <Flame className="w-24 h-24 text-amber-300 animate-pulse" />
            </motion.div>
            <div className="text-lg font-black text-amber-300 animate-pulse">
              طاقة العناصر تندمج وتطور الوحش...
            </div>
          </div>
        )}

        {/* Phase 3: Completed Evolution Celebration */}
        {phase === 'completed' && (
          <div className="flex flex-col items-center gap-5 w-full text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.8)]">
              <Sparkles className="w-8 h-8" />
            </div>

            <div>
              <div className="text-xs font-bold text-emerald-400 mb-1">اكتمل التطور بنجاح!</div>
              <h3 className="text-2xl font-black text-white">{monster.nameAr}</h3>
              <p className="text-xs text-amber-400 font-extrabold mt-1">
                ارتقى الوحش رسمياً إلى: {nextTitle} (+1 نجمة)
              </p>
            </div>

            <div className="relative w-44 h-44 rounded-3xl overflow-hidden border-4 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.8)]">
              <img src={monster.avatar} alt={monster.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-center pb-2">
                <div className="flex items-center gap-1">
                  {[...Array(monster.stars + 1)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={confirmEvolution}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-transform active:scale-95"
            >
              استلام الوحش المطور ومتابعة اللعب
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
