import React from 'react';
import { Monster } from '../../types/game';
import { ELEMENT_COLORS } from '../../data/monstersData';
import { X, Check, Users } from 'lucide-react';

interface TeamSelectorModalProps {
  monsters: Monster[];
  selectedMonsterIds: string[];
  onToggleMonster: (monsterId: string) => void;
  onClose: () => void;
}

export const TeamSelectorModal: React.FC<TeamSelectorModalProps> = ({
  monsters,
  selectedMonsterIds,
  onToggleMonster,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none" dir="rtl">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 max-h-[88vh]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base sm:text-lg font-black text-white">
              اختيار تشكيلة المعركة ({selectedMonsterIds.length}/3 وحوش)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          اختر 3 وحوش لتمثيل فريقك في المعارك القادمة:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[55vh] pr-1">
          {monsters.map((monster) => {
            const isSelected = selectedMonsterIds.includes(monster.id);
            const elemColor = ELEMENT_COLORS[monster.element] || ELEMENT_COLORS.fire;

            return (
              <div
                key={monster.id}
                onClick={() => onToggleMonster(monster.id)}
                className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/40 ring-2 ring-cyan-400/40'
                    : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                }`}
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                  <img src={monster.avatar} alt={monster.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 flex flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white">{monster.nameAr.split(' ')[0]}</span>
                    <span className="text-amber-400 font-mono text-[11px] font-bold">Lvl {monster.level}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className={`px-1.5 py-0.5 rounded font-bold ${elemColor.bg} ${elemColor.text}`}>
                      {elemColor.nameAr.split(' ')[0]}
                    </span>
                    <span>{monster.maxHp} HP</span>
                    <span>{monster.attack} هجوم</span>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                    isSelected ? 'bg-cyan-500 border-cyan-300 text-slate-950' : 'border-slate-700'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black rounded-xl text-xs shadow-md"
          >
            تأكيد التشكيلة
          </button>
        </div>
      </div>
    </div>
  );
};
