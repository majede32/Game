import React from 'react';
import { PlayerState } from '../types/game';
import { Coins, Wheat, Gem, Volume2, VolumeX, Swords, Home, Sparkles, Flame } from 'lucide-react';

interface TopNavProps {
  playerState: PlayerState;
  activeTab: 'island' | 'battle' | 'monsters' | 'attacks';
  onSelectTab: (tab: 'island' | 'battle' | 'monsters' | 'attacks') => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  playerState,
  activeTab,
  onSelectTab,
  isMuted,
  onToggleMute,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-3 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Level */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-lg sm:text-2xl font-black tracking-wider text-amber-400 select-none">
            MONSTERR
          </span>
          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
            Lv.{playerState.level}
          </span>
        </div>

        {/* Desktop Tabs (Only visible on md+ screens; mobile uses BottomNav) */}
        <nav className="hidden md:flex items-center gap-2">
          <button
            onClick={() => onSelectTab('island')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'island'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>الجزيرة</span>
          </button>

          <button
            onClick={() => onSelectTab('battle')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'battle'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>المعارك 3v3</span>
          </button>

          <button
            onClick={() => onSelectTab('monsters')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'monsters'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>الوحوش ({playerState.monsters.length})</span>
          </button>

          <button
            onClick={() => onSelectTab('attacks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'attacks'
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>الهجمات الأصلية</span>
          </button>
        </nav>

        {/* Currency & Audio Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Gold */}
          <div className="flex items-center gap-1 text-xs font-extrabold text-amber-400 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
            <Coins className="w-3.5 h-3.5" />
            <span className="font-mono tabular-nums">{playerState.gold.toLocaleString()}</span>
          </div>

          {/* Food */}
          <div className="flex items-center gap-1 text-xs font-extrabold text-emerald-400 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
            <Wheat className="w-3.5 h-3.5" />
            <span className="font-mono tabular-nums">{playerState.food.toLocaleString()}</span>
          </div>

          {/* Gems */}
          <div className="flex items-center gap-1 text-xs font-extrabold text-cyan-400 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
            <Gem className="w-3.5 h-3.5" />
            <span className="font-mono tabular-nums">{playerState.gems}</span>
          </div>

          {/* Audio Mute Button */}
          <button
            onClick={onToggleMute}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title={isMuted ? 'تفعيل الصوت' : 'كتم الصوت'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
