import React from 'react';
import { motion } from 'motion/react';
import { DailyQuest, PlayerState } from '../types/game';
import { createRuneInstance } from '../data/monstersData';
import { sound } from '../services/soundEffects';
import { CheckCircle2, Gift, Sparkles, X, Trophy, Coins, Wheat, Gem } from 'lucide-react';

interface DailyQuestsModalProps {
  playerState: PlayerState;
  onUpdatePlayerState: (updated: PlayerState) => void;
  onClose: () => void;
}

export function getDefaultDailyQuests(): DailyQuest[] {
  return [
    {
      id: 'q_battle_2',
      titleAr: 'خوض معارك الحلبة',
      descriptionAr: 'خُض معركتين في خريطة المغامرة أو دوري الكؤوس',
      targetCount: 2,
      currentCount: 0,
      isClaimed: false,
      rewardType: 'gold',
      rewardAmount: 3000,
      icon: '⚔️',
    },
    {
      id: 'q_feed_3',
      titleAr: 'إطعام الوحوش وتنميتها',
      descriptionAr: 'أطعم وحوشك 3 مرات لزيادة قوتها وفتح مهاراتها',
      targetCount: 3,
      currentCount: 0,
      isClaimed: false,
      rewardType: 'gems',
      rewardAmount: 10,
      icon: '🍎',
    },
    {
      id: 'q_summon_1',
      titleAr: 'بوابة الاستدعاء الأسطورية',
      descriptionAr: 'استدعِ وحشاً جديداً من متجر الاستدعاء بالذهب أو الجواهر',
      targetCount: 1,
      currentCount: 0,
      isClaimed: false,
      rewardType: 'gold',
      rewardAmount: 4000,
      icon: '✨',
    },
    {
      id: 'q_rune_1',
      titleAr: 'تجهيز وصهر الرونز',
      descriptionAr: 'جهّز أو اصهر تعويذة رون في مبنى الرونز',
      targetCount: 1,
      currentCount: 0,
      isClaimed: false,
      rewardType: 'rune',
      rewardAmount: 1,
      icon: '💎',
    },
    {
      id: 'q_pvp_win',
      titleAr: 'نصر دوري الكؤوس',
      descriptionAr: 'حقّق فوزاً في دوري الكؤوس أو كولوسيوم الفصائل',
      targetCount: 1,
      currentCount: 0,
      isClaimed: false,
      rewardType: 'gems',
      rewardAmount: 15,
      icon: '🏆',
    },
  ];
}

export const DailyQuestsModal: React.FC<DailyQuestsModalProps> = ({
  playerState,
  onUpdatePlayerState,
  onClose,
}) => {
  const quests = playerState.dailyQuests || getDefaultDailyQuests();

  const completedCount = quests.filter((q) => q.currentCount >= q.targetCount).length;
  const claimedCount = quests.filter((q) => q.isClaimed).length;
  const allCompleted = completedCount >= quests.length;

  const handleClaimQuest = (quest: DailyQuest) => {
    if (quest.isClaimed || quest.currentCount < quest.targetCount) return;

    sound.playCoin();

    let goldAdd = 0;
    let foodAdd = 0;
    let gemsAdd = 0;
    const newRunes = [...(playerState.runesInventory || [])];

    if (quest.rewardType === 'gold') goldAdd = quest.rewardAmount;
    if (quest.rewardType === 'food') foodAdd = quest.rewardAmount;
    if (quest.rewardType === 'gems') gemsAdd = quest.rewardAmount;
    if (quest.rewardType === 'rune') {
      const rewardRune = createRuneInstance('strength', 2);
      newRunes.push(rewardRune);
    }

    const updatedQuests = quests.map((q) => {
      if (q.id === quest.id) {
        return { ...q, isClaimed: true };
      }
      return q;
    });

    onUpdatePlayerState({
      ...playerState,
      gold: playerState.gold + goldAdd,
      food: playerState.food + foodAdd,
      gems: playerState.gems + gemsAdd,
      runesInventory: newRunes,
      dailyQuests: updatedQuests,
    });
  };

  const handleClaimMasterChest = () => {
    if (!allCompleted) return;
    sound.playSummonFanfare();

    const masterRune = createRuneInstance('speed', 3);
    const updatedState: PlayerState = {
      ...playerState,
      gold: playerState.gold + 10000,
      gems: playerState.gems + 50,
      food: playerState.food + 5000,
      runesInventory: [...(playerState.runesInventory || []), masterRune],
    };

    onUpdatePlayerState(updatedState);
    alert('🎉 مبروك! فتحت صندوق المهام اليومية الأكبر: +10,000 ذهب و +50 جوهرة و +5000 طعام ورون سرعة III!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none" dir="rtl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh]"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                المهام اليومية والمكافآت (Daily Quests)
              </h3>
              <p className="text-xs text-slate-400">
                أكمل مهام تدريب الوحوش والمعارك لربح الذهب والجواهر وصندوق المهام الأكبر
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Daily Chest Progress Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-600/30 via-slate-950 to-purple-950/40 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="text-xs font-black text-amber-300">صندوق النخبة اليومي (Master Chest):</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-48 sm:w-64 h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${(completedCount / quests.length) * 100}%` }}
                />
              </div>
              <span className="text-xs font-black text-white">
                {completedCount}/{quests.length} مكتمل
              </span>
            </div>
          </div>

          <button
            onClick={handleClaimMasterChest}
            disabled={!allCompleted}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              allCompleted
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.7)] animate-pulse'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>فتح الصندوق الأكبر (50💎 + 10k💰)</span>
          </button>
        </div>

        {/* Quests List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {quests.map((quest) => {
            const isDone = quest.currentCount >= quest.targetCount;
            const progressPct = Math.min(100, Math.round((quest.currentCount / quest.targetCount) * 100));

            return (
              <div
                key={quest.id}
                className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                  quest.isClaimed
                    ? 'bg-slate-950/40 border-slate-850 opacity-60'
                    : isDone
                    ? 'bg-emerald-950/20 border-emerald-500/50 shadow-md'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl shrink-0">{quest.icon}</span>
                  <div className="truncate text-right">
                    <h4 className="text-xs sm:text-sm font-black text-white truncate">
                      {quest.titleAr}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">{quest.descriptionAr}</p>

                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="w-24 sm:w-32 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {quest.currentCount}/{quest.targetCount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-black text-amber-400">
                    +{quest.rewardAmount}{' '}
                    {quest.rewardType === 'gold'
                      ? 'ذهب'
                      : quest.rewardType === 'gems'
                      ? '💎'
                      : quest.rewardType === 'food'
                      ? 'طعام'
                      : 'رون'}
                  </span>

                  {quest.isClaimed ? (
                    <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      تم الاستلام
                    </span>
                  ) : (
                    <button
                      onClick={() => handleClaimQuest(quest)}
                      disabled={!isDone}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                        isDone
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      استلام
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
