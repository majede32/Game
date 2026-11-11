import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Monster } from '../../types/game';
import { BattleArenaTheme, ELEMENT_COLORS } from '../../data/monstersData';
import { Swords, HelpCircle, X, MapPin, Sparkles, Shield, Zap } from 'lucide-react';

interface BattlePrepScreenProps {
  stageTitle: string;
  stageSubtitle?: string;
  currentArena: BattleArenaTheme;
  playerTeam: Monster[];
  enemyTeam: Monster[];
  onStartFight: () => void;
  onChangeTeam: () => void;
  onOpenArenaSelector: () => void;
  onClose: () => void;
}

export const BattlePrepScreen: React.FC<BattlePrepScreenProps> = ({
  stageTitle,
  stageSubtitle,
  currentArena,
  playerTeam,
  enemyTeam,
  onStartFight,
  onChangeTeam,
  onOpenArenaSelector,
  onClose,
}) => {
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // Helper for Rarity letter badge: C, UC, R, E, L, M
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

  return (
    <div className="relative w-full min-h-[580px] sm:min-h-[620px] rounded-3xl overflow-hidden border-2 border-slate-750 shadow-2xl flex flex-col justify-between bg-slate-950 select-none">
      {/* Background HD Arena Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={currentArena.image}
          alt={currentArena.nameAr}
          className="w-full h-full object-cover brightness-90 contrast-105"
        />
        <div className={`absolute inset-0 bg-gradient-to-b ${currentArena.overlayTint}`} />
      </div>

      {/* Top Header Bar (Monster Legends Style with Help '?' and Close 'X' buttons) */}
      <div className="relative z-20 flex items-center justify-between p-3 sm:p-5 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900/90 border border-amber-500/50 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl flex flex-col">
            <span className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-1.5">
              <Swords className="w-4 h-4 text-red-500" />
              {stageTitle}
            </span>
            {stageSubtitle && (
              <span className="text-[11px] font-bold text-slate-300">{stageSubtitle}</span>
            )}
          </div>

          <button
            onClick={onOpenArenaSelector}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all shadow-lg active:scale-95"
            title="تغيير ساحة المعركة الواقعية"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">الساحة:</span>
            <span className="text-amber-300">{currentArena.nameAr}</span>
          </button>
        </div>

        {/* Top Right Help & Close Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHelpModal(true)}
            className="w-10 h-10 rounded-full bg-gradient-to-b from-cyan-400 to-blue-600 border-2 border-cyan-200 text-white font-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
            title="دليل تشكيلة المعركة"
          >
            <HelpCircle className="w-6 h-6 stroke-[2.5]" />
          </button>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gradient-to-b from-red-500 to-red-700 border-2 border-red-300 text-white font-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
            title="إغلاق والعودة"
          >
            <X className="w-6 h-6 stroke-[2.8]" />
          </button>
        </div>
      </div>

      {/* Main 3v3 Monster Staging Field (Stepped diagonal depth matching reference image) */}
      <div className="relative z-10 w-full flex-1 px-4 sm:px-8 py-2 grid grid-cols-2 items-center gap-4">
        {/* Left Side: 3 Friendly Monsters */}
        <div className="relative flex flex-col justify-around h-[380px] sm:h-[440px]">
          {playerTeam.map((monster, idx) => {
            const badge = getRarityBadge(monster.rarity || 'Common');
            const elemColor = ELEMENT_COLORS[monster.element] || ELEMENT_COLORS.fire;

            // Authentic Staggered Diagonal Formation (top back, middle forward, bottom mid)
            const staggerClasses =
              idx === 0
                ? 'translate-x-0'
                : idx === 1
                ? 'translate-x-8 sm:translate-x-16 scale-105 z-10'
                : 'translate-x-2 sm:translate-x-4 scale-95';

            return (
              <div
                key={monster.id || idx}
                className={`relative flex items-center gap-3 transition-transform ${staggerClasses}`}
              >
                {/* Real Monster Illustration Figure with Idle Breathing Motion */}
                <motion.div
                  animate={{ y: [0, -5, 0], scaleY: [1, 1.02, 1] }}
                  transition={{
                    repeat: Infinity,
                    duration: 3 + idx * 0.4,
                    ease: 'easeInOut',
                  }}
                  className="relative w-24 h-28 sm:w-36 sm:h-38 md:w-44 md:h-44 flex items-center justify-center cursor-pointer"
                  onClick={onChangeTeam}
                  title="انقر لتعديل التشكيلة"
                >
                  {/* Ground Oval Contact Shadow */}
                  <div className="absolute -bottom-2 w-24 sm:w-32 h-6 bg-black/60 rounded-full blur-xs pointer-events-none" />
                  <img
                    src={monster.avatar}
                    alt={monster.name}
                    className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] hover:scale-105 transition-transform"
                  />
                </motion.div>

                {/* Monster Legends Nameplate: (Rarity Letter Badge) Name Lvl X + Element Icon */}
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/20 shadow-xl">
                    <span
                      className={`w-5 h-5 rounded-full bg-gradient-to-b ${badge.bg} font-black text-[11px] flex items-center justify-center shadow-md`}
                    >
                      {badge.text}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-white drop-shadow-md">
                      {monster.nameAr.split(' ')[0]}
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-amber-300 font-mono">
                      Lvl {monster.level}
                    </span>
                  </div>

                  {/* Element Pill Underneath */}
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/75 border border-white/10 text-[10px] font-extrabold text-slate-200">
                    <span>{elemColor.icon}</span>
                    <span className="uppercase text-[9px] tracking-wide">{monster.element}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: 3 Enemy Monsters */}
        <div className="relative flex flex-col justify-around h-[380px] sm:h-[440px] items-end">
          {enemyTeam.map((monster, idx) => {
            const badge = getRarityBadge(monster.rarity || 'Common');
            const elemColor = ELEMENT_COLORS[monster.element] || ELEMENT_COLORS.fire;

            // Opponent Diagonal Stagger (mirrored)
            const staggerClasses =
              idx === 0
                ? 'translate-x-0'
                : idx === 1
                ? '-translate-x-8 sm:-translate-x-16 scale-105 z-10'
                : '-translate-x-2 sm:-translate-x-4 scale-95';

            return (
              <div
                key={monster.id || idx}
                className={`relative flex items-center flex-row-reverse gap-3 transition-transform ${staggerClasses}`}
              >
                {/* Real Monster Illustration Figure Facing Left */}
                <motion.div
                  animate={{ y: [0, -5, 0], scaleY: [1, 1.02, 1] }}
                  transition={{
                    repeat: Infinity,
                    duration: 3.2 + idx * 0.35,
                    ease: 'easeInOut',
                  }}
                  className="relative w-24 h-28 sm:w-36 sm:h-38 md:w-44 md:h-44 flex items-center justify-center -scale-x-100"
                >
                  {/* Ground Oval Contact Shadow */}
                  <div className="absolute -bottom-2 w-24 sm:w-32 h-6 bg-black/60 rounded-full blur-xs pointer-events-none" />
                  <img
                    src={monster.avatar}
                    alt={monster.name}
                    className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)]"
                  />
                </motion.div>

                {/* Enemy Nameplate */}
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-red-500/30 shadow-xl">
                    <span
                      className={`w-5 h-5 rounded-full bg-gradient-to-b ${badge.bg} font-black text-[11px] flex items-center justify-center shadow-md`}
                    >
                      {badge.text}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-white drop-shadow-md">
                      {monster.nameAr.split(' ')[0]}
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-red-300 font-mono">
                      Lvl {monster.level}
                    </span>
                  </div>

                  {/* Element Pill Underneath */}
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/75 border border-white/10 text-[10px] font-extrabold text-slate-200">
                    <span>{elemColor.icon}</span>
                    <span className="uppercase text-[9px] tracking-wide">{monster.element}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Command Center (Exact Iconic Blue CHANGE TEAM & Red FIGHT! 3D Beveled Buttons) */}
      <div className="relative z-20 w-full p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-center gap-4 sm:gap-8">
        {/* Blue 3D Beveled Button: CHANGE TEAM */}
        <button
          onClick={onChangeTeam}
          className="group relative px-6 sm:px-10 py-3 sm:py-4 rounded-2xl font-black text-sm sm:text-lg text-white shadow-2xl active:translate-y-1 transition-all overflow-hidden border-2 border-cyan-300"
          style={{
            background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 45%, #0369a1 100%)',
            boxShadow: '0 8px 0 #075985, 0 12px 25px rgba(2, 132, 199, 0.6)',
          }}
        >
          <div className="relative z-10 flex items-center gap-2 drop-shadow-md tracking-wider">
            <Shield className="w-5 h-5 text-cyan-100" />
            <span>CHANGE TEAM</span>
            <span className="text-xs opacity-90 font-bold hidden sm:inline">(تعديل الفريق)</span>
          </div>
          {/* Top highlight shine */}
          <div className="absolute top-0 inset-x-0 h-1/2 bg-white/25 rounded-t-2xl pointer-events-none" />
        </button>

        {/* Red 3D Beveled Button: FIGHT! */}
        <button
          onClick={onStartFight}
          className="group relative px-8 sm:px-16 py-3.5 sm:py-4 rounded-2xl font-black text-base sm:text-2xl text-white shadow-2xl active:translate-y-1 transition-all overflow-hidden border-2 border-red-300"
          style={{
            background: 'linear-gradient(180deg, #f87171 0%, #dc2626 45%, #991b1b 100%)',
            boxShadow: '0 8px 0 #7f1d1d, 0 14px 35px rgba(220, 38, 38, 0.8)',
          }}
        >
          <div className="relative z-10 flex items-center gap-2.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-widest animate-pulse">
            <Swords className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-300 fill-yellow-300" />
            <span>FIGHT!</span>
            <span className="text-sm opacity-90 font-bold hidden sm:inline">(بدء القتال!)</span>
          </div>
          {/* Top highlight shine */}
          <div className="absolute top-0 inset-x-0 h-1/2 bg-white/30 rounded-t-2xl pointer-events-none" />
        </button>
      </div>

      {/* Guide & Strategy Help Modal */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" dir="rtl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-500 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-right"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-black text-white">دليل تكوين الفريق الاستراتيجي (Team Composition)</h3>
                </div>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="font-black text-amber-300 mb-1">⚔️ المهاجم (Attacker):</h4>
                  <p>وحش يمتلك ضرر هجوم مرتفع ومهارات عنصرية تضرب نقاط ضعف الخصم (2.5x ضرر إضافي).</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="font-black text-emerald-300 mb-1">🛡️ المدافع/الدبابة (Tank):</h4>
                  <p>وحش بصحة عالية ودروع يمتص ضربات الخصم القوية لحماية باقي أفراد الفريق.</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="font-black text-cyan-300 mb-1">🌀 التحكم والدعم (Control & Support):</h4>
                  <p>يعمل على تعطيل دور الخصم (صعق/تجميد) أو استنزاف طاقة الاستحمال وشفاء الفريق.</p>
                </div>
              </div>

              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-transform active:scale-95"
              >
                فهمت الاستراتيجية
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
