import React from 'react';
import { PlayerState } from '../types/game';
import { sound } from '../services/soundEffects';
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
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xl md:text-2xl font-black tracking-wider text-amber-400 uppercase select-none">
            MONSTERR
          </span>
          <span className="text-xs text-slate-400 font-bold hidden sm:inline">
            Lv.{playerState.level}
          </span>
        </div>

        {/* Zone 2: Navigation Links (single-line, clean tabs) */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1">
          <button
            onClick={() => onSelectTab('island')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'island'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>الجزيرة</span>
          </button>

          <button
            onClick={() => onSelectTab('battle')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'battle'
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>المعارك 3v3</span>
          </button>

          <button
            onClick={() => onSelectTab('monsters')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'monsters'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>الوحوش ({playerState.monsters.length})</span>
          </button>

          <button
            onClick={() => onSelectTab('attacks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'attacks'
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>الهجمات الأصلية (VFX)</span>
          </button>
        </nav>

        {/* Zone 3: Resources & Sound Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Gold */}
          <div className="flex items-center gap-1 text-xs font-extrabold text-amber-400">
            <Coins className="w-3.5 h-3.5" />
            <span className="font-mono tabular-nums">{playerState.gold.toLocaleString()}</span>
          </div>

          {/* Food */}
          <div className="hidden sm:flex items-center gap-1 text-xs font-extrabold text-emerald-400">
            <Wheat className="w-3.5 h-3.5" />
            <span className="font-mono tabular-nums">{playerState.food.toLocaleString()}</span>
          </div>

          {/* Gems */}
          <div className="hidden md:flex items-center gap-1 text-xs font-extrabold text-cyan-400">
            <Gem className="w-3.5 h-3.5" />
            <span className="font-mono tabular-nums">{playerState.gems}</span>
          </div>

          {/* Sound Mute Button */}
          <button
            onClick={onToggleMute}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title={isMuted ? 'تفعيل الصوت' : 'كتم الصوت'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
