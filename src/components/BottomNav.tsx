import React from 'react';
import { Home, Swords, Sparkles, Flame } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'island' | 'battle' | 'monsters' | 'attacks';
  onSelectTab: (tab: 'island' | 'battle' | 'monsters' | 'attacks') => void;
  monsterCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  monsterCount,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl md:hidden">
      <button
        onClick={() => onSelectTab('island')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
          activeTab === 'island'
            ? 'text-amber-400 font-extrabold scale-105'
            : 'text-slate-400 hover:text-slate-200 font-medium'
        }`}
      >
        <div
          className={`p-1.5 rounded-lg ${
            activeTab === 'island' ? 'bg-amber-500/20 shadow-xs' : 'bg-transparent'
          }`}
        >
          <Home className="w-5 h-5" />
        </div>
        <span className="text-[11px]">الجزيرة</span>
      </button>

      <button
        onClick={() => onSelectTab('battle')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
          activeTab === 'battle'
            ? 'text-red-400 font-extrabold scale-105'
            : 'text-slate-400 hover:text-slate-200 font-medium'
        }`}
      >
        <div
          className={`p-1.5 rounded-lg ${
            activeTab === 'battle' ? 'bg-red-500/20 shadow-xs' : 'bg-transparent'
          }`}
        >
          <Swords className="w-5 h-5" />
        </div>
        <span className="text-[11px]">المعارك 3v3</span>
      </button>

      <button
        onClick={() => onSelectTab('monsters')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative ${
          activeTab === 'monsters'
            ? 'text-purple-400 font-extrabold scale-105'
            : 'text-slate-400 hover:text-slate-200 font-medium'
        }`}
      >
        <div
          className={`p-1.5 rounded-lg ${
            activeTab === 'monsters' ? 'bg-purple-500/20 shadow-xs' : 'bg-transparent'
          }`}
        >
          <Sparkles className="w-5 h-5" />
        </div>
        <span className="text-[11px]">الوحوش</span>
        {monsterCount > 0 && (
          <span className="absolute top-1 right-2 text-[9px] font-bold bg-purple-600 text-white px-1.5 rounded-full">
            {monsterCount}
          </span>
        )}
      </button>

      <button
        onClick={() => onSelectTab('attacks')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
          activeTab === 'attacks'
            ? 'text-orange-400 font-extrabold scale-105'
            : 'text-slate-400 hover:text-slate-200 font-medium'
        }`}
      >
        <div
          className={`p-1.5 rounded-lg ${
            activeTab === 'attacks' ? 'bg-orange-500/20 shadow-xs' : 'bg-transparent'
          }`}
        >
          <Flame className="w-5 h-5" />
        </div>
        <span className="text-[11px]">الهجمات</span>
      </button>
    </nav>
  );
};
