import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Skull } from 'lucide-react';
import { BattleArenaTheme } from '../../data/monstersData';

interface BattleResultsModalProps {
  result: 'victory' | 'defeat';
  currentArena: BattleArenaTheme;
  rewards?: {
    gold: number;
    food: number;
    xp: number;
    gems: number;
    trophies?: number;
    runeRewardName?: string;
  } | null;
  onContinue: () => void;
  onRetry: () => void;
}

export const BattleResultsModal: React.FC<BattleResultsModalProps> = ({
  result,
  currentArena,
  rewards,
  onContinue,
  onRetry,
}) => {
  const isVictory = result === 'victory';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none" dir="rtl">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        className={`w-full max-w-md bg-slate-900 border-2 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-4 ${
          isVictory ? 'border-amber-500' : 'border-red-500'
        }`}
      >
        {isVictory ? (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.6)] animate-bounce">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white">انتصار ساحق!</h3>
            <p className="text-xs text-slate-300">
              لقد سحقت خصمك بنجاح في {currentArena.nameAr} ونلت مكافآت المعركة!
            </p>

            <div className="w-full bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-black">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">ذهب</span>
                  <span className="text-amber-400 font-mono">+{rewards?.gold || 0}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">طعام</span>
                  <span className="text-emerald-400 font-mono">+{rewards?.food || 0}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">خبرة XP</span>
                  <span className="text-purple-400 font-mono">+{rewards?.xp || 0}</span>
                </div>
              </div>

              {rewards?.gems && rewards.gems > 0 ? (
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-xs font-black text-cyan-300">
                  <span>جواهر النصر:</span>
                  <span className="text-cyan-200">+{rewards.gems} 💎</span>
                </div>
              ) : null}

              {rewards?.trophies && rewards.trophies > 0 ? (
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-blue-950/60 border border-blue-500/40 text-xs font-black text-blue-300">
                  <span>كؤوس الدوري المكتسبة:</span>
                  <span className="text-amber-300">+{rewards.trophies} 🏆</span>
                </div>
              ) : null}

              {rewards?.runeRewardName && (
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-purple-950/60 border border-purple-500/40 text-xs font-black text-purple-300">
                  <span>تعويذة رون مكتسبة:</span>
                  <span className="text-amber-300">✨ {rewards.runeRewardName}</span>
                </div>
              )}
            </div>

            <button
              onClick={onContinue}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-slate-950 font-black rounded-2xl text-sm shadow-xl active:scale-95 transition-transform"
            >
              استلام الجوائز والعودة
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.6)]">
              <Skull className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white">هزيمة في المعركة</h3>
            <p className="text-xs text-slate-300">
              سقطت وحوشك أمام الخصم. قم بتعزيز وحوشك ورفع مستواها ثم حاول مجدداً!
            </p>

            <div className="flex gap-3 w-full pt-2">
              <button
                onClick={onRetry}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 text-white font-bold rounded-xl text-xs transition-colors"
              >
                إعادة المحاولة
              </button>
              <button
                onClick={onContinue}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-colors"
              >
                العودة للقائمة
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
