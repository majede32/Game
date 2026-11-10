import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Monster, MonsterRune, PlayerState, RuneType } from '../types/game';
import {
  RUNE_CONFIGS,
  calculateMonsterRuneBonuses,
  createRuneInstance,
  toRomanNumeral,
} from '../data/monstersData';
import { sound } from '../services/soundEffects';
import { X, Shield, Zap, Sparkles, ChevronRight, Plus, RefreshCw, Info } from 'lucide-react';

interface RuneModalProps {
  playerState: PlayerState;
  onUpdatePlayerState: (updated: PlayerState) => void;
  monsterId?: string;
  onClose: () => void;
}

export const RuneModal: React.FC<RuneModalProps> = ({
  playerState,
  onUpdatePlayerState,
  monsterId,
  onClose,
}) => {
  const [selectedMonsterId, setSelectedMonsterId] = useState<string>(
    monsterId || playerState.monsters[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'equip' | 'forge'>('equip');
  const [filterType, setFilterType] = useState<RuneType | 'all'>('all');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const monster =
    playerState.monsters.find((m) => m.id === selectedMonsterId) ||
    playerState.monsters[0];

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  // Equip a rune from inventory onto monster
  const handleEquipRune = (rune: MonsterRune) => {
    if (!monster) return;
    const currentRunes = monster.runes || [];
    if (currentRunes.length >= 3) {
      showFeedback('تم شغل جميع فتحات الرون الثلاثة لهذا الوحش!');
      return;
    }

    sound.playHeal();

    const updatedMonsters = playerState.monsters.map((m) => {
      if (m.id === monster.id) {
        return {
          ...m,
          runes: [...(m.runes || []), rune],
        };
      }
      return m;
    });

    const updatedInventory = playerState.runesInventory.filter(
      (r) => r.id !== rune.id
    );

    onUpdatePlayerState({
      ...playerState,
      monsters: updatedMonsters,
      runesInventory: updatedInventory,
    });

    showFeedback(`تم تزويد ${rune.nameAr} بنجاح!`);
  };

  // Unequip rune from monster back to inventory
  const handleUnequipRune = (runeIndex: number) => {
    if (!monster || !monster.runes || !monster.runes[runeIndex]) return;
    const removedRune = monster.runes[runeIndex];

    sound.playCoin();

    const updatedMonsters = playerState.monsters.map((m) => {
      if (m.id === monster.id) {
        const nextRunes = [...(m.runes || [])];
        nextRunes.splice(runeIndex, 1);
        return {
          ...m,
          runes: nextRunes,
        };
      }
      return m;
    });

    onUpdatePlayerState({
      ...playerState,
      monsters: updatedMonsters,
      runesInventory: [...playerState.runesInventory, removedRune],
    });

    showFeedback(`تم فك ${removedRune.nameAr} واستعادتها للحقيبة.`);
  };

  // Forge / Combine 3 runes of the same type and level into level+1
  const handleForgeRunes = (type: RuneType, level: number) => {
    const matching = playerState.runesInventory.filter(
      (r) => r.type === type && r.level === level
    );
    if (matching.length < 3) {
      showFeedback('تحتاج إلى 3 رونز من نفس النوع والمستوى لإتمام الترقية!');
      return;
    }

    if (level >= 10) {
      showFeedback('لقد بلغت هذه التعويذة المستوى الأقصى (X)!');
      return;
    }

    sound.playSummonFanfare();

    // Remove 3 runes
    const toRemoveIds = new Set(matching.slice(0, 3).map((r) => r.id));
    const newInventory = playerState.runesInventory.filter(
      (r) => !toRemoveIds.has(r.id)
    );

    // Add upgraded rune
    const upgradedRune = createRuneInstance(type, level + 1);
    newInventory.push(upgradedRune);

    onUpdatePlayerState({
      ...playerState,
      runesInventory: newInventory,
    });

    showFeedback(`تهانينا! تمت ترقية الرونز إلى ${upgradedRune.nameAr}! 🎉`);
  };

  // Filtered inventory
  const filteredInventory = playerState.runesInventory.filter((r) => {
    if (filterType === 'all') return true;
    return r.type === filterType;
  });

  // Calculate current bonuses for the monster
  const bonuses = monster ? calculateMonsterRuneBonuses(monster) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md"
      dir="rtl"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-cinzel">
                مبنى تعويذات الرونز (Runes Building)
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                زوّد وحشك بـ 3 رونز لتعزيز الصحة، القوة الضاربة، وسرعة الفريق
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback alert */}
        <AnimatePresence>
          {feedbackMsg && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-950/80 border-b border-emerald-500/30 text-emerald-300 px-4 py-2 text-xs sm:text-sm text-center font-bold"
            >
              {feedbackMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('equip')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition flex items-center justify-center gap-2 ${
              activeTab === 'equip'
                ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            تزويد وتجهيز الوحش
          </button>
          <button
            onClick={() => setActiveTab('forge')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition flex items-center justify-center gap-2 ${
              activeTab === 'forge'
                ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            ورشة الصهر والترقية (3x ➔ 1x)
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'equip' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left / Monster Card & Slots (5 cols) */}
              <div className="md:col-span-5 flex flex-col gap-4">
                {/* Monster selector dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">
                    اختر الوحش المراد تزويده:
                  </label>
                  <select
                    value={selectedMonsterId}
                    onChange={(e) => setSelectedMonsterId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-purple-500"
                  >
                    {playerState.monsters.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nameAr} (مستوى {m.level} - {m.role})
                      </option>
                    ))}
                  </select>
                </div>

                {monster && (
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center relative overflow-hidden">
                    <img
                      src={monster.avatar}
                      alt={monster.nameAr}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-slate-700 shadow-lg mb-2"
                    />
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {monster.nameAr}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-amber-400 border border-slate-700">
                        المستوى {monster.level}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {monster.role}
                      </span>
                    </div>

                    {/* Active Stat Rune Multipliers */}
                    {bonuses && (
                      <div className="grid grid-cols-2 gap-2 w-full mt-4 text-xs">
                        <div className="bg-emerald-950/40 border border-emerald-900/60 rounded-lg p-2 text-emerald-300 font-bold">
                          💚 صحة: +{bonuses.hpBonusPercent}%
                        </div>
                        <div className="bg-red-950/40 border border-red-900/60 rounded-lg p-2 text-red-300 font-bold">
                          ⚔️ هجوم: +{bonuses.attackBonusPercent}%
                        </div>
                        <div className="bg-blue-950/40 border border-blue-900/60 rounded-lg p-2 text-blue-300 font-bold">
                          ⚡ سرعة: +{bonuses.speedFlatBonus}
                        </div>
                        <div className="bg-amber-950/40 border border-amber-900/60 rounded-lg p-2 text-amber-300 font-bold">
                          🏃 سرعة فريق: +{bonuses.teamSpeedFlatBonus}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3 Equipped Slots */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-xs font-black text-slate-300 uppercase tracking-wider">
                    فتحات التعويذات المجهزة (3/3):
                  </span>
                  {[0, 1, 2].map((slotIdx) => {
                    const rune = monster?.runes?.[slotIdx];
                    if (rune) {
                      const cfg = RUNE_CONFIGS[rune.type];
                      return (
                        <div
                          key={slotIdx}
                          className={`flex items-center justify-between p-3 rounded-xl border ${cfg.borderColor} ${cfg.colorBg} backdrop-blur-sm`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{cfg.icon}</span>
                            <div className="text-right">
                              <p className={`text-xs font-black ${cfg.colorText}`}>
                                {rune.nameAr}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {rune.bonusPercent
                                  ? `+${rune.bonusPercent}%`
                                  : `+${rune.bonusFlat} سرعة`}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleUnequipRune(slotIdx)}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/40 border border-red-500/30 transition"
                          >
                            نزع (Unequip)
                          </button>
                        </div>
                      );
                    }
                    return (
                      <div
                        key={slotIdx}
                        className="flex items-center justify-center p-3.5 rounded-xl border-2 border-dashed border-slate-700/80 bg-slate-950/30 text-slate-500 text-xs font-bold"
                      >
                        <Plus className="w-4 h-4 ml-1.5 opacity-60" />
                        الفتحة {slotIdx + 1}: فارغة — اختر رون من الحقيبة لتزويده
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right / Inventory List (7 cols) */}
              <div className="md:col-span-7 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">
                      حقيبة الرونز المتوفرة:
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-purple-400 border border-slate-700">
                      {playerState.runesInventory.length} رون
                    </span>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                    {(['all', 'life', 'strength', 'speed', 'team_speed'] as const).map(
                      (type) => (
                        <button
                          key={type}
                          onClick={() => setFilterType(type)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                            filterType === type
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {type === 'all'
                            ? 'الكل'
                            : type === 'life'
                            ? '💚 حياة'
                            : type === 'strength'
                            ? '⚔️ قوة'
                            : type === 'speed'
                            ? '⚡ سرعة'
                            : '🏃 فريق'}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {filteredInventory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800">
                    <Info className="w-8 h-8 text-slate-600 mb-2" />
                    <p className="text-sm font-bold text-slate-400">
                      لا توجد رونز في الحقيبة بهذا التصنيف حالياً!
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      اربح معارك دوري الكؤوس أو مراحل الحملة للحصول على المزيد من
                      التعويذات.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                    {filteredInventory.map((rune) => {
                      const cfg = RUNE_CONFIGS[rune.type];
                      return (
                        <div
                          key={rune.id}
                          className={`p-3 rounded-xl border ${cfg.borderColor} bg-slate-950/60 hover:bg-slate-950 transition flex items-center justify-between gap-2`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-2xl shrink-0">{cfg.icon}</span>
                            <div className="truncate text-right">
                              <p className={`text-xs font-black truncate ${cfg.colorText}`}>
                                {rune.nameAr}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {rune.bonusPercent
                                  ? `+${rune.bonusPercent}% ضرر/صحة`
                                  : `+${rune.bonusFlat} سرعة قتالية`}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleEquipRune(rune)}
                            disabled={(monster?.runes || []).length >= 3}
                            className="shrink-0 px-2.5 py-1.5 text-xs font-black rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:hover:bg-purple-600 text-white transition"
                          >
                            تزويد
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Forge / Fusion Tab */
            <div className="space-y-6">
              <div className="bg-purple-950/30 border border-purple-900/50 rounded-2xl p-4 sm:p-5 text-right">
                <h3 className="text-base sm:text-lg font-black text-purple-300 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-purple-400" />
                  ورشة صهر ودمج الرونز الأسطورية
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                  اجمع 3 رونز من نفس النوع والمستوى لدمجها وإنتاج رون واحد من المستوى
                  الأعلى التالي (مثلاً: 3x رون قوة I ينتج 1x رون قوة II).
                </p>
              </div>

              {/* Grouped summary of inventory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(['strength', 'life', 'speed', 'team_speed'] as RuneType[]).map(
                  (type) => {
                    const cfg = RUNE_CONFIGS[type];
                    const typeRunes = playerState.runesInventory.filter(
                      (r) => r.type === type
                    );

                    // Group by level
                    const levelCounts: Record<number, number> = {};
                    typeRunes.forEach((r) => {
                      levelCounts[r.level] = (levelCounts[r.level] || 0) + 1;
                    });

                    return (
                      <div
                        key={type}
                        className={`p-4 rounded-2xl border ${cfg.borderColor} bg-slate-950/70 flex flex-col justify-between gap-4`}
                      >
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{cfg.icon}</span>
                            <span className={`text-sm font-black ${cfg.colorText}`}>
                              {cfg.nameEn}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 font-bold">
                            المجموع: {typeRunes.length}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {[1, 2, 3, 4, 5].map((lvl) => {
                            const count = levelCounts[lvl] || 0;
                            const canForge = count >= 3 && lvl < 10;
                            return (
                              <div
                                key={lvl}
                                className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-slate-900 border border-slate-800"
                              >
                                <span className="text-slate-300 font-bold">
                                  المستوى {toRomanNumeral(lvl)}:
                                </span>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`font-black ${
                                      count >= 3 ? 'text-amber-400' : 'text-slate-400'
                                    }`}
                                  >
                                    x{count}
                                  </span>
                                  {canForge && (
                                    <button
                                      onClick={() => handleForgeRunes(type, lvl)}
                                      className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] transition"
                                    >
                                      صهر 3 ➔ {toRomanNumeral(lvl + 1)}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
