import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PlayerState } from '../types/game';
import { sound } from '../services/soundEffects';
import { Trophy, CheckCircle2, Circle, Coins, Wheat, Gem, X, Sparkles } from 'lucide-react';

interface DailyQuestsModalProps {
  playerState: PlayerState;
  onClaimReward: (updatedState: PlayerState) => void;
  onClose: () => void;
}

interface Quest {
  id: string;
  titleAr: string;
  descAr: string;
  targetCount: number;
  currentCount: number;
  rewardType: 'gold' | 'food' | 'gems';
  rewardAmount: number;
  claimed: boolean;
}

export const DailyQuestsModal: React.FC<DailyQuestsModalProps> = ({
  playerState,
  onClaimReward,
  onClose,
}) => {
  // Compute quest progress from current state
  const [claimedQuests, setClaimedQuests] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('monsterr_claimed_quests');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const quests: Quest[] = [
    {
      id: 'q_monsters_count',
      titleAr: 'توسيع العشيرة (Master Breeder)',
      descAr: 'امتلاك 5 وحوش على الأقل في جزيرتك',
      targetCount: 5,
      currentCount: playerState.monsters.length,
      rewardType: 'gold',
      rewardAmount: 1500,
      claimed: claimedQuests.includes('q_monsters_count'),
    },
    {
      id: 'q_battle_stages',
      titleAr: 'قاهر الساحات (Arena Champion)',
      descAr: 'اجتياز مرحلتين على الأقل في حملة المعارك',
      targetCount: 2,
      currentCount: playerState.completedStages,
      rewardType: 'gems',
      rewardAmount: 25,
      claimed: claimedQuests.includes('q_battle_stages'),
    },
    {
      id: 'q_high_level',
      titleAr: 'صقل القوة (Titan Power)',
      descAr: 'رفع مستوى أي وحش إلى المستوى 12 فما فوق',
      targetCount: 12,
      currentCount: Math.max(...playerState.monsters.map((m) => m.level), 0),
      rewardType: 'food',
      rewardAmount: 800,
      claimed: claimedQuests.includes('q_high_level'),
    },
    {
      id: 'q_habitats',
      titleAr: 'إعمار الجزيرة (Island Builder)',
      descAr: 'امتلاك 6 مبانٍ نشطة على الجزيرة',
      targetCount: 6,
      currentCount: playerState.buildings.length,
      rewardType: 'gold',
      rewardAmount: 2000,
      claimed: claimedQuests.includes('q_habitats'),
    },
  ];

  const handleClaim = (quest: Quest) => {
    if (quest.claimed || quest.currentCount < quest.targetCount) return;

    sound.playVictory();
    const updatedClaimed = [...claimedQuests, quest.id];
    setClaimedQuests(updatedClaimed);
    try {
      localStorage.setItem('monsterr_claimed_quests', JSON.stringify(updatedClaimed));
    } catch {
      // ignore
    }

    const updatedState: PlayerState = {
      ...playerState,
      gold: playerState.gold + (quest.rewardType === 'gold' ? quest.rewardAmount : 0),
      food: playerState.food + (quest.rewardType === 'food' ? quest.rewardAmount : 0),
      gems: playerState.gems + (quest.rewardType === 'gems' ? quest.rewardAmount : 0),
      xp: playerState.xp + 150,
    };

    onClaimReward(updatedState);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-right"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-black text-white">المهام والإنجازات اليومية</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {quests.map((q) => {
            const isCompleted = q.currentCount >= q.targetCount;
            const progressPct = Math.min(100, Math.round((q.currentCount / q.targetCount) * 100));

            return (
              <div
                key={q.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                  q.claimed
                    ? 'bg-slate-950/40 border-slate-850 opacity-60'
                    : isCompleted
                    ? 'bg-amber-950/20 border-amber-500/40 shadow-md'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {q.claimed ? (
                      <CheckCircle2 className="w-5 h-5 text-slate-500 shrink-0" />
                    ) : isCompleted ? (
                      <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600 shrink-0" />
                    )}
                    <div>
                      <h4 className="text-xs font-black text-white">{q.titleAr}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{q.descAr}</p>
                    </div>
                  </div>

                  {/* Reward Badge */}
                  <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 text-xs font-extrabold shrink-0">
                    {q.rewardType === 'gold' && (
                      <>
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-amber-400">+{q.rewardAmount}</span>
                      </>
                    )}
                    {q.rewardType === 'food' && (
                      <>
                        <Wheat className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">+{q.rewardAmount}</span>
                      </>
                    )}
                    {q.rewardType === 'gems' && (
                      <>
                        <Gem className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-cyan-400">+{q.rewardAmount}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress bar and Claim button */}
                <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-850">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-bold">
                      <span>التقدم</span>
                      <span>
                        {q.currentCount} / {q.targetCount} ({progressPct}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isCompleted ? 'bg-amber-400' : 'bg-blue-500'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleClaim(q)}
                    disabled={!isCompleted || q.claimed}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 transition-all ${
                      q.claimed
                        ? 'bg-slate-850 text-slate-500 cursor-not-allowed'
                        : isCompleted
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {q.claimed ? 'تم الاستلام' : isCompleted ? 'استلام المكافأة' : 'قيد التقدم'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
        >
          إغلاق
        </button>
      </motion.div>
    </div>
  );
};
