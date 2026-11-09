import React, { useState, useEffect } from 'react';
import { PlayerState, MonsterEgg } from './types/game';
import { loadSavedGameState, saveGameState } from './data/initialGameState';
import { TopNav } from './components/TopNav';
import { FloatingIslandView } from './components/FloatingIslandView';
import { BattleView } from './components/BattleView';
import { MonsterVaultView } from './components/MonsterVaultView';
import { OriginalAttacksViewer } from './components/OriginalAttacksViewer';
import { BreedingModal } from './components/BreedingModal';
import { HatcheryModal } from './components/HatcheryModal';
import { FarmModal } from './components/FarmModal';
import { BottomNav } from './components/BottomNav';
import { sound } from './services/soundEffects';

export default function App() {
  const [playerState, setPlayerState] = useState<PlayerState>(() => loadSavedGameState());
  const [activeTab, setActiveTab] = useState<'island' | 'battle' | 'monsters' | 'attacks'>('island');
  const [isMuted, setIsMuted] = useState<boolean>(sound.isMuted);

  // Modals state
  const [showBreeding, setShowBreeding] = useState<boolean>(false);
  const [showHatchery, setShowHatchery] = useState<boolean>(false);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [selectedVaultMonsterId, setSelectedVaultMonsterId] = useState<string | undefined>(undefined);

  // Automatically save state on change
  useEffect(() => {
    saveGameState(playerState);
  }, [playerState]);

  // Periodic passive gold generation simulation (1 gold every 5 seconds per monster)
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayerState((prev) => {
        let goldGenerated = 0;
        const updatedBuildings = prev.buildings.map((b) => {
          if (b.type === 'habitat' && b.monsterIds.length > 0) {
            const added = b.monsterIds.length * 15;
            const current = b.goldAccumulated || 0;
            const maxCap = b.maxGoldCapacity || 600;
            const newAccum = Math.min(maxCap, current + added);
            return { ...b, goldAccumulated: newAccum };
          }
          return b;
        });

        return {
          ...prev,
          buildings: updatedBuildings,
        };
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleUpdatePlayerState = (updated: PlayerState) => {
    setPlayerState(updated);
  };

  const handleToggleMute = () => {
    sound.isMuted = !sound.isMuted;
    setIsMuted(sound.isMuted);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header Navigation */}
      <TopNav
        playerState={playerState}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-4 md:p-6 flex flex-col">
        {activeTab === 'island' && (
          <FloatingIslandView
            playerState={playerState}
            onUpdatePlayerState={handleUpdatePlayerState}
            onOpenBreeding={() => setShowBreeding(true)}
            onOpenHatchery={() => setShowHatchery(true)}
            onOpenFarm={(bId) => setSelectedFarmId(bId)}
            onOpenMonsterVault={(mId) => {
              setSelectedVaultMonsterId(mId);
              setActiveTab('monsters');
            }}
          />
        )}

        {activeTab === 'battle' && (
          <BattleView
            playerState={playerState}
            onBattleEnd={(updatedState, victory) => {
              handleUpdatePlayerState(updatedState);
            }}
            onReturnToIsland={() => setActiveTab('island')}
          />
        )}

        {activeTab === 'monsters' && (
          <MonsterVaultView
            playerState={playerState}
            onUpdatePlayerState={handleUpdatePlayerState}
            selectedMonsterId={selectedVaultMonsterId}
          />
        )}

        {activeTab === 'attacks' && <OriginalAttacksViewer />}
      </main>

      {/* Breeding Mountain Modal */}
      {showBreeding && (
        <BreedingModal
          playerState={playerState}
          onClose={() => setShowBreeding(false)}
          onCompleteBreeding={(newEgg, updatedState) => {
            handleUpdatePlayerState(updatedState);
          }}
        />
      )}

      {showHatchery && (
        <HatcheryModal
          playerState={playerState}
          onClose={() => setShowHatchery(false)}
          onMonsterHatched={(updatedState) => {
            handleUpdatePlayerState(updatedState);
          }}
        />
      )}

      {selectedFarmId && (
        <FarmModal
          buildingId={selectedFarmId}
          playerState={playerState}
          onClose={() => setSelectedFarmId(null)}
          onUpdateState={(updatedState) => {
            handleUpdatePlayerState(updatedState);
          }}
        />
      )}

      {/* Mobile Bottom Navigation Dock */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        monsterCount={playerState.monsters.length}
      />

      {/* Footer / Status Note */}
      <footer className="border-t border-slate-900 bg-slate-950 py-3 px-4 text-center text-xs text-slate-500 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MONSTERR Offline Engine · محاكي Monster Legends الكامل</span>
          <span>حفظ تلقائي للملفات محلياً (Offline Storage Active)</span>
        </div>
      </footer>
    </div>
  );
}
