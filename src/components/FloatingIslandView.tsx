import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IslandBuilding, Monster, PlayerState } from '../types/game';
import { sound } from '../services/soundEffects';
import {
  Coins,
  Wheat,
  Egg,
  Heart,
  ArrowUpCircle,
  Home,
  Sparkles,
  ChevronRight,
  Plus,
  Info,
  Maximize2,
  RefreshCw,
} from 'lucide-react';

interface FloatingIslandViewProps {
  playerState: PlayerState;
  onUpdatePlayerState: (updated: PlayerState) => void;
  onOpenBreeding: () => void;
  onOpenHatchery: () => void;
  onOpenFarm: (buildingId: string) => void;
  onOpenMonsterVault: (monsterId?: string) => void;
}

export const FloatingIslandView: React.FC<FloatingIslandViewProps> = ({
  playerState,
  onUpdatePlayerState,
  onOpenBreeding,
  onOpenHatchery,
  onOpenFarm,
  onOpenMonsterVault,
}) => {
  const [selectedBuilding, setSelectedBuilding] = useState<IslandBuilding | null>(null);
  const [floatingParticles, setFloatingParticles] = useState<
    { id: string; x: number; y: number; text: string; color: string }[]
  >([]);

  const addParticle = (x: number, y: number, text: string, color: string) => {
    const id = `pt_${Date.now()}_${Math.random()}`;
    setFloatingParticles((prev) => [...prev, { id, x, y, text, color }]);
    setTimeout(() => {
      setFloatingParticles((prev) => prev.filter((p) => p.id !== id));
    }, 1200);
  };

  // Collect gold from habitat
  const collectGold = (building: IslandBuilding, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const goldAmount = building.goldAccumulated || 0;
    if (goldAmount <= 0) return;

    sound.playCoin();
    addParticle(building.x, building.y, `+${goldAmount} ذهب`, 'text-amber-400');

    const updatedBuildings = playerState.buildings.map((b) =>
      b.id === building.id ? { ...b, goldAccumulated: 0 } : b
    );

    const updated = {
      ...playerState,
      gold: playerState.gold + goldAmount,
      buildings: updatedBuildings,
    };

    onUpdatePlayerState(updated);
    if (selectedBuilding?.id === building.id) {
      setSelectedBuilding({ ...selectedBuilding, goldAccumulated: 0 });
    }
  };

  // Harvest food from farm
  const harvestFarm = (building: IslandBuilding, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const foodAmount = building.foodAccumulated || 150;

    sound.playCoin();
    addParticle(building.x, building.y, `+${foodAmount} طعام`, 'text-emerald-400');

    const updatedBuildings = playerState.buildings.map((b) =>
      b.id === building.id
        ? {
            ...b,
            foodAccumulated: 0,
            harvestReadyAt: Date.now() + 60000, // next harvest in 1 min
          }
        : b
    );

    const updated = {
      ...playerState,
      food: playerState.food + foodAmount,
      buildings: updatedBuildings,
    };

    onUpdatePlayerState(updated);
  };

  // Upgrade building
  const upgradeBuilding = (building: IslandBuilding) => {
    const cost = building.level * 1200;
    if (playerState.gold < cost) {
      alert('لا يوجد ذهب كافٍ لترقية هذا المبنى!');
      return;
    }

    sound.playCoin();
    const updatedBuildings = playerState.buildings.map((b) => {
      if (b.id === building.id) {
        return {
          ...b,
          level: b.level + 1,
          maxGoldCapacity: b.maxGoldCapacity ? Math.round(b.maxGoldCapacity * 1.5) : undefined,
          maxMonsters: b.maxMonsters ? b.maxMonsters + 1 : undefined,
        };
      }
      return b;
    });

    const updated = {
      ...playerState,
      gold: playerState.gold - cost,
      xp: playerState.xp + 200,
      buildings: updatedBuildings,
    };

    onUpdatePlayerState(updated);
    setSelectedBuilding(updatedBuildings.find((b) => b.id === building.id) || null);
  };

  // Collect All Quick Action
  const collectAllResources = () => {
    let totalGold = 0;
    let totalFood = 0;

    const updatedBuildings = playerState.buildings.map((b) => {
      if (b.goldAccumulated && b.goldAccumulated > 0) {
        totalGold += b.goldAccumulated;
        return { ...b, goldAccumulated: 0 };
      }
      if (b.type === 'farm' && (b.foodAccumulated || 0) > 0) {
        totalFood += b.foodAccumulated || 150;
        return { ...b, foodAccumulated: 0, harvestReadyAt: Date.now() + 60000 };
      }
      return b;
    });

    if (totalGold > 0 || totalFood > 0) {
      sound.playCoin();
      addParticle(50, 50, `+${totalGold} ذهب  +${totalFood} طعام`, 'text-yellow-300');
      onUpdatePlayerState({
        ...playerState,
        gold: playerState.gold + totalGold,
        food: playerState.food + totalFood,
        buildings: updatedBuildings,
      });
    }
  };

  const getMonstersInBuilding = (b: IslandBuilding): Monster[] => {
    return playerState.monsters.filter((m) => b.monsterIds.includes(m.id));
  };

  return (
    <div className="relative w-full flex flex-col gap-4">
      {/* Island Canvas Viewport */}
      <div className="relative w-full aspect-[16/10] md:aspect-[16/9] max-h-[720px] rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl select-none">
        {/* Floating Sky Island HD Art Background */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 pointer-events-none"
          style={{ backgroundImage: `url('/src/assets/images/floating_island_backdrop_1794261176523.jpg')` }}
        />

        {/* Ambient Cloud & Lighting Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/20 pointer-events-none" />

        {/* Floating Resource Particles */}
        <AnimatePresence>
          {floatingParticles.map((pt) => (
            <motion.div
              key={pt.id}
              initial={{ opacity: 1, y: 0, scale: 0.8 }}
              animate={{ opacity: 0, y: -45, scale: 1.25 }}
              exit={{ opacity: 0 }}
              className={`absolute z-40 text-sm font-black px-2.5 py-1 rounded-lg bg-slate-950/90 border border-slate-700 shadow-xl pointer-events-none ${pt.color}`}
              style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
            >
              {pt.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Interactive Buildings Sprinkled on Island */}
        {playerState.buildings.map((b) => {
          const isSelected = selectedBuilding?.id === b.id;
          const monstersHere = getMonstersInBuilding(b);
          const hasGoldReady = (b.goldAccumulated || 0) >= 50;
          const isFarmReady = b.type === 'farm' && (b.foodAccumulated || 0) > 0;

          return (
            <div
              key={b.id}
              onClick={() => {
                setSelectedBuilding(b);
                if (b.type === 'breeding') onOpenBreeding();
                else if (b.type === 'hatchery') onOpenHatchery();
                else if (b.type === 'farm') onOpenFarm(b.id);
              }}
              className={`absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 group ${
                isSelected ? 'scale-115 z-30' : 'hover:scale-110 z-20'
              }`}
              style={{ left: `${b.x}%`, top: `${b.y}%` }}
            >
              {/* Floating Collect Bubble above building if gold/food ready */}
              {hasGoldReady && (
                <button
                  onClick={(e) => collectGold(b, e)}
                  className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-full shadow-[0_0_15px_rgba(245,158,11,0.8)] border border-yellow-200 animate-bounce whitespace-nowrap"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>+{b.goldAccumulated}</span>
                </button>
              )}

              {isFarmReady && (
                <button
                  onClick={(e) => harvestFarm(b, e)}
                  className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)] border border-emerald-200 animate-bounce whitespace-nowrap"
                >
                  <Wheat className="w-3.5 h-3.5" />
                  <span>+{b.foodAccumulated}</span>
                </button>
              )}

              {b.type === 'hatchery' && playerState.eggsInHatchery.length > 0 && (
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 bg-purple-600 text-white font-bold text-[10px] rounded-full shadow-lg border border-purple-400 animate-pulse whitespace-nowrap">
                  <Egg className="w-3 h-3" />
                  <span>بيضة جاهزة</span>
                </div>
              )}

              {/* Building Isometric Token / Pedestal */}
              <div
                className={`relative p-2.5 rounded-2xl backdrop-blur-md border-2 transition-all shadow-xl flex flex-col items-center justify-center min-w-[76px] ${
                  isSelected
                    ? 'bg-amber-500/30 border-amber-400 ring-4 ring-amber-400/40 shadow-[0_0_25px_rgba(245,158,11,0.6)]'
                    : 'bg-slate-900/85 border-slate-700/80 group-hover:border-amber-400/60'
                }`}
              >
                {/* Building Icon / Mini graphics */}
                <div className="w-10 h-10 rounded-xl bg-slate-800/90 flex items-center justify-center shadow-inner">
                  {b.type === 'habitat' && <Home className="w-5 h-5 text-amber-400" />}
                  {b.type === 'breeding' && <Heart className="w-5 h-5 text-pink-400" />}
                  {b.type === 'hatchery' && <Egg className="w-5 h-5 text-yellow-400" />}
                  {b.type === 'farm' && <Wheat className="w-5 h-5 text-emerald-400" />}
                  {b.type === 'storage' && <Coins className="w-5 h-5 text-cyan-400" />}
                </div>

                {/* Building Level Tag */}
                <span className="text-[10px] font-extrabold text-white mt-1">Lv.{b.level}</span>

                {/* Monster Mini Avatar strolling in habitat */}
                {monstersHere.length > 0 && (
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full border-2 border-amber-400 overflow-hidden shadow-md">
                    <img
                      src={monstersHere[0].avatar}
                      alt={monstersHere[0].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Building Label */}
              <div className="mt-1 text-[11px] font-bold text-white text-center bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800 whitespace-nowrap shadow-sm">
                {b.nameAr}
              </div>
            </div>
          );
        })}

        {/* Quick Island Action Bar Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 z-20 pointer-events-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={collectAllResources}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95"
            >
              <Coins className="w-4 h-4 fill-current" />
              <span>جمع كل الذهب والغذاء</span>
            </button>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
            <span>المباني: {playerState.buildings.length}</span>
            <span>·</span>
            <span>الوحوش: {playerState.monsters.length}</span>
          </div>
        </div>
      </div>

      {/* Selected Building Details Drawer */}
      <AnimatePresence>
        {selectedBuilding && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="p-5 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                {selectedBuilding.type === 'habitat' && <Home className="w-7 h-7 text-amber-400" />}
                {selectedBuilding.type === 'breeding' && (
                  <Heart className="w-7 h-7 text-pink-400" />
                )}
                {selectedBuilding.type === 'hatchery' && (
                  <Egg className="w-7 h-7 text-yellow-400" />
                )}
                {selectedBuilding.type === 'farm' && (
                  <Wheat className="w-7 h-7 text-emerald-400" />
                )}
                {selectedBuilding.type === 'storage' && (
                  <Coins className="w-7 h-7 text-cyan-400" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">{selectedBuilding.nameAr}</h3>
                  <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                    المستوى {selectedBuilding.level}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                  {selectedBuilding.maxGoldCapacity && (
                    <span>
                      السعة: {selectedBuilding.goldAccumulated || 0} /{' '}
                      {selectedBuilding.maxGoldCapacity} ذهب
                    </span>
                  )}
                  {selectedBuilding.maxMonsters && (
                    <span>
                      الوحوش: {getMonstersInBuilding(selectedBuilding).length} /{' '}
                      {selectedBuilding.maxMonsters}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions for Selected Building */}
            <div className="flex flex-wrap items-center gap-3">
              {selectedBuilding.type === 'habitat' && (
                <button
                  onClick={() => collectGold(selectedBuilding)}
                  disabled={(selectedBuilding.goldAccumulated || 0) <= 0}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  جمع {selectedBuilding.goldAccumulated || 0} ذهب
                </button>
              )}

              {selectedBuilding.type === 'breeding' && (
                <button
                  onClick={onOpenBreeding}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  فتح جبل التزاوج
                </button>
              )}

              {selectedBuilding.type === 'hatchery' && (
                <button
                  onClick={onOpenHatchery}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  فحص الحاضنة والبيض
                </button>
              )}

              {selectedBuilding.type === 'farm' && (
                <button
                  onClick={() => onOpenFarm(selectedBuilding.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  زراعة المحاصيل
                </button>
              )}

              {/* Upgrade Button */}
              {selectedBuilding.level < selectedBuilding.maxLevel ? (
                <button
                  onClick={() => upgradeBuilding(selectedBuilding)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-all"
                >
                  <ArrowUpCircle className="w-4 h-4 text-emerald-400" />
                  <span>ترقية المبنى ({selectedBuilding.level * 1200} ذهب)</span>
                </button>
              ) : (
                <span className="text-xs text-slate-500 font-bold px-3 py-2">
                  الحد الأقصى للمستوى
                </span>
              )}

              <button
                onClick={() => setSelectedBuilding(null)}
                className="px-3 py-2 text-xs text-slate-400 hover:text-white"
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
