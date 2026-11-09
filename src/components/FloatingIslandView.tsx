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
  Layers,
  MapPin,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronRight,
  Flame,
  Droplets,
  Mountain,
  Moon,
  Warehouse,
  Zap,
  Sprout,
} from 'lucide-react';

interface FloatingIslandViewProps {
  playerState: PlayerState;
  onUpdatePlayerState: (updated: PlayerState) => void;
  onOpenBreeding: () => void;
  onOpenHatchery: () => void;
  onOpenFarm: (buildingId: string) => void;
  onOpenMonsterVault: (monsterId?: string) => void;
}

interface FloatingParticle {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
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
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [floatingParticles, setFloatingParticles] = useState<FloatingParticle[]>([]);

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
            harvestReadyAt: Date.now() + 60000,
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
    if (building.level >= building.maxLevel) {
      alert(`بلغ مبنى ${building.nameAr} الحد الأقصى للمستوى (${building.maxLevel}) بالفعل!`);
      return;
    }

    const cost = building.level * 1200;
    if (playerState.gold < cost) {
      alert(`لا يوجد ذهب كافٍ لترقية هذا المبنى! تحتاج إلى ${cost} ذهب.`);
      return;
    }

    sound.playCoin();
    const updatedBuildings = playerState.buildings.map((b) => {
      if (b.id === building.id) {
        return {
          ...b,
          level: Math.min(b.maxLevel, b.level + 1),
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

  const getBuildingIcon = (type: string, element?: string) => {
    if (type === 'breeding') return <Heart className="w-5 h-5 text-pink-400" />;
    if (type === 'hatchery') return <Egg className="w-5 h-5 text-yellow-400" />;
    if (type === 'farm') return <Wheat className="w-5 h-5 text-emerald-400" />;
    if (type === 'storage') return <Warehouse className="w-5 h-5 text-cyan-400" />;
    if (element === 'fire') return <Flame className="w-5 h-5 text-red-400" />;
    if (element === 'water') return <Droplets className="w-5 h-5 text-blue-400" />;
    if (element === 'earth') return <Mountain className="w-5 h-5 text-amber-500" />;
    if (element === 'dark') return <Moon className="w-5 h-5 text-purple-400" />;
    if (element === 'nature') return <Sprout className="w-5 h-5 text-emerald-400" />;
    if (element === 'thunder') return <Zap className="w-5 h-5 text-yellow-400" />;
    return <Home className="w-5 h-5 text-amber-400" />;
  };

  // Re-spaced coordinates so tokens never collide on mobile
  const getBuildingCoordinates = (buildingId: string) => {
    switch (buildingId) {
      case 'b_breeding':
        return { x: 50, y: 16, shortName: 'التزاوج' };
      case 'b_farm_1':
        return { x: 18, y: 22, shortName: 'المزرعة' };
      case 'b_hatchery':
        return { x: 82, y: 22, shortName: 'الحاضنة' };
      case 'b_habitat_nature':
        return { x: 30, y: 34, shortName: 'موطن الطبيعة' };
      case 'b_habitat_thunder':
        return { x: 70, y: 34, shortName: 'موطن الرعد' };
      case 'b_habitat_fire':
        return { x: 20, y: 48, shortName: 'موطن النار' };
      case 'b_habitat_earth':
        return { x: 50, y: 46, shortName: 'موطن الأرض' };
      case 'b_habitat_dark':
        return { x: 80, y: 50, shortName: 'موطن الظلام' };
      case 'b_habitat_water':
        return { x: 34, y: 75, shortName: 'موطن الماء' };
      case 'b_storage':
        return { x: 70, y: 75, shortName: 'الخزينة' };
      default:
        return { x: 50, y: 50, shortName: 'مبنى' };
    }
  };

  return (
    <div className="relative w-full flex flex-col gap-3 pb-16 md:pb-6">
      {/* View Switcher & Quick Collect Bar */}
      <div className="flex items-center justify-between gap-2 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'map'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>الخريطة الحية</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'list'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>إدارة المباني ({playerState.buildings.length})</span>
          </button>
        </div>

        <button
          onClick={collectAllResources}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-transform active:scale-95"
        >
          <Coins className="w-3.5 h-3.5 fill-current" />
          <span className="hidden sm:inline">جمع كل الموارد</span>
          <span className="sm:hidden">جمع الكل</span>
        </button>
      </div>

      {/* VIEW MODE 1: LIVE INTERACTIVE ISLAND MAP */}
      {viewMode === 'map' && (
        <div className="relative w-full h-[460px] sm:h-[540px] md:h-[640px] rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl select-none">
          {/* Zoom controls */}
          <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.3, z + 0.1))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-xs font-bold"
              title="تكبير"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.85, z - 0.1))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-xs font-bold"
              title="تصغير"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="px-2 py-1 text-[11px] font-bold text-amber-400 hover:bg-slate-800 rounded-lg"
              title="إعادة ضبط"
            >
              100%
            </button>
          </div>

          {/* Island Scene Container with Zoom Scaling */}
          <div
            className="relative w-full h-full transition-transform duration-300 origin-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* HD Background Island */}
            <div
              className="absolute inset-0 bg-cover bg-center pointer-events-none"
              style={{
                backgroundImage: `url('/src/assets/images/floating_island_backdrop_1794261176523.jpg')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-slate-950/20 pointer-events-none" />

            {/* Floating Resource Particles */}
            <AnimatePresence>
              {floatingParticles.map((pt) => (
                <motion.div
                  key={pt.id}
                  initial={{ opacity: 1, y: 0, scale: 0.8 }}
                  animate={{ opacity: 0, y: -45, scale: 1.25 }}
                  exit={{ opacity: 0 }}
                  className={`absolute z-40 text-xs md:text-sm font-black px-2 py-0.5 rounded-lg bg-slate-950/90 border border-slate-700 shadow-xl pointer-events-none ${pt.color}`}
                  style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                >
                  {pt.text}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Spaced Building Pins */}
            {playerState.buildings.map((b) => {
              const { x, y, shortName } = getBuildingCoordinates(b.id);
              const isSelected = selectedBuilding?.id === b.id;
              const monstersHere = getMonstersInBuilding(b);
              const hasGoldReady = (b.goldAccumulated || 0) >= 40;
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
                  className={`absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 ${
                    isSelected ? 'scale-120 z-30' : 'hover:scale-110 z-20'
                  }`}
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  {/* Floating Notification Bubbles above building */}
                  {hasGoldReady && (
                    <button
                      onClick={(e) => collectGold(b, e)}
                      className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] rounded-full shadow-[0_0_12px_rgba(245,158,11,0.9)] border border-yellow-200 animate-bounce whitespace-nowrap"
                    >
                      <Coins className="w-3 h-3 fill-current" />
                      <span>+{b.goldAccumulated}</span>
                    </button>
                  )}

                  {isFarmReady && (
                    <button
                      onClick={(e) => harvestFarm(b, e)}
                      className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] rounded-full shadow-[0_0_12px_rgba(16,185,129,0.9)] border border-emerald-200 animate-bounce whitespace-nowrap"
                    >
                      <Wheat className="w-3 h-3 fill-current" />
                      <span>+{b.foodAccumulated}</span>
                    </button>
                  )}

                  {b.type === 'hatchery' && playerState.eggsInHatchery.length > 0 && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 px-1.5 py-0.5 bg-purple-600 text-white font-bold text-[9px] rounded-full shadow-lg border border-purple-400 animate-pulse whitespace-nowrap">
                      <Egg className="w-2.5 h-2.5" />
                      <span>بيضة جاهزة</span>
                    </div>
                  )}

                  {/* Compact Game Pedestal Token */}
                  <div
                    className={`relative w-12 h-12 md:w-14 md:h-14 rounded-2xl backdrop-blur-md border-2 transition-all shadow-xl flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-amber-500/40 border-amber-400 ring-4 ring-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.8)]'
                        : 'bg-slate-950/85 border-slate-700/80 hover:border-amber-400/80'
                    }`}
                  >
                    {getBuildingIcon(b.type, b.element)}

                    {/* Level Pill */}
                    <span className="absolute -bottom-1 -right-1 bg-slate-900 border border-slate-700 text-amber-400 text-[9px] font-black px-1 rounded-md">
                      Lv.{b.level}
                    </span>

                    {/* Resident Monster Avatar */}
                    {monstersHere.length > 0 && (
                      <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full border border-amber-400 overflow-hidden shadow-sm">
                        <img
                          src={monstersHere[0].avatar}
                          alt={monstersHere[0].name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Clean Single-line label */}
                  <div className="mt-1 text-[10px] md:text-xs font-black text-white text-center bg-slate-950/90 px-2 py-0.5 rounded-md border border-slate-800/80 whitespace-nowrap shadow-md">
                    {shortName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: BUILDINGS DIRECTORY (Perfect for Mobile) */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {playerState.buildings.map((b) => {
            const monstersHere = getMonstersInBuilding(b);
            const hasGold = (b.goldAccumulated || 0) > 0;
            const hasFood = (b.foodAccumulated || 0) > 0;

            return (
              <div
                key={b.id}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between gap-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                      {getBuildingIcon(b.type, b.element)}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white">{b.nameAr}</h4>
                      <span className="text-[11px] text-amber-400 font-bold">
                        المستوى {b.level} / {b.maxLevel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Building Status details */}
                <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                  {b.type === 'habitat' && (
                    <>
                      <span>
                        ذهب مخزن:{' '}
                        <span className="text-amber-400 font-bold">
                          {b.goldAccumulated || 0} / {b.maxGoldCapacity}
                        </span>
                      </span>
                      <span>
                        وحوش:{' '}
                        <span className="text-white font-bold">
                          {monstersHere.length} / {b.maxMonsters}
                        </span>
                      </span>
                    </>
                  )}
                  {b.type === 'farm' && (
                    <>
                      <span>المحصول: {b.currentCrop || 'غير مزروع'}</span>
                      <span className="text-emerald-400 font-bold">
                        +{b.foodAccumulated || 0} طعام
                      </span>
                    </>
                  )}
                  {b.type === 'breeding' && (
                    <span>جبل التزاوج جاهز لتهجين الوحوش وإنتاج البيض</span>
                  )}
                  {b.type === 'hatchery' && (
                    <span>
                      البيوض في الحاضنة:{' '}
                      <span className="text-purple-400 font-bold">
                        {playerState.eggsInHatchery.length}
                      </span>
                    </span>
                  )}
                  {b.type === 'storage' && <span>سعة الخزينة تدعم تطوير جميع المباني</span>}
                </div>

                {/* Direct Action buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                  {b.type === 'habitat' && hasGold && (
                    <button
                      onClick={() => collectGold(b)}
                      className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-xs transition-transform active:scale-95"
                    >
                      جمع الذهب (+{b.goldAccumulated})
                    </button>
                  )}
                  {b.type === 'farm' && (
                    <button
                      onClick={() => onOpenFarm(b.id)}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-xs transition-transform active:scale-95"
                    >
                      {hasFood ? `حصاد (+${b.foodAccumulated})` : 'زراعة محاصيل'}
                    </button>
                  )}
                  {b.type === 'breeding' && (
                    <button
                      onClick={onOpenBreeding}
                      className="flex-1 py-1.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-lg shadow-xs transition-transform active:scale-95"
                    >
                      بدء التزاوج
                    </button>
                  )}
                  {b.type === 'hatchery' && (
                    <button
                      onClick={onOpenHatchery}
                      className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg shadow-xs transition-transform active:scale-95"
                    >
                      فحص البيض
                    </button>
                  )}
                  {b.level < b.maxLevel ? (
                    <button
                      onClick={() => upgradeBuilding(b)}
                      className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-lg transition-transform active:scale-95"
                    >
                      ترقية ({b.level * 1200} ذهب)
                    </button>
                  ) : (
                    <span className="py-1 px-2.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black text-[11px] rounded-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      الحد الأقصى (MAX)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Building Details Drawer */}
      <AnimatePresence>
        {selectedBuilding && viewMode === 'map' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                {getBuildingIcon(selectedBuilding.type, selectedBuilding.element)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-black text-white">{selectedBuilding.nameAr}</h4>
                  <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                    المستوى {selectedBuilding.level} / {selectedBuilding.maxLevel}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {selectedBuilding.maxGoldCapacity && (
                    <span>
                      ذهب: {selectedBuilding.goldAccumulated || 0} /{' '}
                      {selectedBuilding.maxGoldCapacity}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {selectedBuilding.type === 'habitat' && (
                <button
                  onClick={() => collectGold(selectedBuilding)}
                  disabled={(selectedBuilding.goldAccumulated || 0) <= 0}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-xs"
                >
                  جمع الذهب
                </button>
              )}
              {selectedBuilding.type === 'breeding' && (
                <button
                  onClick={onOpenBreeding}
                  className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  فتح التزاوج
                </button>
              )}
              {selectedBuilding.type === 'hatchery' && (
                <button
                  onClick={onOpenHatchery}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  فحص البيض
                </button>
              )}
              {selectedBuilding.type === 'farm' && (
                <button
                  onClick={() => onOpenFarm(selectedBuilding.id)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  زراعة المحاصيل
                </button>
              )}
              {selectedBuilding.level < selectedBuilding.maxLevel ? (
                <button
                  onClick={() => upgradeBuilding(selectedBuilding)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl"
                >
                  ترقية ({selectedBuilding.level * 1200} ذهب)
                </button>
              ) : (
                <span className="px-3 py-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black text-xs rounded-xl flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  الحد الأقصى (MAX)
                </span>
              )}
              <button
                onClick={() => setSelectedBuilding(null)}
                className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QUICK ACTIONS & ISLAND PRODUCTION SUMMARY SHELF (Eliminates mobile blank space) */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-3.5 md:p-4 shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs md:text-sm font-extrabold text-white">
              لوحة التحكم السريع بالجزيرة
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {playerState.buildings.length} مبانٍ نشطة · {playerState.monsters.length} وحوش
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Quick Breeding Shortcut */}
          <button
            onClick={onOpenBreeding}
            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-pink-500/40 text-right transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-pink-500/15 border border-pink-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Heart className="w-4 h-4 text-pink-400" />
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">جبل التزاوج</div>
              <div className="text-[10px] text-pink-400 font-medium truncate">تزاوج وحوش جديدة</div>
            </div>
          </button>

          {/* Quick Hatchery Shortcut */}
          <button
            onClick={onOpenHatchery}
            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/40 text-right transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Egg className="w-4 h-4 text-purple-400" />
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">حاضنة البيض</div>
              <div className="text-[10px] text-purple-400 font-medium truncate">
                {playerState.eggsInHatchery.length > 0
                  ? `${playerState.eggsInHatchery.length} بيضة قيد الفقس`
                  : 'فارغة'}
              </div>
            </div>
          </button>

          {/* Quick Farm Shortcut */}
          <button
            onClick={() => onOpenFarm('b_farm_1')}
            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 text-right transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Wheat className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">مزارع الغذاء</div>
              <div className="text-[10px] text-emerald-400 font-medium truncate">حصاد وزراعة</div>
            </div>
          </button>

          {/* Quick Vault Shortcut */}
          <button
            onClick={() => onOpenMonsterVault()}
            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 text-right transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Home className="w-4 h-4 text-amber-400" />
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">عرين الوحوش</div>
              <div className="text-[10px] text-amber-400 font-medium truncate">
                {playerState.monsters.length} وحش متاح
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
