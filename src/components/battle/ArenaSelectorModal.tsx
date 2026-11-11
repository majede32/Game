import React from 'react';
import { REALISTIC_ARENAS } from '../../data/monstersData';
import { MapPin, X, Check } from 'lucide-react';

interface ArenaSelectorModalProps {
  selectedArenaId: string;
  onSelectArena: (arenaId: string) => void;
  onClose: () => void;
}

export const ArenaSelectorModal: React.FC<ArenaSelectorModalProps> = ({
  selectedArenaId,
  onSelectArena,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none" dir="rtl">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-black text-white">
              اختيار ساحة المعركة الواقعية (Realistic Arenas)
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
          اختر البيئة والساحة الواقعية التي ترغب بخوض المعارك فيها (تتغير الخلفية، الإضاءة، والمؤثرات الجوية فورياً):
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto max-h-[60vh] pr-1">
          {REALISTIC_ARENAS.map((arena) => {
            const isSelected = arena.id === selectedArenaId;
            return (
              <div
                key={arena.id}
                onClick={() => onSelectArena(arena.id)}
                className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all flex flex-col ${
                  isSelected
                    ? 'border-amber-400 ring-4 ring-amber-400/40 shadow-xl scale-[1.02]'
                    : 'border-slate-800 hover:border-slate-600 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="relative h-28 w-full bg-slate-950">
                  <img src={arena.image} alt={arena.nameAr} className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>الساحة النشطة</span>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-950/90 flex flex-col justify-between flex-1 gap-1">
                  <h4 className="text-xs font-black text-white">{arena.nameAr}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-snug">
                    {arena.subtitleAr}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-md"
          >
            تأكيد واختيار الساحة
          </button>
        </div>
      </div>
    </div>
  );
};
